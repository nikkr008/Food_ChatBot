import { StyleSheet, Text, View, Button, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Shop() {
  const [data, setData] = useState<string[] | null>(null);

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('shop');
      if (jsonValue !== null) {
        setData(JSON.parse(jsonValue));
      } else {
        console.log("No data");
      }
    } catch (e) {
      console.error("Error retrieving data:", e);
    }
  };

  const deleteItem = async (itemToDelete: string) => {
    if (data) {
      const updatedData = data.filter(item => item !== itemToDelete);
      setData(updatedData);
      await AsyncStorage.setItem('shop', JSON.stringify(updatedData));
    }
  };

  return (
    <ScrollView style={styles.container}>

      <Text style={styles.header}>Shoping List</Text>
      {data && (
        <View style={{ marginTop: 20 }}>
          {data.map((item, index) => (
            <View key={index} style={styles.itemContainer}>
              <Text style={{color: '#000'}}>{item}</Text>
              <Button title="Delete" onPress={() => deleteItem(item)} />
            </View>
          ))}
        </View>
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
    marginLeft:'25%',
  },
  itemContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
});
