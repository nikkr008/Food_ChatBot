import * as React from 'react';
import { View } from 'react-native';
import Route from './src/routes/Route';
import { NavigationContainer } from '@react-navigation/native';

export default function App() {
  return (
    <NavigationContainer>
      <Route/>
    </NavigationContainer>
  );
}
