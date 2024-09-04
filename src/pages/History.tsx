import { StyleSheet, Text, View, Button, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Recipe {
  id: number;
  title: string;
  ingredients?: string[];
}

export default function History() {
  const [data, setData] = useState<Recipe[] | null>(null);

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('history');
      if (jsonValue !== null) {
        setData(JSON.parse(jsonValue));
      } else {
        console.log("No data");
        setData([]);
      }
    } catch (e) {
      console.error("Error retrieving data:", e);
    }
  };

  const deleteItem = async (itemToDelete: Recipe) => {
    if (data) {
      const updatedData = data.filter(item => item.id !== itemToDelete.id);
      setData(updatedData);
      await AsyncStorage.setItem('history', JSON.stringify(updatedData));
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Search History</Text>
      {data && data.length > 0 ? (
        <View style={{ marginTop: 20 }}>
          {data.map((item) => (
            <View key={item.id} style={styles.itemContainer}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Button title="Delete" onPress={() => deleteItem(item)} />
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.noDataText}>No search history found.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  itemContainer: {
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
  },
  itemTitle: {
    fontSize: 18,
    color: '#000',
  },
  noDataText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
  },
});
