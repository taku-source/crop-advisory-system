import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#07120a" />
      <View style={styles.hero}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} accessibilityLabel="Crop Advisory" />
        <Text style={styles.brand}>Crop Advisory</Text>
        <Text style={styles.tagline}>Practical seasonal guidance for farmers in Zimbabwe's Region III</Text>
      </View>
      <View style={styles.panel}>
        <Text style={styles.title}>Plan better. Grow with confidence.</Text>
        <Text style={styles.body}>Get crop-specific seasonal advice, identify diseases from symptoms, and keep your farm records in one place.</Text>
        <TouchableOpacity style={styles.primary} onPress={() => navigation.navigate('Login')} activeOpacity={0.85}>
          <Text style={styles.primaryText}>Log in</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondary} onPress={() => navigation.navigate('Register')} activeOpacity={0.85}>
          <Text style={styles.secondaryText}>Sign up as a farmer</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.footer}>Powered by Agritex · Region III, Zimbabwe</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'space-between' },
  hero: { alignItems: 'center', marginTop: 70 },
  logo: { width: 116, height: 116, resizeMode: 'contain' },
  brand: { color: '#fff', fontSize: 32, fontWeight: '800', marginTop: 18 },
  tagline: { color: '#b8d9ba', fontSize: 14, textAlign: 'center', lineHeight: 21, marginTop: 8, maxWidth: 320 },
  panel: { backgroundColor: 'rgba(15,35,26,.94)', borderWidth: 1, borderColor: '#2a5a3a', borderRadius: 24, padding: 22 },
  title: { color: '#fff', fontSize: 22, fontWeight: '800', lineHeight: 28 },
  body: { color: '#b8d9ba', fontSize: 13, lineHeight: 20, marginTop: 9, marginBottom: 20 },
  primary: { backgroundColor: '#4ade80', borderRadius: 12, padding: 14, alignItems: 'center' },
  primaryText: { color: '#041a0a', fontSize: 15, fontWeight: '800' },
  secondary: { borderWidth: 1, borderColor: 'rgba(255,255,255,.22)', borderRadius: 12, padding: 13, alignItems: 'center', marginTop: 10 },
  secondaryText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  footer: { color: '#7a9a7a', fontSize: 11, textAlign: 'center', marginBottom: 12 },
});
