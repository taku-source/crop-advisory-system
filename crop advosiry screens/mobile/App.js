// App.js — Root entry point
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Syne_800ExtraBold } from '@expo-google-fonts/syne';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { JetBrainsMono_400Regular, JetBrainsMono_600SemiBold } from '@expo-google-fonts/jetbrains-mono';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { Colors } from './src/constants/theme';

// Screens
import LoginScreen       from './src/screens/LoginScreen';
import RegisterScreen    from './src/screens/RegisterScreen';
import CropSelectScreen  from './src/screens/CropSelectScreen';
import HomeScreen        from './src/screens/HomeScreen';
import { SeasonPlanScreen, ActivityDetailScreen, DiseaseIDScreen, DiseaseDetailScreen } from './src/screens/SeasonDiseaseScreens';
import { RecordsScreen } from './src/screens/RecordsScreen';
import { KnowledgeScreen, NotificationsScreen, ProfileScreen } from './src/screens/OtherScreens';

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.black, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={Colors.leaf} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right', contentStyle: { backgroundColor: Colors.black } }}>
      {!user ? (
        // Auth stack
        <>
          <Stack.Screen name="Login"    component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : user.isFirstLogin || !user.crops?.length ? (
        // Onboarding stack
        <Stack.Screen name="CropSelect" component={CropSelectScreen} />
      ) : (
        // Main app stack
        <>
          <Stack.Screen name="Home"           component={HomeScreen} />
          <Stack.Screen name="SeasonPlan"     component={SeasonPlanScreen} />
          <Stack.Screen name="ActivityDetail" component={ActivityDetailScreen} />
          <Stack.Screen name="DiseaseID"      component={DiseaseIDScreen} />
          <Stack.Screen name="DiseaseDetail"  component={DiseaseDetailScreen} />
          <Stack.Screen name="Records"        component={RecordsScreen} />
          <Stack.Screen name="Knowledge"      component={KnowledgeScreen} />
          <Stack.Screen name="Notifications"  component={NotificationsScreen} />
          <Stack.Screen name="Profile"        component={ProfileScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Syne_800ExtraBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    JetBrainsMono_400Regular,
    JetBrainsMono_600SemiBold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.black, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={Colors.leaf} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
