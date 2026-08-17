import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useFarmProfile } from '../context/FarmProfileContext';
import { getContextualAdvisories, getWeatherData } from '../api/farmerApi';

const GREEN = '#2e7d32';
const LIGHT_GREEN = '#e8f5e9';

export default function AdvisoryListScreen({ navigation }) {
  const { token } = useAuth();
  const { profile, isProfileComplete } = useFarmProfile();
  const [advisories, setAdvisories] = useState([]);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const fetchAdvisories = async () => {
    try {
      setLoading(true);
      
      // Get contextual advisories
      const advRes = await getContextualAdvisories(token);
      if (advRes.success) {
        setAdvisories(advRes.data || []);
      }

      // Try to get weather data if profile is complete
      if (isProfileComplete() && profile._id) {
        try {
          const weatherRes = await getWeatherData(profile._id, token);
          if (weatherRes.success) {
            setWeather(weatherRes.data);
          }
        } catch (err) {
          console.log('Weather data unavailable');
        }
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to load advisories');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchAdvisories(); }, [isProfileComplete()]);

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={GREEN} />
        <Text style={{ color: '#888', marginTop: 12 }}>Loading advisories...</Text>
      </View>
    );
  }

  if (!isProfileComplete()) {
    return (
      <ScrollView style={s.container}>
        <View style={s.emptyContainer}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>🌾</Text>
          <Text style={s.emptyTitle}>Complete Your Profile</Text>
          <Text style={s.emptyText}>To receive personalized advisories, please complete your farm profile with your location and crop information.</Text>
          <TouchableOpacity
            style={s.btnPrimary}
            onPress={() => navigation.navigate('More', { screen: 'Profile' })}
          >
            <Text style={s.btnText}>Go to Profile</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  if (advisories.length === 0) {
    return (
      <ScrollView style={s.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAdvisories(); }} />}>
        <View style={s.emptyContainer}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>📋</Text>
          <Text style={s.emptyTitle}>No Advisories</Text>
          <Text style={s.emptyText}>Check back soon for advisories specific to your crop and location.</Text>
          <TouchableOpacity style={s.btnPrimary} onPress={() => { setRefreshing(true); fetchAdvisories(); }}>
            <Text style={s.btnText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={s.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAdvisories(); }} />}>
      {/* Weather widget */}
      {weather && (
        <View style={s.weatherCard}>
          <Text style={s.weatherTitle}>🌤️ Current Weather at Your Location</Text>
          <View style={s.weatherRow}>
            <View style={s.weatherItem}>
              <Text style={s.weatherLabel}>🌡️ Temperature</Text>
              <Text style={s.weatherValue}>{weather.temperature?.celsius || 'N/A'}°C</Text>
            </View>
            <View style={s.weatherItem}>
              <Text style={s.weatherLabel}>💧 Rainfall</Text>
              <Text style={s.weatherValue}>{weather.precipitation?.mm || '0'} mm</Text>
            </View>
            <View style={s.weatherItem}>
              <Text style={s.weatherLabel}>💨 Humidity</Text>
              <Text style={s.weatherValue}>{weather.humidity?.percent || 'N/A'}%</Text>
            </View>
          </View>
        </View>
      )}

      {/* Advisories */}
      <Text style={s.sectionTitle}>🌱 Your Personalized Advisories</Text>
      {advisories.map((a) => (
        <TouchableOpacity
          key={a._id}
          style={s.advCard}
          onPress={() => setExpanded(expanded === a._id ? null : a._id)}
          activeOpacity={0.9}
        >
          <View style={s.advCardTop}>
            <View style={{ flex: 1 }}>
              <Text style={s.advCrop}>{a.crop}</Text>
              <Text style={s.advActivity}>{a.activity}</Text>
            </View>
            <View style={s.sourceBadge}>
              <Text style={s.sourceBadgeText}>📚</Text>
            </View>
          </View>

          <Text style={s.advDesc}>{a.description}</Text>

          {/* Contextual Reason */}
          {a.contextualReason && (
            <View style={s.reasonBox}>
              <Text style={s.reasonLabel}>💡 Why This Matters</Text>
              <Text style={s.reasonText}>{a.contextualReason}</Text>
            </View>
          )}

          {/* Timing info */}
          {a.timing && (
            <Text style={s.advTiming}>⏰ {a.timing}</Text>
          )}

          {/* Source attribution */}
          {a.source && (
            <Text style={s.advSource}>📖 Source: {a.source}</Text>
          )}

          <Text style={s.expandHint}>
            {expanded === a._id ? '▲ Show less' : '▼ Show details'}
          </Text>

          {expanded === a._id && (
            <View style={s.expandedContent}>
              <Text style={s.expandedTitle}>Additional Information</Text>
              <Text style={s.expandedText}>This advisory is tailored to your farm based on your crop type ({a.crop}), current growth stage, and location.</Text>
            </View>
          )}
        </TouchableOpacity>
      ))}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, minHeight: 400 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  weatherCard: { backgroundColor: '#fff', marginHorizontal: 12, marginVertical: 12, padding: 16, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#ff9800', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 1 },
  weatherTitle: { fontSize: 14, fontWeight: '700', color: '#ff9800', marginBottom: 12 },
  weatherRow: { flexDirection: 'row', justifyContent: 'space-between' },
  weatherItem: { flex: 1, alignItems: 'center' },
  weatherLabel: { fontSize: 11, color: '#888', marginBottom: 4 },
  weatherValue: { fontSize: 16, fontWeight: '800', color: '#1a1a1a' },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#555', marginHorizontal: 12, marginVertical: 12, textTransform: 'uppercase', letterSpacing: 0.3 },
  advCard: { backgroundColor: '#fff', marginHorizontal: 12, marginVertical: 6, padding: 14, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: GREEN, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 1 },
  advCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  advCrop: { fontSize: 11, fontWeight: '700', color: GREEN, textTransform: 'uppercase', letterSpacing: 0.3 },
  advActivity: { fontSize: 15, fontWeight: '700', color: '#1a1a1a', marginTop: 4 },
  sourceBadge: { backgroundColor: LIGHT_GREEN, width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  advDesc: { fontSize: 13, color: '#555', lineHeight: 19, marginBottom: 10 },
  reasonBox: { backgroundColor: '#f0f8f0', padding: 10, borderRadius: 8, marginBottom: 10, borderLeftWidth: 3, borderLeftColor: GREEN },
  reasonLabel: { fontSize: 11, fontWeight: '700', color: GREEN, marginBottom: 4 },
  reasonText: { fontSize: 12, color: '#1b5e20', lineHeight: 18 },
  advTiming: { fontSize: 12, color: '#f57c00', fontWeight: '600', marginBottom: 8 },
  advSource: { fontSize: 11, color: '#888', fontStyle: 'italic', marginBottom: 8 },
  expandHint: { fontSize: 11, color: GREEN, fontWeight: '600', marginTop: 8 },
  expandedContent: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#eee' },
  expandedTitle: { fontSize: 12, fontWeight: '700', color: '#1a1a1a', marginBottom: 6 },
  expandedText: { fontSize: 12, color: '#555', lineHeight: 18 },
  btnPrimary: { backgroundColor: GREEN, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, alignItems: 'center', marginTop: 12 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
