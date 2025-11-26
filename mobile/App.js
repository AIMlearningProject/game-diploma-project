import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuthStore } from './src/stores/authStore';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import StudentDashboardScreen from './src/screens/StudentDashboardScreen';
import TeacherDashboardScreen from './src/screens/TeacherDashboardScreen';
import BookLogScreen from './src/screens/BookLogScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import GameScreen from './src/screens/GameScreen';

const Stack = createStackNavigator();

export default function App() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#0ea5e9',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen
              name="Dashboard"
              component={
                user?.role === 'STUDENT'
                  ? StudentDashboardScreen
                  : TeacherDashboardScreen
              }
              options={{ title: 'Lukudiplomi' }}
            />
            <Stack.Screen
              name="Game"
              component={GameScreen}
              options={{ title: 'Your Journey' }}
            />
            <Stack.Screen
              name="LogBook"
              component={BookLogScreen}
              options={{ title: 'Log a Book' }}
            />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{ title: 'Profile' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
