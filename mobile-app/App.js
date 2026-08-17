import React from 'react';
import { Text, View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { FarmProfileProvider } from './src/context/FarmProfileContext';
import Logo from './src/components/Logo';
import LoginScreen    from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DashboardScreen         from './src/screens/DashboardScreen';
import AdvisoryListScreen      from './src/screens/AdvisoryListScreen';
import DiseaseIdentifierScreen from './src/screens/DiseaseIdentifierScreen';
import RecordsScreen           from './src/screens/RecordsScreen';
import { ProfileScreen, NotificationsScreen, KnowledgeScreen } from './src/screens/ProfileNotifKnowledgeScreens';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();
const More  = createNativeStackNavigator();

const TAB_ICONS = {
  Home:       ['🏠','🏡'], Advisories: ['📋','📄'],
  Disease:    ['🔍','🔎'], Records:    ['📝','📃'], More: ['☰','☰'],
};

function MoreStack() {
  return (
    <More.Navigator screenOptions={{ headerStyle: { backgroundColor: '#2e7d32' }, headerTintColor: '#fff', headerTitleStyle: { fontWeight: '700' } }}>
      <More.Screen name="Profile"       component={ProfileScreen}       options={{ title: 'My Profile' }} />
      <More.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
      <More.Screen name="Knowledge"     component={KnowledgeScreen}     options={{ title: 'Knowledge Base' }} />
    </More.Navigator>
  );
}

function FarmerTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: '#2e7d32' }, headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
        tabBarActiveTintColor: '#2e7d32', tabBarInactiveTintColor: '#999',
        tabBarStyle: { height: 62, paddingBottom: 10, paddingTop: 4 },
        tabBarIcon: ({ focused }) => <Text style={{ fontSize: focused ? 22 : 18 }}>{TAB_ICONS[route.name]?.[focused?0:1]||'•'}</Text>,
      })}
    >
      <Tab.Screen name="Home"       component={DashboardScreen}         options={{ headerShown: false }} />
      <Tab.Screen name="Advisories" component={AdvisoryListScreen}      options={{ title: 'Seasonal Advisories' }} />
      <Tab.Screen name="Disease"    component={DiseaseIdentifierScreen} options={{ title: 'Identify Disease' }} />
      <Tab.Screen name="Records"    component={RecordsScreen}           options={{ title: 'Farm Records' }} />
      <Tab.Screen name="More"       component={MoreStack}               options={{ headerShown: false, title: 'More' }} />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { user, loading } = useAuth();
  if (loading) return (
    <View style={{ flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#2e7d32' }}>
      <Logo size={140} />
      <ActivityIndicator size="large" color="#fff" style={{ marginTop:24 }} />
      <Text style={{ color:'#a5d6a7', marginTop:14, fontSize:14 }}>Crop Advisory System</Text>
    </View>
  );
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? <Stack.Screen name="Main" component={FarmerTabs} />
             : <><Stack.Screen name="Login" component={LoginScreen} /><Stack.Screen name="Register" component={RegisterScreen} /></>}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <FarmProfileProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </FarmProfileProvider>
    </AuthProvider>
  );
}
