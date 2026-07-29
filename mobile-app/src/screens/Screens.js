// ─── LoginScreen.js ───────────────────────────────────────────────────────────
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Image,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Error', 'Please fill in all fields');
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      Alert.alert('Login Failed', err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.loginContainer}>
        <View style={s.logoArea}>
          <Image source={require('../assets/logo.png')} style={s.logoImage} resizeMode="contain" />
          <Text style={s.appName}>Crop Advisory</Text>
          <Text style={s.tagline}>Zimbabwe Agro-Ecological Region III</Text>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Sign In</Text>
          <TextInput style={s.input} placeholder="Email" value={email}
            onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <TextInput style={s.input} placeholder="Password" value={password}
            onChangeText={setPassword} secureTextEntry />
          <TouchableOpacity style={s.btnPrimary} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Sign In</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={s.linkText}>Don't have an account? Register here</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// ─── RegisterScreen.js ────────────────────────────────────────────────────────
export const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth();
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', password: '',
    district: '', ward: '', farmName: '', farmSize: '',
  });
  const [loading, setLoading] = useState(false);

  const update = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const handleRegister = async () => {
    const required = ['fullName', 'email', 'phone', 'password', 'district', 'ward'];
    if (required.some((k) => !form[k])) return Alert.alert('Error', 'Please fill all required fields');
    setLoading(true);
    try {
      await register(form);
    } catch (err) {
      Alert.alert('Registration Failed', err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: 'fullName', label: 'Full Name *' },
    { key: 'email', label: 'Email *', keyboard: 'email-address' },
    { key: 'phone', label: 'Phone Number *', keyboard: 'phone-pad' },
    { key: 'password', label: 'Password *', secure: true },
    { key: 'district', label: 'District *' },
    { key: 'ward', label: 'Ward *' },
    { key: 'farmName', label: 'Farm Name' },
    { key: 'farmSize', label: 'Farm Size (e.g. 2 ha)' },
  ];

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={s.pageTitle}>Create Account</Text>
      <Text style={s.pageSubtitle}>Register to get farming advice and disease alerts</Text>
      {fields.map((f) => (
        <TextInput key={f.key} style={s.input} placeholder={f.label}
          value={form[f.key]} onChangeText={update(f.key)}
          keyboardType={f.keyboard || 'default'} secureTextEntry={f.secure}
          autoCapitalize={f.key === 'email' ? 'none' : 'words'} />
      ))}
      <TouchableOpacity style={s.btnPrimary} onPress={handleRegister} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Create Account</Text>}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={s.linkText}>Already have an account? Sign in</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// ─── DashboardScreen.js ───────────────────────────────────────────────────────
