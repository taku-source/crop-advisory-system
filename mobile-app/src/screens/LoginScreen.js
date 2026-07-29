import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const GREEN = '#2e7d32';

export default function LoginScreen({ navigation }) {
  const { login }                   = useAuth();
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [loading, setLoading]       = useState(false);
  const [showPass, setShowPass]     = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) return Alert.alert('Required', 'Please enter your email and password.');
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (err) {
      Alert.alert('Login Failed', err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">

        {/* Hero */}
        <View style={s.hero}>
          <Text style={s.heroEmoji}>🌽</Text>
          <Text style={s.heroTitle}>Crop Advisory</Text>
          <Text style={s.heroSub}>Zimbabwe Agro-Ecological Region III</Text>
        </View>

        {/* Card */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Sign In</Text>
          <Text style={s.cardSub}>Welcome back, farmer</Text>

          <Text style={s.label}>Email Address</Text>
          <TextInput
            style={s.input} value={email} onChangeText={setEmail}
            placeholder="your@email.com" keyboardType="email-address"
            autoCapitalize="none" autoCorrect={false} returnKeyType="next"
          />

          <Text style={s.label}>Password</Text>
          <View style={s.passRow}>
            <TextInput
              style={[s.input, { flex: 1, marginBottom: 0 }]} value={password} onChangeText={setPassword}
              placeholder="••••••••" secureTextEntry={!showPass} returnKeyType="done" onSubmitEditing={handleLogin}
            />
            <TouchableOpacity style={s.eyeBtn} onPress={() => setShowPass(!showPass)}>
              <Text style={{ fontSize: 18 }}>{showPass ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[s.btnPrimary, loading && s.btnDisabled]} onPress={handleLogin} disabled={loading}>
            {loading
              ? <><ActivityIndicator color="#fff" /><Text style={[s.btnText, { marginLeft: 8 }]}>Signing in...</Text></>
              : <Text style={s.btnText}>Sign In</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={s.registerLink} onPress={() => navigation.navigate('Register')}>
            <Text style={s.registerText}>Don't have an account? <Text style={s.registerBold}>Register here</Text></Text>
          </TouchableOpacity>
        </View>

        <Text style={s.footer}>Powered by Agritex · Region III, Zimbabwe</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  container: { flexGrow: 1, backgroundColor: GREEN, justifyContent: 'center', padding: 20 },
  hero: { alignItems: 'center', marginBottom: 28 },
  heroEmoji: { fontSize: 64 },
  heroTitle: { fontSize: 28, fontWeight: '800', color: '#fff', marginTop: 10 },
  heroSub: { fontSize: 12, color: '#a5d6a7', marginTop: 4, textAlign: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 24 },
  cardTitle: { fontSize: 22, fontWeight: '800', color: '#1a1a1a' },
  cardSub: { fontSize: 13, color: '#aaa', marginBottom: 20, marginTop: 2 },
  label: { fontSize: 11, fontWeight: '700', color: '#555', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1.5, borderColor: '#e0e0e0', borderRadius: 10, padding: 13, fontSize: 14, backgroundColor: '#fafafa', marginBottom: 0 },
  passRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eyeBtn: { padding: 10 },
  btnPrimary: { backgroundColor: GREEN, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 22, flexDirection: 'row', justifyContent: 'center' },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  registerLink: { marginTop: 16, alignItems: 'center' },
  registerText: { fontSize: 13, color: '#888' },
  registerBold: { color: GREEN, fontWeight: '700' },
  footer: { textAlign: 'center', color: '#81c784', fontSize: 11, marginTop: 24 },
});
