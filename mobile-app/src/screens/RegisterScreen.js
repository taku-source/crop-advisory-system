import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ScrollView, ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const GREEN = '#2e7d32';

const DISTRICTS = [
  'Gweru', 'Kwekwe', 'Mvuma', 'Chirumhanzu', 'Shurugwi', 'Gutu', 'Masvingo', 'Buhera', 'Mutare', 'Makoni', 'Wedza', 'Chikomba', 'Sanyati', 'Chegutu', 'Guruve',
];

const FIELDS = [
  { key: 'fullName',  label: 'Full Name *',           required: true },
  { key: 'email',     label: 'Email Address *',        required: true, keyboard: 'email-address', autoCapitalize: 'none' },
  { key: 'phone',     label: 'Phone Number *',         required: true, keyboard: 'phone-pad' },
  { key: 'password',  label: 'Password *',             required: true, secure: true },
  { key: 'district',  label: 'District *',             required: true },
  { key: 'ward',      label: 'Ward *',                 required: true },
  { key: 'farmName',  label: 'Farm Name' },
  { key: 'farmSize',  label: 'Farm Size (e.g. 2 ha)' },
];

export default function RegisterScreen({ navigation }) {
  const { register }    = useAuth();
  const [form, setForm] = useState({ fullName:'', email:'', phone:'', password:'', district:'', ward:'', farmName:'', farmSize:'' });
  const [loading, setLoading] = useState(false);

  const upd = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const handleRegister = async () => {
    const missing = FIELDS.filter((f) => f.required && !form[f.key].trim());
    if (missing.length > 0) return Alert.alert('Required Fields', `Please fill in: ${missing.map((f) => f.label.replace(' *', '')).join(', ')}`);
    if (form.password.length < 6) return Alert.alert('Password Too Short', 'Password must be at least 6 characters.');

    setLoading(true);
    try {
      await register(form);
    } catch (err) {
      Alert.alert('Registration Failed', err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">

      <View style={s.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.backBtn}>← Back</Text></TouchableOpacity>
      </View>

      <Text style={s.pageTitle}>Create Account</Text>
      <Text style={s.pageSub}>Register to receive farming advice, disease alerts, and seasonal reminders.</Text>

      {FIELDS.map((field) => (
        <View key={field.key}>
          <Text style={s.label}>{field.label}</Text>
          <TextInput
            style={s.input}
            value={form[field.key]}
            onChangeText={upd(field.key)}
            placeholder={field.label.replace(' *', '')}
            keyboardType={field.keyboard || 'default'}
            autoCapitalize={field.autoCapitalize || (field.key === 'email' ? 'none' : 'words')}
            secureTextEntry={field.secure || false}
            autoCorrect={false}
          />
        </View>
      ))}

      <View style={s.infoBox}>
        <Text style={s.infoText}>📍 District is the local area, and ward is your village/administrative ward inside that district. This helps us send the right local advisories and seasonal guidance.</Text>
      </View>

      <TouchableOpacity style={[s.btnPrimary, loading && s.btnDisabled]} onPress={handleRegister} disabled={loading}>
        {loading
          ? <><ActivityIndicator color="#fff" /><Text style={[s.btnText, { marginLeft: 8 }]}>Creating account...</Text></>
          : <Text style={s.btnText}>Create Account</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={s.loginLink} onPress={() => navigation.navigate('Login')}>
        <Text style={s.loginText}>Already have an account? <Text style={s.loginBold}>Sign in</Text></Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 20 },
  headerBar: { paddingTop: 10, paddingBottom: 4 },
  backBtn: { color: GREEN, fontSize: 15, fontWeight: '600' },
  pageTitle: { fontSize: 24, fontWeight: '800', color: '#1a1a1a', marginTop: 10 },
  pageSub: { fontSize: 13, color: '#888', lineHeight: 19, marginTop: 4, marginBottom: 20 },
  label: { fontSize: 11, fontWeight: '700', color: '#ffffff', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6, marginTop: 14 },
  input: { borderWidth: 1.5, borderColor: '#e0e0e0', borderRadius: 10, padding: 13, fontSize: 14, backgroundColor: '#fff' },
  infoBox: { backgroundColor: '#e8f5e9', borderRadius: 10, padding: 14, marginTop: 18 },
  infoText: { fontSize: 12, color: '#2e7d32', lineHeight: 18 },
  btnPrimary: { backgroundColor: GREEN, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20, flexDirection: 'row', justifyContent: 'center' },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  loginLink: { marginTop: 16, alignItems: 'center' },
  loginText: { fontSize: 13, color: '#888' },
  loginBold: { color: GREEN, fontWeight: '700' },
});
