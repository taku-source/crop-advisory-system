import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import { identifyDisease } from '../api';

const GREEN = '#2e7d32';
const LIGHT_GREEN = '#e8f5e9';

const CROPS = ['Maize', 'Tomato', 'Beans'];

const SYMPTOMS_BY_CROP = {
  Maize: [
    'Yellow leaves', 'Yellow streaks along veins', 'Grey rectangular spots',
    'Brown spots', 'Rust-coloured pustules', 'Cigar-shaped lesions',
    'Stunted growth', 'Wilting', 'Leaf blight', 'White powder on leaves',
  ],
  Tomato: [
    'Water-soaked spots', 'Brown spots with rings', 'White mould on leaves',
    'Wilting', 'Stem lesions', 'Brown stem inside', 'Rapid plant death',
    'Yellow leaves', 'Fruit rot',
  ],
  Beans: [
    'Angular brown spots', 'Spots limited by leaf veins', 'Rust pustules',
    'Yellow leaves', 'Premature leaf drop', 'Brown lesions on pods',
  ],
};

export default function DiseaseIdentifierScreen() {
  const [step, setStep]                   = useState(1);
  const [crop, setCrop]                   = useState('');
  const [selectedSymptoms, setSelected]   = useState([]);
  const [results, setResults]             = useState(null);
  const [loading, setLoading]             = useState(false);

  const toggleSymptom = (s) =>
    setSelected((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

  const handleIdentify = async () => {
    if (selectedSymptoms.length === 0) {
      return Alert.alert('Select Symptoms', 'Please select at least one symptom.');
    }
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

  const reset = () => { setStep(1); setCrop(''); setSelected([]); setResults(null); };

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }}>

      {/* Step indicator */}
      <View style={s.stepRow}>
        {[1, 2, 3].map((n) => (
          <View key={n} style={s.stepItem}>
            <View style={[s.stepDot, step >= n && s.stepDotActive]}>
              <Text style={[s.stepNum, step >= n && s.stepNumActive]}>{n}</Text>
            </View>
            <Text style={[s.stepLabel, step >= n && { color: GREEN }]}>
              {n === 1 ? 'Select Crop' : n === 2 ? 'Symptoms' : 'Results'}
            </Text>
          </View>
        ))}
      </View>

      {/* ── Step 1: Crop ── */}
      {step === 1 && (
        <View>
          <Text style={s.heading}>Which crop is affected?</Text>
          {CROPS.map((c) => (
            <TouchableOpacity key={c} style={[s.optBtn, crop === c && s.optBtnActive]}
              onPress={() => { setCrop(c); setStep(2); }}>
              <Text style={s.optIcon}>{c === 'Maize' ? '🌽' : c === 'Tomato' ? '🍅' : '🫘'}</Text>
              <Text style={[s.optText, crop === c && s.optTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* ── Step 2: Symptoms ── */}
      {step === 2 && (
        <View>
          <Text style={s.heading}>Select all symptoms you can see on your {crop}</Text>
          <Text style={s.subheading}>{selectedSymptoms.length} symptom(s) selected</Text>

          {(SYMPTOMS_BY_CROP[crop] || []).map((sym) => {
            const sel = selectedSymptoms.includes(sym);
            return (
              <TouchableOpacity key={sym} style={[s.symptomBtn, sel && s.symptomBtnActive]}
                onPress={() => toggleSymptom(sym)} activeOpacity={0.7}>
                <View style={[s.checkbox, sel && s.checkboxActive]}>
                  {sel && <Text style={s.checkmark}>✓</Text>}
                </View>
                <Text style={[s.symptomText, sel && s.symptomTextActive]}>{sym}</Text>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity style={[s.btnPrimary, selectedSymptoms.length === 0 && s.btnDisabled]}
            onPress={handleIdentify} disabled={loading || selectedSymptoms.length === 0}>
            {loading
              ? <><ActivityIndicator color="#fff" /><Text style={[s.btnText, { marginLeft: 8 }]}>Identifying...</Text></>
              : <Text style={s.btnText}>🔍 Identify Disease</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={s.btnSecondary} onPress={() => { setStep(1); setSelected([]); }}>
            <Text style={s.btnSecondaryText}>← Back</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Step 3: Results ── */}
      {step === 3 && results && (
        <View>
          <Text style={s.heading}>Results for {crop}</Text>
          <Text style={s.subheading}>Based on {selectedSymptoms.length} symptom(s) selected</Text>

          {results.length === 0 && (
            <View style={s.noResultCard}>
              <Text style={{ fontSize: 40, marginBottom: 10 }}>🤔</Text>
              <Text style={s.noResultTitle}>No Match Found</Text>
              <Text style={s.noResultText}>
                The symptoms you selected did not match any disease in our database.
                Please consult your local Agricultural Extension Officer (Agritex).
              </Text>
            </View>
          )}

          {results.map((r, i) => (
            <View key={i} style={[s.resultCard, i === 0 && s.resultCardTop]}>
              {i === 0 && <View style={s.topMatchBadge}><Text style={s.topMatchText}>Best Match</Text></View>}

              <View style={s.resultHeader}>
                <Text style={s.resultName}>{r.disease.diseaseName}</Text>
                <View style={[s.sevBadge, { backgroundColor: r.disease.severity === 'High' ? '#e53935' : r.disease.severity === 'Medium' ? '#fb8c00' : '#43a047' }]}>
                  <Text style={s.sevText}>{r.disease.severity}</Text>
                </View>
              </View>

              {/* Match score bar */}
              <View style={s.scoreRow}>
                <Text style={s.scoreLabel}>Match confidence:</Text>
                <Text style={s.scoreVal}>{r.matchScore}%</Text>
              </View>
              <View style={s.scoreBar}>
                <View style={[s.scoreBarFill, { width: `${r.matchScore}%`, backgroundColor: r.matchScore >= 70 ? GREEN : r.matchScore >= 40 ? '#fb8c00' : '#e53935' }]} />
              </View>

              <Text style={s.sectionLabel}>Description</Text>
              <Text style={s.bodyText}>{r.disease.description}</Text>

              <Text style={s.sectionLabel}>Causes</Text>
              <Text style={s.bodyText}>{r.disease.causes}</Text>

              <Text style={s.sectionLabel}>Treatment</Text>
              <View style={s.highlightBox}>
                <Text style={s.highlightText}>{r.disease.treatment}</Text>
              </View>

              <Text style={s.sectionLabel}>Prevention</Text>
              <Text style={s.bodyText}>{r.disease.prevention}</Text>
            </View>
          ))}

          <View style={s.agritexBox}>
            <Text style={s.agritexTitle}>⚠️ Important</Text>
            <Text style={s.agritexText}>
              This is a guidance tool only. For confirmation and treatment advice,
              contact your local Agritex Extension Officer.
            </Text>
          </View>

          <TouchableOpacity style={s.btnPrimary} onPress={reset}>
            <Text style={s.btnText}>🔄 New Identification</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  stepRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 24, marginTop: 8 },
  stepItem: { alignItems: 'center', flex: 1 },
  stepDot: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  stepDotActive: { backgroundColor: GREEN },
  stepNum: { fontSize: 14, fontWeight: '700', color: '#aaa' },
  stepNumActive: { color: '#fff' },
  stepLabel: { fontSize: 11, color: '#aaa', textAlign: 'center' },
  heading: { fontSize: 17, fontWeight: '700', color: '#1a1a1a', marginBottom: 6 },
  subheading: { fontSize: 13, color: '#888', marginBottom: 16 },
  optBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 10, borderWidth: 1.5, borderColor: '#e0e0e0', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  optBtnActive: { borderColor: GREEN, backgroundColor: LIGHT_GREEN },
  optIcon: { fontSize: 28, marginRight: 14 },
  optText: { fontSize: 16, fontWeight: '600', color: '#333' },
  optTextActive: { color: GREEN },
  symptomBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1.5, borderColor: '#e8e8e8' },
  symptomBtnActive: { borderColor: GREEN, backgroundColor: LIGHT_GREEN },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#ccc', marginRight: 12, justifyContent: 'center', alignItems: 'center' },
  checkboxActive: { backgroundColor: GREEN, borderColor: GREEN },
  checkmark: { color: '#fff', fontSize: 13, fontWeight: '800' },
  symptomText: { fontSize: 14, color: '#333', flex: 1 },
  symptomTextActive: { color: GREEN, fontWeight: '600' },
  btnPrimary: { backgroundColor: GREEN, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 16, flexDirection: 'row', justifyContent: 'center' },
  btnDisabled: { backgroundColor: '#aaa' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  btnSecondary: { padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 10, borderWidth: 1.5, borderColor: '#ddd', backgroundColor: '#fff' },
  btnSecondaryText: { color: '#555', fontWeight: '700', fontSize: 14 },
  noResultCard: { backgroundColor: '#fff', borderRadius: 14, padding: 28, alignItems: 'center', marginBottom: 16 },
  noResultTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 8 },
  noResultText: { fontSize: 13, color: '#666', textAlign: 'center', lineHeight: 20 },
  resultCard: { backgroundColor: '#fff', borderRadius: 14, padding: 18, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  resultCardTop: { borderWidth: 2, borderColor: GREEN },
  topMatchBadge: { backgroundColor: GREEN, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, marginBottom: 10 },
  topMatchText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  resultName: { fontSize: 17, fontWeight: '800', color: '#1a1a1a', flex: 1, marginRight: 10 },
  sevBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  sevText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  scoreLabel: { fontSize: 12, color: '#888' },
  scoreVal: { fontSize: 12, fontWeight: '700', color: GREEN },
  scoreBar: { height: 6, backgroundColor: '#eee', borderRadius: 3, marginBottom: 14 },
  scoreBarFill: { height: '100%', borderRadius: 3 },
  sectionLabel: { fontSize: 11, fontWeight: '800', color: '#555', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 12, marginBottom: 4 },
  bodyText: { fontSize: 13, color: '#444', lineHeight: 20 },
  highlightBox: { backgroundColor: '#e8f5e9', borderRadius: 8, padding: 12, marginTop: 4 },
  highlightText: { fontSize: 13, color: '#1b5e20', lineHeight: 20, fontWeight: '500' },
  agritexBox: { backgroundColor: '#fff3e0', borderRadius: 12, padding: 14, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#fb8c00' },
  agritexTitle: { fontSize: 13, fontWeight: '700', color: '#e65100', marginBottom: 4 },
  agritexText: { fontSize: 12, color: '#bf360c', lineHeight: 18 },
});
