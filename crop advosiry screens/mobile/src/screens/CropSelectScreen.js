import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Colors, Fonts, Spacing, Radius } from '../constants/theme';
import { CROPS } from '../constants/data';

export default function CropSelectScreen() {
  const { user, saveCrops } = useAuth();
  const [selected, setSelected] = useState([]);
  const [loading, setLoading]   = useState(false);

  const toggle = (id) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleContinue = async () => {
    if (selected.length === 0) return;
    setLoading(true);
    try { await saveCrops(selected); }
    finally { setLoading(false); }
  };

  const firstName = user?.fullName?.split(' ')[0] || 'Farmer';

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={Colors.black} />
      <ScrollView style={s.container} contentContainerStyle={s.content}>
        <Text style={s.welcome}>Welcome, {firstName}</Text>
        <Text style={s.title}>What are you growing?</Text>
        <Text style={s.sub}>Select all crops you are growing this season.</Text>

        <View style={s.grid}>
          {CROPS.map(crop => {
            const isSel = selected.includes(crop.id);
            return (
              <TouchableOpacity
                key={crop.id}
                style={[s.cropItem, isSel && s.cropSel]}
                onPress={() => toggle(crop.id)}
                activeOpacity={0.8}
              >
                <Text style={s.cropEmoji}>{crop.emoji}</Text>
                <Text style={[s.cropName, isSel && s.cropNameSel]}>{crop.name}</Text>
                <View style={[s.checkbox, isSel && s.checkboxSel]}>
                  {isSel && <Text style={s.checkmark}>✓</Text>}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[s.continueBtn, (selected.length === 0 || loading) && s.continueBtnDis]}
          onPress={handleContinue}
          disabled={selected.length === 0 || loading}
          activeOpacity={0.85}
        >
          <Text style={s.continueBtnText}>
            {loading ? 'Saving…' : selected.length > 0
              ? `Continue with ${selected.length} crop${selected.length > 1 ? 's' : ''} →`
              : 'Select at least one crop'}
          </Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },
  content: { padding: Spacing.xl },
  welcome: { fontFamily: Fonts.mono, fontSize: 10, color: Colors.leaf, letterSpacing: 1, textTransform: 'uppercase', marginTop: 10 },
  title: { fontFamily: Fonts.display, fontSize: 24, fontWeight: '800', color: Colors.white, marginTop: 5 },
  sub: { fontFamily: Fonts.body, fontSize: 13, color: Colors.grey2, marginTop: 4, marginBottom: 20, lineHeight: 19 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  cropItem: {
    width: '47%', backgroundColor: Colors.card,
    borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: Radius.lg, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  cropSel: { backgroundColor: Colors.leafDim, borderColor: Colors.leaf },
  cropEmoji: { fontSize: 24 },
  cropName: { flex: 1, fontFamily: Fonts.semibold, fontSize: 13, color: Colors.white },
  cropNameSel: { color: Colors.leaf },
  checkbox: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  checkboxSel: { backgroundColor: Colors.leaf, borderColor: Colors.leaf },
  checkmark: { fontSize: 10, color: '#041a0a', fontWeight: '800' },
  continueBtn: { backgroundColor: Colors.leaf, borderRadius: 12, padding: 14, alignItems: 'center' },
  continueBtnDis: { opacity: 0.5 },
  continueBtnText: { fontFamily: Fonts.display, fontSize: 16, color: '#041a0a', fontWeight: '800' },
});
