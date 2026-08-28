import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { Colors, Fonts, Spacing, Radius } from '../constants/theme';
import { SOIL_TYPES } from '../constants/data';

const FIELDS = [
  { key: 'fullName', label: 'Full Name *',    required: true },
  { key: 'phone',    label: 'Phone *',        required: true, keyboard: 'phone-pad' },
  { key: 'email',    label: 'Email *',        required: true, keyboard: 'email-address', lower: true },
  { key: 'password', label: 'Password *',     required: true, secure: true },
];

export default function RegisterScreen({ navigation }) {
  const { register }   = useAuth();
  const [form, setForm] = useState({ fullName:'', phone:'', email:'', password:'', district:'', ward:'', farmName:'', farmSize:'', soilType:'' });
  const [loading, setLoading] = useState(false);
  const [soilOpen, setSoilOpen] = useState(false);

  const upd = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const handleRegister = async () => {
    const missing = FIELDS.filter(f => f.required && !form[f.key].trim());
    if (missing.length > 0 || !form.district.trim() || !form.ward.trim()) {
      return Alert.alert('Required', 'Please fill in all required fields.');
    }
    setLoading(true);
    try {
      await register(form);
    } catch (err) {
      Alert.alert('Error', err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={Colors.black} />
      <ScrollView style={s.container} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">

        <TouchableOpacity style={s.back} onPress={() => navigation.goBack()}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.title}>Create account</Text>
        <Text style={s.sub}>Tell us about you and your farm</Text>

        {/* Personal info */}
        <Text style={s.sectionLabel}>Personal Information</Text>
        {FIELDS.map(f => (
          <View key={f.key} style={s.fieldWrap}>
            <Text style={s.label}>{f.label}</Text>
            <TextInput
              style={s.input} value={form[f.key]} onChangeText={upd(f.key)}
              placeholder={f.label.replace(' *', '')} placeholderTextColor={Colors.grey}
              keyboardType={f.keyboard || 'default'}
              autoCapitalize={f.lower ? 'none' : 'words'}
              secureTextEntry={f.secure || false}
            />
          </View>
        ))}

        {/* Farm info */}
        <Text style={[s.sectionLabel, { marginTop: 14 }]}>Farm Details</Text>
        <View style={s.row2}>
          <View style={s.half}>
            <Text style={s.label}>District *</Text>
            <TextInput style={s.input} value={form.district} onChangeText={upd('district')} placeholder="Kadoma" placeholderTextColor={Colors.grey} />
          </View>
          <View style={s.half}>
            <Text style={s.label}>Ward *</Text>
            <TextInput style={s.input} value={form.ward} onChangeText={upd('ward')} placeholder="Ward 5" placeholderTextColor={Colors.grey} />
          </View>
        </View>
        <View style={s.row2}>
          <View style={s.half}>
            <Text style={s.label}>Farm size</Text>
            <TextInput style={s.input} value={form.farmSize} onChangeText={upd('farmSize')} placeholder="2 ha" placeholderTextColor={Colors.grey} />
          </View>
          <View style={s.half}>
            <Text style={s.label}>Soil type</Text>
            <TouchableOpacity style={s.input} onPress={() => setSoilOpen(!soilOpen)}>
              <Text style={{ fontFamily: Fonts.body, fontSize: 14, color: form.soilType ? Colors.white : Colors.grey }}>
                {form.soilType || 'Select… ▾'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {soilOpen && (
          <View style={s.dropdown}>
            {SOIL_TYPES.map(st => (
              <TouchableOpacity key={st.id} style={s.dropItem} onPress={() => { upd('soilType')(st.name); setSoilOpen(false); }}>
                <Text style={s.dropText}>{st.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* GPS permission */}
        <View style={s.gpsBox}>
          <Text style={s.gpsTitle}>📍 Allow location access</Text>
          <Text style={s.gpsBody}>Your GPS location helps us provide weather data and location-specific crop recommendations.</Text>
          <TouchableOpacity style={s.gpsBtn}>
            <Text style={s.gpsBtnText}>Enable Location</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[s.submitBtn, loading && { opacity: 0.6 }]} onPress={handleRegister} disabled={loading} activeOpacity={0.85}>
          <Text style={s.submitText}>{loading ? 'Creating account…' : 'Create Account'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.loginLink} onPress={() => navigation.navigate('Login')}>
          <Text style={s.loginText}>Already have an account? <Text style={{ color: Colors.leaf, fontFamily: Fonts.bold }}>Sign in</Text></Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },
  content: { padding: Spacing.xl },
  back: { paddingTop: 10, paddingBottom: 4 },
  backText: { fontFamily: Fonts.semibold, fontSize: 13, color: Colors.leaf },
  title: { fontFamily: Fonts.display, fontSize: 24, fontWeight: '800', color: Colors.white, marginTop: 10 },
  sub: { fontFamily: Fonts.body, fontSize: 13, color: Colors.grey2, marginTop: 4, marginBottom: 20, lineHeight: 19 },
  sectionLabel: { fontFamily: Fonts.mono, fontSize: 10, color: Colors.leaf, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 },
  fieldWrap: { marginBottom: 11 },
  label: { fontFamily: Fonts.mono, fontSize: 10, color: Colors.grey, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 5 },
  input: { backgroundColor: Colors.card, borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md, padding: 12, fontSize: 14, color: Colors.white, fontFamily: Fonts.body },
  row2: { flexDirection: 'row', gap: 9, marginBottom: 11 },
  half: { flex: 1 },
  dropdown: { backgroundColor: Colors.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, marginBottom: 11, overflow: 'hidden' },
  dropItem: { padding: 13, borderBottomWidth: 1, borderBottomColor: Colors.border },
  dropText: { fontFamily: Fonts.body, fontSize: 14, color: Colors.white },
  gpsBox: { backgroundColor: Colors.skyDim, borderRadius: Radius.md, padding: 13, borderWidth: 1, borderColor: '#1a3a50', marginBottom: 16 },
  gpsTitle: { fontFamily: Fonts.bold, fontSize: 12, color: Colors.sky, marginBottom: 4 },
  gpsBody: { fontFamily: Fonts.body, fontSize: 11, color: '#7ab8d8', lineHeight: 17 },
  gpsBtn: { marginTop: 10, backgroundColor: Colors.sky, borderRadius: 9, padding: 9, alignItems: 'center' },
  gpsBtnText: { fontFamily: Fonts.bold, fontSize: 12, color: '#041220' },
  submitBtn: { backgroundColor: Colors.leaf, borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 6 },
  submitText: { fontFamily: Fonts.display, fontSize: 16, color: '#041a0a', fontWeight: '800' },
  loginLink: { marginTop: 16, alignItems: 'center' },
  loginText: { fontFamily: Fonts.body, fontSize: 13, color: Colors.grey2 },
});
