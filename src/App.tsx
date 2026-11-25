// import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './navigation/types';
import { ActivityIndicator, View, Text } from 'react-native';

import HomeScreen from './screens/HomeScreen';
import QuizScreen from './screens/QuizScreen';
import SummaryScreen from './screens/SummaryScreen';
import LoginScreen from './screens/LoginScreen';
import ProfileScreen from './screens/ProfileScreen';
import RegisterScreen from './screens/RegisterScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';

import { AuthProvider, useAuth } from './context/AuthContext';
import { SessionProvider } from './context/SessionContext';

import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import tw from 'twrnc';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator<RootStackParamList>();

function CustomDrawerContent(props: any) {
  const { user, logout } = useAuth();
  const userInitial = user?.email ? user.email[0].toUpperCase() : '?';

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.drawerHeader}>
        <View style={styles.drawerAvatar}>
          <Text style={styles.drawerAvatarText}>
            {userInitial}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.drawerName} numberOfLines={1}>
            {user?.isAnonymous ? '¡Hola, héroe!' : user?.email}
          </Text>
          <Text style={styles.drawerCaption}>
            Tu aventura de inglés
          </Text>
        </View>
      </View>
      <DrawerItemList {...props} />
      <DrawerItem
        label="Cerrar Sesión"
        onPress={logout}
        labelStyle={styles.logoutLabel}
      />
    </DrawerContentScrollView>
  );
}

function AuthenticatedNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: '#ffffff',
        },
        headerTintColor: '#4f46e5',
        headerTitleStyle: {
          fontWeight: '900',
          color: '#172554',
        },
        drawerActiveTintColor: '#4f46e5',
        drawerInactiveTintColor: '#65718a',
        drawerActiveBackgroundColor: '#eee7ff',
      }}
    >
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Inicio' }}
      />
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Mi Perfil' }}
      />
      {/* Quiz and Summary stay in Stack but can be accessed from Home */}
    </Drawer.Navigator>
  );
}

function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#4f6df5" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{
        headerStyle: { backgroundColor: '#ffffff' },
        headerTintColor: '#4f46e5',
        headerTitleStyle: { fontWeight: '900', color: '#172554' }
      }}>
        {user ? (
          <>
            <Stack.Screen
              name="Main"
              component={AuthenticatedNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Quiz"
              component={QuizScreen}
              options={{ title: 'Práctica de Verbos' }}
            />
            <Stack.Screen
              name="Summary"
              component={SummaryScreen}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ title: 'Crear Cuenta' }}
            />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
              options={{ title: 'Recuperar Contraseña' }}
            />
          </>
        )}
      </Stack.Navigator>
      {/* <StatusBar style="auto" /> */}
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

const styles = {
  drawerHeader: tw`mb-2 flex-row items-center border-b border-[#e7ecf6] bg-white p-5`,
  drawerAvatar: tw`mr-4 h-[50px] w-[50px] items-center justify-center rounded-full bg-[#7154d9]`,
  drawerAvatarText: tw`text-xl font-black text-white`,
  drawerName: tw`text-base font-black text-[#172554]`,
  drawerCaption: tw`text-xs text-[#65718a]`,
  logoutLabel: tw`font-bold text-[#dc2626]`,
  loading: tw`flex-1 items-center justify-center bg-[#f5f8ff]`,
};
