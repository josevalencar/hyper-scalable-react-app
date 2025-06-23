import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/screens/HomeScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import AuthContainer from './src/screens/Auth/AuthContainer';
import './global.css';
import { SafeAreaView } from 'react-native';
import AddBookScreen from './src/screens/AddBookScreen';
import { StackNavigationProp } from '@react-navigation/stack';
import ProfileScreen from './src/screens/ProfileScreen';
import BookDetailScreen from './src/screens/BookDetailScreen';
import BookReaderScreen from './src/screens/BookReaderScreen';

const Stack = createStackNavigator();

type RootStackParamList = {
  Onboarding: undefined;
  Auth: undefined;
  Home: undefined;
  AddBook: undefined;
  Profile: undefined;
  BookDetail: undefined;
  BookReader: undefined;
};

export default function App() {
  return (
    <NavigationContainer>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
        <Stack.Navigator initialRouteName="Onboarding" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Onboarding">
            {({ navigation }) => (
              <OnboardingScreen
                onLogin={() => navigation.navigate('Auth')}
                onRegister={() => navigation.navigate('Auth')}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="Auth">
            {({ navigation }) => (
              <AuthContainer
                onAuthSuccess={() => navigation.reset({ index: 0, routes: [{ name: 'Home' }] })}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="AddBook" component={AddBookScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="BookDetail" component={BookDetailScreen} />
          <Stack.Screen name="BookReader" component={BookReaderScreen} />
        </Stack.Navigator>
      </SafeAreaView>
    </NavigationContainer>
  );
}
