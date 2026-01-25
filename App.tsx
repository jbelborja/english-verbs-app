import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './src/navigation/types';
import { ActivityIndicator, View } from 'react-native';

import HomeScreen from './src/screens/HomeScreen';
import QuizScreen from './src/screens/QuizScreen';
import SummaryScreen from './src/screens/SummaryScreen';
import LoginScreen from './src/screens/LoginScreen';
import ProfileScreen from './src/screens/ProfileScreen';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { SessionProvider } from './src/context/SessionContext';

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Quiz"
              component={QuizScreen}
              options={{ title: 'English Verbs Quiz' }}
            />
            <Stack.Screen
              name="Summary"
              component={SummaryScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{ title: 'User Profile' }}
            />
          </>
        ) : (
          // We can cast LoginScreen as any to satisfy type check if Login isn't in RootStackParamList
          // Or we can add Login to RootStackParamList. 
          // Since we are conditionally rendering, the navigation prop in LoginScreen 
          // won't effectively navigate to Home directly, but allow Auth state change to trigger re-render.
          // However, LoginScreen doesn't use navigation prop to go to Home, it uses signIn which updates state.
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SessionProvider>
        <AppNavigator />
      </SessionProvider>
    </AuthProvider>
  );
}
