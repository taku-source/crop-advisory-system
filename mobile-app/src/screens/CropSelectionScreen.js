import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getAvailableCrops, getCropInfo, selectCrop } from '../api';
import { useAuth } from '../context/AuthContext';

const GREEN = '#2e7d32';
export default function CropSelectionScreen() {
  const { updateUser } = useAuth();
  const [crops, setCrops] = useState([]);
  const [selectedCrops, setSelectedCrops] = useState([]);
  const [cropInfo, setCropInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAvailableCrops()
      .then((response) => setCrops(response.data.crops || []))
      .catch((error) => Alert.alert('Unable to load crops', error.response?.data?.message || 'Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  const chooseCrop = async (crop) => {
    setSelectedCrops((current) => current.includes(crop) ? current.filter((item) => item !== crop) : current.length < 3 ? [...current, crop] : current);
    try {
      const response = await getCropInfo(crop);
      setCropInfo(response.data);
    } catch (error) {
      Alert.alert('Crop information unavailable', error.response?.data?.message || 'Please try again.');
    }
  };

  const confirmSelection = async () => {
    if (!selectedCrops.length) return;
    setSaving(true);
    try {
      const response = await selectCrop(selectedCrops);
      updateUser(response.data.farmer);
    } catch (error) {
      Alert.alert('Could not save crop', error.response?.data?.message || 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <Text style={s.eyebrow}>PROFILE SETUP</Text>
      <Text style={s.title}>Choose your primary crop</Text>
      <Text style={s.subtitle}>
        Select up to three crops. Your dashboard will contain a separate seasonal plan and stage checklist for each crop.
      </Text>
      <Text style={{ color: GREEN, fontWeight: '800', marginTop: 14 }}>{selectedCrops.length}/3 crops selected</Text>

      {loading ? <ActivityIndicator color={GREEN} size="large" style={{ marginTop: 30 }} /> : (
        <View style={s.grid}>
          {crops.map((crop) => {
            const active = selectedCrops.includes(crop.name);
            return (
              <TouchableOpacity key={crop.name} onPress={() => chooseCrop(crop.name)} style={[s.crop, active && s.cropActive]}>
                <Text style={s.icon}>{crop.icon || '🌱'}</Text>
                <Text style={s.cropName}>{crop.name}</Text>
                <Text style={s.cropHint}>{crop.description}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {cropInfo && (
        <View style={s.infoBox}>
          <Text style={s.infoTitle}>{cropInfo.crop}</Text>
          <Text style={s.infoText}>{cropInfo.description}</Text>
          <Text style={s.source}>Planting: {cropInfo.plantingPeriod || 'Region III main season'}</Text>
          <Text style={s.source}>Source: {cropInfo.source}</Text>
        </View>
      )}

      <TouchableOpacity disabled={!selectedCrops.length || saving} onPress={confirmSelection} style={[s.button, (!selectedCrops.length || saving) && s.disabled]}>
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>Continue with {selectedCrops.length || 0} crop{selectedCrops.length === 1 ? '' : 's'}</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 22, paddingTop: 50 },
  eyebrow: { color: GREEN, fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  title: { color: '#17351f', fontSize: 28, fontWeight: '800', marginTop: 8 },
  subtitle: { color: '#53665a', fontSize: 14, lineHeight: 21, marginTop: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 24 },
  crop: { width: '47%', minHeight: 116, backgroundColor: '#fff', borderWidth: 1, borderColor: '#d6e4d8', borderRadius: 14, padding: 14 },
  cropActive: { backgroundColor: '#e8f5e9', borderColor: GREEN, borderWidth: 2 },
  icon: { fontSize: 28 },
  cropName: { color: '#17351f', fontSize: 15, fontWeight: '800', marginTop: 7 },
  cropHint: { color: '#708276', fontSize: 11, marginTop: 4 },
  infoBox: { backgroundColor: '#e8f5e9', borderLeftWidth: 3, borderLeftColor: GREEN, borderRadius: 10, padding: 15, marginTop: 22 },
  infoTitle: { color: '#17351f', fontSize: 17, fontWeight: '800' },
  infoText: { color: '#45604b', fontSize: 13, lineHeight: 19, marginTop: 7 },
  source: { color: GREEN, fontSize: 11, marginTop: 7 },
  button: { backgroundColor: GREEN, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 24, marginBottom: 30 },
  disabled: { opacity: 0.55 },
  buttonText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
