import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';

import Home from '../pages/Home';
import Shop from '../pages/Shop';
import History from '../pages/History';

type TabParamList = {
  Home: undefined;
  History: undefined;
  Shop: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

export default function Route() {
  return (
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ color, size }) => {
              let iconName : string;
              switch (route.name) {
                case 'Home':
                  iconName = 'chatbubbles';
                  break;
                case 'History':
                  iconName = 'person';
                  break;
                case 'Shop':
                  iconName = 'bag';
                  break;
                default:
                  iconName = 'help-circle';
              }
              return <Icon name={iconName} size={30} color={color} />;
            },
          })}
        >
          <Tab.Screen name="History" component={History} />
          <Tab.Screen name="Home" component={Home} />
          <Tab.Screen name="Shop" component={Shop} />
        </Tab.Navigator>
  )
}

const styles = StyleSheet.create({})