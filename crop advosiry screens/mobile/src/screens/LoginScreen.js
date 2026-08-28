import React, { useState } from 'react';
import {
  View, Text, Image, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, Alert, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { Colors, Fonts, Spacing, Radius } from '../constants/theme';

export default function LoginScreen({ navigation }) {
  const { login }               = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      return Alert.alert('Required', 'Please enter your email and password.');
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      Alert.alert('Login Failed', err.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.black} />
      <LinearGradient colors={['#0a1a0a', '#041204', '#000000']} style={s.flex}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

          {/* Glow */}
          <View style={s.glow} pointerEvents="none" />

          {/* Hero */}
          <View style={s.hero}>
            <Image source={require('../../assets/logo.png')} style={s.logoImage} accessibilityLabel="Crop Advisory" />
            <Text style={s.brandName}>Crop Advisory</Text>
            <Text style={s.tagline}>Smart farming for Region III</Text>
          </View>

          {/* Card */}
          <View style={s.card}>
            <Text style={s.cardTitle}>Welcome back</Text>
            <Text style={s.cardSub}>Sign in to your farm account</Text>

            <Text style={s.label}>Email</Text>
            <TextInput
              style={s.input} value={email} onChangeText={setEmail}
              placeholder="farmer@example.com" placeholderTextColor={Colors.grey}
              keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
              returnKeyType="next"
            />

            <Text style={s.label}>Password</Text>
            <View style={s.passRow}>
              <TextInput
                style={[s.input, s.passInput]} value={password} onChangeText={setPassword}
                placeholder="••••••••" placeholderTextColor={Colors.grey}
                secureTextEntry={!showPass} returnKeyType="done" onSubmitEditing={handleLogin}
              />
              <TouchableOpacity style={s.eyeBtn} onPress={() => setShowPass(!showPass)}>
                <Text style={{ fontSize: 18 }}>{showPass ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[s.submitBtn, loading && s.submitDisabled]}
              onPress={handleLogin} disabled={loading} activeOpacity={0.85}
            >
              <Text style={s.submitText}>{loading ? 'Signing in…' : 'Sign In'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.regLink} onPress={() => navigation.navigate('Register')}>
              <Text style={s.regText}>
                New farmer? <Text style={s.regBold}>Create account</Text>
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={s.footer}>Powered by Agritex · Region III, Zimbabwe</Text>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'flex-end', padding: Spacing.xl },
  glow: {
    position: 'absolute', top: -60, left: '50%', marginLeft: -140,
    width: 280, height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(74,222,128,0.16)',
  },
  hero: { alignItems: 'center', marginBottom: 32 },
  logoImage: { width: 72, height: 72, resizeMode: 'contain' },
  brandName: { fontFamily: Fonts.display, fontSize: 30, color: Colors.white, marginTop: 10, letterSpacing: -0.5 },
  tagline: { fontFamily: Fonts.body, fontSize: 13, color: Colors.grey2, marginTop: 5 },
  card: {
    backgroundColor: Colors.surface, borderRadius: 26, padding: 26,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  cardTitle: { fontFamily: Fonts.display, fontSize: 22, color: Colors.white, fontWeight: '800' },
  cardSub: { fontFamily: Fonts.body, fontSize: 13, color: Colors.grey2, marginTop: 3, marginBottom: 22 },
  label: { fontFamily: Fonts.mono, fontSize: 10, color: Colors.grey, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 5, marginTop: 13 },
  input: {
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radius.md, padding: 12, fontSize: 14,
    color: Colors.white, fontFamily: Fonts.body,
  },
  passRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  passInput: { flex: 1 },
  eyeBtn: { padding: 10 },
  submitBtn: { backgroundColor: Colors.leaf, borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 22 },
  submitDisabled: { opacity: 0.6 },
  submitText: { fontFamily: Fonts.display, fontSize: 16, color: '#041a0a', fontWeight: '800' },
  regLink: { marginTop: 16, alignItems: 'center' },
  regText: { fontFamily: Fonts.body, fontSize: 13, color: Colors.grey2 },
  regBold: { color: Colors.leaf, fontFamily: Fonts.bold },
  footer: { textAlign: 'center', fontFamily: Fonts.mono, fontSize: 11, color: '#4a6a4a', marginTop: 24 },
});
