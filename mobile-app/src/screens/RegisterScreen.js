import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ScrollView, ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import * as Location from 'expo-location';

const GREEN = '#2e7d32';

const DISTRICTS = [
  'Kadoma', 'Chegutu', 'Kwekwe', 'Muronzi', 'Chinhoyi', 'Zvimba', 'Sanyati',
];

const SOILS = ['Sandy', 'Sandy loam', 'Loam', 'Clay loam', 'Clay'];
const IRRIGATION = ['Rain-fed', 'Drip irrigation', 'Furrow irrigation', 'Sprinkler irrigation'];

const FIELDS = [
  { key: 'fullName',  label: 'Full Name *',           required: true },
  { key: 'email',     label: 'Email Address *',        required: true, keyboard: 'email-address', autoCapitalize: 'none' },
  { key: 'phone',     label: 'Phone Number *',         required: true, keyboard: 'phone-pad' },
  { key: 'password',  label: 'Password *',             required: true, secure: true },
  { key: 'district',  label: 'District *',             required: true },
  { key: 'farmName',  label: 'Farm Name' },
  { key: 'farmSize',  label: 'Farm Size (hectares) *', required: true, keyboard: 'numeric' },
];

export default function RegisterScreen({ navigation }) {
  const { register }    = useAuth();
  const [form, setForm] = useState({ fullName:'', email:'', phone:'', password:'', district:'', farmName:'', farmSize:'', soilType:'', irrigationMethod:'', location:{ latitude:null, longitude:null } });
  const [loading, setLoading] = useState(false);

  const upd = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const captureLocation = async () => {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) return Alert.alert('Location required', 'Allow location access to receive local weather advice.');
    const position = await Location.getCurrentPositionAsync({});
    setForm((f) => ({ ...f, location: { latitude: position.coords.latitude, longitude: position.coords.longitude } }));
  };

  const handleRegister = async () => {
    const missing = FIELDS.filter((f) => f.required && !form[f.key].trim());
    if (missing.length > 0) return Alert.alert('Required Fields', `Please fill in: ${missing.map((f) => f.label.replace(' *', '')).join(', ')}`);
    if (!form.soilType || !form.irrigationMethod) return Alert.alert('Farm profile required', 'Please select your soil type and irrigation method.');
    if (!form.location.latitude) return Alert.alert('Location required', 'Please capture your GPS location.');
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

      <Text style={s.label}>Soil Type *</Text>
      <View style={s.optionRow}>{SOILS.map((soil) => <TouchableOpacity key={soil} onPress={() => upd('soilType')(soil)} style={[s.option, form.soilType === soil && s.optionActive]}><Text style={s.optionText}>{soil}</Text></TouchableOpacity>)}</View>

      <Text style={s.label}>Irrigation Method *</Text>
      <View style={s.optionRow}>{IRRIGATION.map((method) => <TouchableOpacity key={method} onPress={() => upd('irrigationMethod')(method)} style={[s.option, form.irrigationMethod === method && s.optionActive]}><Text style={s.optionText}>{method}</Text></TouchableOpacity>)}</View>

      <TouchableOpacity style={s.locationButton} onPress={captureLocation}>
        <Text style={s.locationText}>{form.location.latitude ? `Location captured (${form.location.latitude.toFixed(3)}, ${form.location.longitude.toFixed(3)})` : 'Capture GPS location'}</Text>
      </TouchableOpacity>

      <View style={s.infoBox}>
        <Text style={s.infoText}>📍 Capture your GPS location so the app can use local weather context for your seasonal guidance.</Text>
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
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { borderWidth: 1, borderColor: '#d0ddd2', backgroundColor: '#fff', borderRadius: 9, padding: 10 },
  optionActive: { borderColor: GREEN, backgroundColor: '#e8f5e9' },
  optionText: { color: '#234b2b', fontSize: 12 },
  locationButton: { backgroundColor: '#e8f5e9', borderRadius: 10, padding: 14, marginTop: 18, alignItems: 'center' },
  locationText: { color: GREEN, fontWeight: '700', fontSize: 13 },
});