export const DashboardScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);

  React.useEffect(() => {
    const { getNotifications } = require('../api');
    getNotifications().then((r) => setNotifications(r.data.notifications.slice(0, 3))).catch(() => {});
  }, []);

  const quickActions = [
    { label: 'View Advisories', emoji: '📋', screen: 'Advisories' },
    { label: 'Identify Disease', emoji: '🔍', screen: 'DiseaseIdentifier' },
    { label: 'Farm Records', emoji: '📝', screen: 'Records' },
    { label: 'Knowledge Base', emoji: '📚', screen: 'Knowledge' },
  ];

  const now = new Date();
  const month = now.getMonth();
  // Zimbabwe season: Nov-Apr is Main Season
  const seasonName = month >= 10 || month <= 3 ? 'Main Season 2024/25' : 'Winter/Dry Season';

  return (
    <ScrollView style={s.container}>
      {/* Header */}
      <View style={s.dashHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <Image source={require('../assets/logo.png')} style={{ width: 60, height: 60 }} resizeMode="contain" />
          <View>
            <Text style={s.welcomeText}>Good {now.getHours() < 12 ? 'morning' : 'afternoon'},</Text>
            <Text style={s.userName}>{user?.fullName?.split(' ')[0]} 👋</Text>
          </View>
        </View>
        <TouchableOpacity onPress={logout} style={s.logoutBtn}>
          <Text style={s.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Season card */}
      <View style={s.seasonCard}>
        <Text style={s.seasonLabel}>Current Season</Text>
        <Text style={s.seasonName}>{seasonName}</Text>
        <Text style={s.seasonSub}>Region III · {user?.district}</Text>
      </View>

      {/* Quick actions */}
      <Text style={s.sectionTitle}>Quick Actions</Text>
      <View style={s.quickGrid}>
        {quickActions.map((a) => (
          <TouchableOpacity key={a.screen} style={s.quickCard} onPress={() => navigation.navigate(a.screen)}>
            <Text style={s.quickEmoji}>{a.emoji}</Text>
            <Text style={s.quickLabel}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent notifications */}
      <Text style={s.sectionTitle}>Recent Alerts</Text>
      {notifications.length === 0 && <Text style={s.emptyText}>No recent notifications</Text>}
      {notifications.map((n) => (
        <View key={n._id} style={s.notifCard}>
          <Text style={s.notifTitle}>{n.title}</Text>
          <Text style={s.notifMsg}>{n.message}</Text>
          <Text style={s.notifDate}>{new Date(n.createdAt).toLocaleDateString()}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

// ─── DiseaseIdentifierScreen.js ───────────────────────────────────────────────
export const DiseaseIdentifierScreen = () => {
  const { identifyDisease } = require('../api');
  const [step, setStep] = useState(1);
  const [crop, setCrop] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const CROPS = ['Maize', 'Tomato', 'Beans'];
  const SYMPTOMS_BY_CROP = {
    Maize: ['Yellow leaves', 'Brown spots', 'Leaf streaks', 'Stunted growth', 'White powder', 'Rust pustules', 'Wilting', 'Leaf blight'],
    Tomato: ['Water-soaked spots', 'Brown leaf spots', 'Wilting', 'White mould', 'Stem lesions', 'Fruit rot', 'Yellow leaves'],
    Beans: ['Angular spots', 'Yellow leaves', 'Rust pustules', 'Leaf drop', 'Brown lesions'],
  };

  const toggleSymptom = (s) => {
    setSelectedSymptoms((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const handleSubmit = async () => {
    if (selectedSymptoms.length === 0) return Alert.alert('Select at least one symptom');
    setLoading(true);
    try {
      const res = await identifyDisease({ crop, symptoms: selectedSymptoms });
      setResults(res.data.results);
      setStep(3);
    } catch {
      Alert.alert('Error', 'Could not identify disease. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setStep(1); setCrop(''); setSelectedSymptoms([]); setResults(null); };

  return (
    <ScrollView style={s.container}>
      <Text style={s.pageTitle}>Disease Identifier</Text>

      {/* Step 1: Select crop */}
      {step === 1 && (
        <View>
          <Text style={s.stepLabel}>Step 1: Select your crop</Text>
          {CROPS.map((c) => (
            <TouchableOpacity key={c} style={[s.optionBtn, crop === c && s.optionSelected]}
              onPress={() => { setCrop(c); setStep(2); }}>
              <Text style={[s.optionText, crop === c && s.optionTextSelected]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Step 2: Select symptoms */}
      {step === 2 && (
        <View>
          <Text style={s.stepLabel}>Step 2: Select symptoms you observe on your {crop}</Text>
          {(SYMPTOMS_BY_CROP[crop] || []).map((sym) => (
            <TouchableOpacity key={sym}
              style={[s.optionBtn, selectedSymptoms.includes(sym) && s.optionSelected]}
              onPress={() => toggleSymptom(sym)}>
              <Text style={[s.optionText, selectedSymptoms.includes(sym) && s.optionTextSelected]}>
                {selectedSymptoms.includes(sym) ? '✓ ' : ''}{sym}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={s.btnPrimary} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Identify Disease</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={s.btnSecondary} onPress={() => setStep(1)}>
            <Text style={s.btnSecondaryText}>Back</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Step 3: Results */}
      {step === 3 && results && (
        <View>
          <Text style={s.stepLabel}>Results for {crop}:</Text>
          {results.length === 0 && (
            <View style={s.resultCard}>
              <Text style={s.resultTitle}>No matching disease found</Text>
              <Text style={s.resultText}>Please consult your local Agricultural Extension Officer (Agritex).</Text>
            </View>
          )}
          {results.map((r, i) => (
            <View key={i} style={s.resultCard}>
              <View style={s.resultHeader}>
                <Text style={s.resultTitle}>{r.disease.diseaseName}</Text>
                <View style={[s.severityBadge, { backgroundColor: r.disease.severity === 'High' ? '#e74c3c' : r.disease.severity === 'Medium' ? '#f39c12' : '#27ae60' }]}>
                  <Text style={s.severityText}>{r.disease.severity}</Text>
                </View>
              </View>
              <Text style={s.matchScore}>Match: {r.matchScore}%</Text>
              <Text style={s.resultLabel}>Description:</Text>
              <Text style={s.resultText}>{r.disease.description}</Text>
              <Text style={s.resultLabel}>Treatment:</Text>
              <Text style={s.resultText}>{r.disease.treatment}</Text>
              <Text style={s.resultLabel}>Prevention:</Text>
              <Text style={s.resultText}>{r.disease.prevention}</Text>
            </View>
          ))}
          <TouchableOpacity style={s.btnPrimary} onPress={reset}>
            <Text style={s.btnText}>Start New Identification</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

// ─── Shared styles ────────────────────────────────────────────────────────────
const GREEN = '#2e7d32';
const LIGHT_GREEN = '#e8f5e9';

const s = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loginContainer: { flexGrow: 1, justifyContent: 'center', backgroundColor: GREEN, padding: 20 },
  logoArea: { alignItems: 'center', marginBottom: 32 },
  logoEmoji: { fontSize: 64 },
  appName: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginTop: 8 },
  tagline: { fontSize: 12, color: '#a5d6a7', marginTop: 4 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 24 },
  cardTitle: { fontSize: 22, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 14, marginBottom: 14, fontSize: 15, backgroundColor: '#fafafa' },
  btnPrimary: { backgroundColor: GREEN, padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  btnSecondary: { borderWidth: 1, borderColor: GREEN, padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  btnSecondaryText: { color: GREEN, fontWeight: 'bold', fontSize: 16 },
  linkText: { textAlign: 'center', color: GREEN, marginTop: 16, fontSize: 14 },
  dashHeader: { backgroundColor: GREEN, padding: 20, paddingTop: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logoImage: { width: 96, height: 96, marginBottom: 14 },
  welcomeText: { color: '#a5d6a7', fontSize: 14 },
  userName: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 8 },
  logoutText: { color: '#fff', fontSize: 13 },
  seasonCard: { margin: 16, backgroundColor: '#1b5e20', borderRadius: 14, padding: 20 },
  seasonLabel: { color: '#a5d6a7', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
  seasonName: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 4 },
  seasonSub: { color: '#81c784', fontSize: 13, marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginHorizontal: 16, marginTop: 8, marginBottom: 8 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12 },
  quickCard: { width: '46%', margin: '2%', backgroundColor: '#fff', borderRadius: 12, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  quickEmoji: { fontSize: 32, marginBottom: 8 },
  quickLabel: { fontSize: 13, fontWeight: '600', color: '#333', textAlign: 'center' },
  notifCard: { backgroundColor: '#fff', margin: 8, marginHorizontal: 16, borderRadius: 10, padding: 14, borderLeftWidth: 4, borderLeftColor: GREEN },
  notifTitle: { fontWeight: 'bold', color: '#333', fontSize: 14 },
  notifMsg: { color: '#666', fontSize: 13, marginTop: 4 },
  notifDate: { color: '#aaa', fontSize: 11, marginTop: 6 },
  emptyText: { color: '#aaa', textAlign: 'center', padding: 20 },
  pageTitle: { fontSize: 22, fontWeight: 'bold', color: '#1a1a1a', padding: 20, paddingBottom: 4 },
  pageSubtitle: { color: '#666', paddingHorizontal: 20, marginBottom: 20 },
  stepLabel: { fontSize: 15, fontWeight: '600', color: '#333', padding: 16, paddingBottom: 8 },
  optionBtn: { marginHorizontal: 16, marginVertical: 4, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fff' },
  optionSelected: { borderColor: GREEN, backgroundColor: LIGHT_GREEN },
  optionText: { fontSize: 15, color: '#333' },
  optionTextSelected: { color: GREEN, fontWeight: '600' },
  resultCard: { margin: 16, backgroundColor: '#fff', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  resultTitle: { fontSize: 17, fontWeight: 'bold', color: '#1a1a1a', flex: 1 },
  severityBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  severityText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  matchScore: { color: GREEN, fontWeight: '600', marginBottom: 10 },
  resultLabel: { fontSize: 13, fontWeight: 'bold', color: '#555', marginTop: 10, textTransform: 'uppercase' },
  resultText: { fontSize: 14, color: '#444', lineHeight: 20, marginTop: 2 },
});
