import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, TextInput, Picker,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useFarmProfile } from '../context/FarmProfileContext';
import { matchSymptoms, getCropSymptoms, crops } from '../api/farmerApi';

const GREEN = '#2e7d32';
const LIGHT_GREEN = '#e8f5e9';

export default function DiseaseIdentifierScreen() {
  const { token } = useAuth();
  const { profile } = useFarmProfile();
  const [step, setStep] = useState(1);
  const [crop, setCrop] = useState(profile?.primaryCrop || '');
  const [customSymptom, setCustomSymptom] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [availableSymptoms, setAvailableSymptoms] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(null);

  // Load available symptoms when crop changes
  useEffect(() => {
    if (crop) {
      fetchSymptoms();
    }
  }, [crop]);

  const fetchSymptoms = async () => {
    try {
      const res = await getCropSymptoms(crop, token);
      if (res.success && res.data) {
        // Extract unique symptom names from diseases
        const symptoms = new Set();
        res.data.forEach((disease) => {
          if (disease.symptoms) {
            disease.symptoms.forEach((sym) => {
              symptoms.add(sym.symptom);
            });
          }
        });
        setAvailableSymptoms(Array.from(symptoms).sort());
      }
    } catch (err) {
      console.log('Could not load symptoms:', err);
      setAvailableSymptoms([]);
    }
  };

  const toggleSymptom = (symptom) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((x) => x !== symptom)
        : [...prev, symptom]
    );
  };

  const handleAddCustom = () => {
    if (customSymptom.trim()) {
      toggleSymptom(customSymptom.trim());
      setCustomSymptom('');
    }
  };

  const handleIdentify = async () => {
    if (!crop) {
      return Alert.alert('Select Crop', 'Please select a crop first.');
    }
    if (selectedSymptoms.length === 0) {
      return Alert.alert('Select Symptoms', 'Please select at least one symptom.');
    }

    setLoading(true);
    try {
      const res = await matchSymptoms(selectedSymptoms, crop, token);
      if (res.success) {
        setResults(res.data || []);
        setStep(3);
      } else {
        Alert.alert('No Results', 'No disease matches found for the selected symptoms.');
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Could not identify disease. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(1);
    setCrop(profile?.primaryCrop || '');
    setSelectedSymptoms([]);
    setResults(null);
    setCustomSymptom('');
  };

  const getConfidenceColor = (score) => {
    if (score >= 80) return '#2e7d32'; // High confidence - green
    if (score >= 60) return '#f57c00'; // Medium confidence - orange
    if (score >= 40) return '#fbc02d'; // Low confidence - yellow
    return '#c62828'; // Very low confidence - red
  };

  const getConfidenceLabel = (score) => {
    if (score >= 80) return 'HIGH';
    if (score >= 60) return 'MEDIUM';
    if (score >= 40) return 'LOW';
    return 'VERY LOW';
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 24 }}>
      {/* Step indicator */}
      <View style={s.stepRow}>
        {[1, 2, 3].map((n) => (
          <View key={n} style={s.stepItem}>
            <View style={[s.stepDot, step >= n && s.stepDotActive]}>
              <Text style={[s.stepNum, step >= n && s.stepNumActive]}>{n}</Text>
            </View>
            <Text style={[s.stepLabel, step >= n && { color: GREEN }]}>
              {n === 1 ? 'Crop' : n === 2 ? 'Symptoms' : 'Results'}
            </Text>
          </View>
        ))}
      </View>

      {/* ──────── Step 1: Crop ──────── */}
      {step === 1 && (
        <View>
          <Text style={s.heading}>🌱 Which crop is affected?</Text>
          <View style={s.pickerContainer}>
            <Picker
              selectedValue={crop}
              onValueChange={(value) => {
                setCrop(value);
                setSelectedSymptoms([]);
              }}
              style={s.picker}
            >
              <Picker.Item label="Select a crop..." value="" />
              {crops.map((c) => <Picker.Item key={c} label={c} value={c} />)}
            </Picker>
          </View>

          {crop && (
            <TouchableOpacity
              style={s.btnPrimary}
              onPress={() => setStep(2)}
            >
              <Text style={s.btnText}>Continue to Symptoms</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* ──────── Step 2: Symptoms ──────── */}
      {step === 2 && (
        <View>
          <Text style={s.heading}>🔍 What symptoms do you see?</Text>
          <Text style={s.subheading}>Select all visible symptoms</Text>

          {/* Available symptoms */}
          <Text style={s.sectionTitle}>Common Symptoms for {crop}</Text>
          <View style={s.symptomsGrid}>
            {availableSymptoms.length > 0 ? (
              availableSymptoms.map((symptom) => (
                <TouchableOpacity
                  key={symptom}
                  style={[
                    s.symptomChip,
                    selectedSymptoms.includes(symptom) && s.symptomChipSelected,
                  ]}
                  onPress={() => toggleSymptom(symptom)}
                >
                  <Text
                    style={[
                      s.symptomChipText,
                      selectedSymptoms.includes(symptom) && s.symptomChipTextSelected,
                    ]}
                  >
                    {symptom}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={s.helpText}>No predefined symptoms available</Text>
            )}
          </View>

          {/* Custom symptom input */}
          <Text style={s.sectionTitle}>Add Custom Symptom</Text>
          <View style={s.customSymptomContainer}>
            <TextInput
              style={s.customSymptomInput}
              placeholder="Describe another symptom..."
              value={customSymptom}
              onChangeText={setCustomSymptom}
              placeholderTextColor="#ccc"
            />
            <TouchableOpacity style={s.addBtn} onPress={handleAddCustom}>
              <Text style={s.addBtnText}>+ Add</Text>
            </TouchableOpacity>
          </View>

          {/* Selected symptoms list */}
          {selectedSymptoms.length > 0 && (
            <View style={s.selectedList}>
              <Text style={s.sectionTitle}>Selected Symptoms ({selectedSymptoms.length})</Text>
              {selectedSymptoms.map((symptom) => (
                <View key={symptom} style={s.selectedItem}>
                  <Text style={s.selectedItemText}>✓ {symptom}</Text>
                  <TouchableOpacity onPress={() => toggleSymptom(symptom)}>
                    <Text style={s.removeText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Action buttons */}
          <View style={s.buttonRow}>
            <TouchableOpacity style={s.btnSecondary} onPress={() => setStep(1)}>
              <Text style={s.btnSecondaryText}>← Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.btnPrimary, { flex: 1, marginLeft: 8 }]}
              onPress={handleIdentify}
              disabled={loading || selectedSymptoms.length === 0}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={s.btnText}>Identify Disease</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ──────── Step 3: Results ──────── */}
      {step === 3 && results && (
        <View>
          <Text style={s.heading}>🔬 Disease Analysis Results</Text>
          <Text style={s.subheading}>Based on symptoms for {crop}</Text>

          {results.length === 0 ? (
            <View style={s.noResultsBox}>
              <Text style={s.noResultsText}>No matches found for the selected symptoms.</Text>
            </View>
          ) : (
            <>
              {results.map((result, idx) => (
                <TouchableOpacity
                  key={result._id}
                  style={[
                    s.resultCard,
                    idx === 0 && s.resultCardTop,
                  ]}
                  onPress={() => setExpanded(expanded === result._id ? null : result._id)}
                  activeOpacity={0.9}
                >
                  {/* Header */}
                  <View style={s.resultHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.resultRank}>
                        #{idx + 1} Match
                      </Text>
                      <Text style={s.resultDisease}>{result.diseaseName}</Text>
                    </View>
                    <View style={[
                      s.confidenceBadge,
                      { backgroundColor: getConfidenceColor(result.matchScore) + '20', borderColor: getConfidenceColor(result.matchScore) }
                    ]}>
                      <Text style={[s.confidenceScore, { color: getConfidenceColor(result.matchScore) }]}>
                        {result.matchScore.toFixed(0)}%
                      </Text>
                      <Text style={[s.confidenceLabel, { color: getConfidenceColor(result.matchScore), fontSize: 9 }]}>
                        {getConfidenceLabel(result.matchScore)}
                      </Text>
                    </View>
                  </View>

                  {/* Match info */}
                  <Text style={s.matchInfo}>
                    🎯 Matched {result.matchPercentage} of symptoms
                  </Text>

                  {/* Matched symptoms */}
                  {result.matchedSymptoms && result.matchedSymptoms.length > 0 && (
                    <View style={s.matchedBox}>
                      <Text style={s.matchedTitle}>Matching Symptoms:</Text>
                      {result.matchedSymptoms.map((sym) => (
                        <Text key={sym.symptom} style={s.matchedSymptom}>
                          ✓ {sym.symptom} (significance: {sym.weight}/10)
                        </Text>
                      ))}
                    </View>
                  )}

                  {/* Expandable management info */}
                  {expanded === result._id && (
                    <View style={s.expandedSection}>
                      <Text style={s.expandedTitle}>Recommended Management</Text>

                      {result.management?.preventiveMeasures && result.management.preventiveMeasures.length > 0 && (
                        <View style={{ marginBottom: 12 }}>
                          <Text style={s.managementSubtitle}>Prevention:</Text>
                          {result.management.preventiveMeasures.map((measure, i) => (
                            <Text key={i} style={s.managementText}>• {measure}</Text>
                          ))}
                        </View>
                      )}

                      {result.management?.treatmentMeasures && result.management.treatmentMeasures.length > 0 && (
                        <View>
                          <Text style={s.managementSubtitle}>Treatment:</Text>
                          {result.management.treatmentMeasures.map((measure, i) => (
                            <Text key={i} style={s.managementText}>• {measure}</Text>
                          ))}
                        </View>
                      )}

                      {result.severity && (
                        <View style={s.severityBox}>
                          <Text style={s.severityLabel}>Severity: <Text style={s.severityValue}>{result.severity}</Text></Text>
                        </View>
                      )}
                    </View>
                  )}

                  <Text style={s.expandHint}>
                    {expanded === result._id ? '▲ Show less' : '▼ Show management'}
                  </Text>
                </TouchableOpacity>
              ))}
            </>
          )}

          {/* Reset button */}
          <TouchableOpacity style={s.btnSecondary} onPress={reset}>
            <Text style={s.btnSecondaryText}>🔄 Start Over</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  stepRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 28, marginTop: 8 },
  stepItem: { alignItems: 'center', flex: 1 },
  stepDot: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  stepDotActive: { backgroundColor: GREEN },
  stepNum: { fontSize: 16, fontWeight: '700', color: '#999' },
  stepNumActive: { color: '#fff' },
  stepLabel: { fontSize: 11, fontWeight: '600', color: '#999', textAlign: 'center' },
  heading: { fontSize: 20, fontWeight: '800', color: '#1a1a1a', marginBottom: 8 },
  subheading: { fontSize: 13, color: '#888', marginBottom: 16 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#555', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 16, marginBottom: 10 },
  pickerContainer: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, backgroundColor: '#fff', marginBottom: 16, overflow: 'hidden' },
  picker: { height: 50 },
  symptomsGrid: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 16 },
  symptomChip: { backgroundColor: '#f0f0f0', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8, marginBottom: 8, borderWidth: 2, borderColor: '#ddd', display: 'inline-block' },
  symptomChipSelected: { backgroundColor: GREEN, borderColor: GREEN },
  symptomChipText: { fontSize: 12, color: '#555', fontWeight: '600' },
  symptomChipTextSelected: { color: '#fff' },
  helpText: { color: '#aaa', fontSize: 12, fontStyle: 'italic' },
  customSymptomContainer: { backgroundColor: '#fff', borderRadius: 10, flexDirection: 'row', padding: 8, marginBottom: 16 },
  customSymptomInput: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 13 },
  addBtn: { marginLeft: 8, backgroundColor: GREEN, borderRadius: 8, paddingHorizontal: 16, justifyContent: 'center' },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  selectedList: { backgroundColor: '#f0f8f0', borderRadius: 10, padding: 12, marginBottom: 16 },
  selectedItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#e0f2e0' },
  selectedItemText: { color: GREEN, fontSize: 13, fontWeight: '600' },
  removeText: { color: '#c62828', fontSize: 16, fontWeight: '700' },
  buttonRow: { flexDirection: 'row', marginTop: 20 },
  btnPrimary: { backgroundColor: GREEN, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 10, alignItems: 'center' },
  btnSecondary: { backgroundColor: '#fff', borderWidth: 2, borderColor: GREEN, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, alignItems: 'center', marginTop: 12 },
  btnSecondaryText: { color: GREEN, fontWeight: '700', fontSize: 14 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  resultCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#ddd', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 1 },
  resultCardTop: { borderLeftColor: GREEN },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  resultRank: { fontSize: 10, fontWeight: '700', color: GREEN, textTransform: 'uppercase' },
  resultDisease: { fontSize: 15, fontWeight: '800', color: '#1a1a1a', marginTop: 4 },
  confidenceBadge: { width: 60, alignItems: 'center', justifyContent: 'center', borderRadius: 10, borderWidth: 2, paddingVertical: 6 },
  confidenceScore: { fontSize: 16, fontWeight: '800' },
  confidenceLabel: { fontWeight: '700' },
  matchInfo: { fontSize: 12, color: '#555', marginBottom: 10, fontWeight: '600' },
  matchedBox: { backgroundColor: '#f0f8f0', borderRadius: 8, padding: 10, marginBottom: 10 },
  matchedTitle: { fontSize: 11, fontWeight: '700', color: GREEN, marginBottom: 6 },
  matchedSymptom: { fontSize: 12, color: '#1b5e20', marginBottom: 4 },
  expandedSection: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#e0e0e0' },
  expandedTitle: { fontSize: 12, fontWeight: '700', color: '#1a1a1a', marginBottom: 10 },
  managementSubtitle: { fontSize: 11, fontWeight: '700', color: GREEN, marginBottom: 6, marginTop: 8 },
  managementText: { fontSize: 12, color: '#555', marginBottom: 4, lineHeight: 18 },
  severityBox: { backgroundColor: '#fff3e0', borderRadius: 8, padding: 10, marginTop: 12 },
  severityLabel: { fontSize: 12, color: '#e65100', fontWeight: '600' },
  severityValue: { fontWeight: '800' },
  expandHint: { fontSize: 11, color: GREEN, fontWeight: '600', marginTop: 8, textAlign: 'right' },
  noResultsBox: { backgroundColor: '#fff', borderRadius: 10, padding: 20, alignItems: 'center' },
  noResultsText: { fontSize: 14, color: '#888' },
});
