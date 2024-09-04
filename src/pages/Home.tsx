import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Button,
  Text,
  FlatList,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  ScrollView
} from 'react-native';
import Voice from '@react-native-voice/voice';
import { LogBox } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

LogBox.ignoreLogs(['new NativeEventEmitter']);

interface Message {
  id: string;
  text: string;
  fromUser: boolean;
}

interface Recipe {
  id: number;
  title: string;
  ingredients?: string[];
}

export default function App() {
  const [input, setInput] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [shop, setShop] = useState<string[]>([]);
  const [historyData, setHistoryData] = useState<Recipe[]>([]);

console.log(shop);
  useEffect(() => {
    Voice.onSpeechResults = onSpeechResultsHandler;
    loadShop();
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const onSpeechResultsHandler = (event: any) => {
    const speechText = event.value[0];
    if (speechText) {
      setInput(speechText);
      addMessage(speechText, true);
      fetchRecipes(speechText);
    }
  };

  const startListening = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Permission to use microphone denied');
        return;
      }
    }

    try {
      setIsListening(true);
      await Voice.start('en-US');
    } catch (error) {
      console.error('Error starting voice recognition:', error);
    }
  };

  const stopListening = async () => {
    try {
      setIsListening(false);
      await Voice.stop();
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
    }
  };

  const addMessage = (text: string, fromUser: boolean) => {
    const newMessage: Message = {
      id: Math.random().toString(),
      text,
      fromUser,
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  const fetchRecipes = async (query: string) => {
    addMessage('Fetching recipes...', false);
    try {
      const response = await fetch(
        `https://api.spoonacular.com/recipes/complexSearch?query=${query}&apiKey=72aa38298bd743debc60064344b3045a`
      );
      const data = await response.json();
      const recipesData: Recipe[] = data.results;

      if (recipesData.length > 0) {
        setRecipes(recipesData);
        const recipeTitles = recipesData.map((recipe) => recipe.title).join(', ');
        addMessage(`I found these recipes: ${recipeTitles}`, false);
      } else {
        addMessage('No recipes found. Please try another query.', false);
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
      addMessage('Sorry, there was an error fetching recipes.', false);
    }
  };

  const sendMessage = () => {
    if (input.trim()) {
      addMessage(input, true);
      fetchRecipes(input);
      setInput('');
    }
  };
  const loadHistoryData = async () => {
    try {
      const storedHistory = await AsyncStorage.getItem('history');
      if (storedHistory) {
        setHistoryData(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error('Error loading history data:', error);
    }
  };

  const saveToHistory = async (recipe: Recipe) => {
    const newHistory = [...historyData, recipe];
    setHistoryData(newHistory);
    try {
      await AsyncStorage.setItem('history', JSON.stringify(newHistory));
    } catch (e) {
      console.error('Error saving history:', e);
    }
  };

  const fetchRecipeDetails = async (id: number) => {
    try {
      const response = await fetch(
        `https://api.spoonacular.com/recipes/${id}/information?apiKey=72aa38298bd743debc60064344b3045a`
      );
      const recipe = await response.json();
      saveToHistory(recipe); 
      const ingredients = recipe.extendedIngredients.map((ing: any) => ing.original);
      addMessage(`Ingredients: ${ingredients.join(', ')}`, false);
      addMessage(`Instructions: ${recipe.instructions}`, false);

      setRecipes((prevRecipes) =>
        prevRecipes.map((r) =>
          r.id === id ? { ...r, ingredients: ingredients } : r
        )
      );
    } catch (error) {
      console.error('Error fetching recipe details:', error);
      addMessage('Sorry, there was an error fetching recipe details.', false);
    }
  };

  const addToShop = async (ingredient: string) => {
    const newShop = [...shop, ingredient];
    setShop(newShop);
    await AsyncStorage.setItem('shop', JSON.stringify(newShop));
    addMessage(`${ingredient} has been added to your shopping list.`, false);
  };

  const loadShop = async () => {
    try {
      const storedShop = await AsyncStorage.getItem('shop');
      if (storedShop) {
        setShop(JSON.parse(storedShop));
      }
    } catch (error) {
      console.error('Error loading shopping list:', error);
    }
  };

  const renderRecipeDetails = (recipe: Recipe) => {
    return (
      <View style={styles.recipeContainer}>
        <Text style={styles.recipeTitle}>{recipe.title}</Text>
        <Button title="View Details" onPress={() => fetchRecipeDetails(recipe.id)} />
        {recipe.ingredients && recipe.ingredients.map((ingredient: string) => (
          <View key={ingredient} style={styles.ingredientContainer}>
            <Text style={{color: '#000'}}>{ingredient}</Text>
            <Button title="Add to Shop" onPress={() => addToShop(ingredient)} />
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageContainer,
              { alignSelf: item.fromUser ? 'flex-end' : 'flex-start' },
            ]}
          >
            <Text style={{ color: item.fromUser ? '#FFF' : '#000' }}>{item.text}</Text>
          </View>
        )}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message"
          value={input}
          onChangeText={setInput}
        />
        <Button title="Send" onPress={sendMessage} />
        <TouchableOpacity
          style={[styles.voiceButton, { backgroundColor: isListening ? 'red' : '#007AFF' }]}
          onPress={isListening ? stopListening : startListening}
        >
          <Text style={styles.voiceButtonText}>{isListening ? 'Stop' : 'Voice'}</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => renderRecipeDetails(item)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 8,
    color: '#000'
  },
  voiceButton: {
    marginLeft: 8,
    padding: 10,
    borderRadius: 50,
  },
  voiceButtonText: {
    color: '#FFF',
  },
  recipeContainer: {
    marginTop: 10,
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
  },
  recipeTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: 'gray'
  },
  messageContainer: {
    backgroundColor: '#DDDDDD',
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
  },
  ingredientContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
});
