import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useFarmProfile } from '../context/FarmProfileContext';
import { getSeasonalPlan, getWeatherData, updateCropProgress } from '../api/farmerApi';

const GREEN = '#2e7d32';
const LIGHT_GREEN = '#e8f5e9';

export default function AdvisoryListScreen({ navigation }) {
  const { token } = useAuth();
  const { profile, isProfileComplete } = useFarmProfile();
  const [advisories, setAdvisories] = useState([]);
  const [plan, setPlan] = useState(null);
  const [plans, setPlans] = useState([]);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const fetchAdvisories = async () => {
    try {
      setLoading(true);
      
      // Build the farmer's plan from agricultural knowledge and local weather.
      const planRes = await getSeasonalPlan(token);
      if (planRes.success) {
        const nextPlan = planRes.data;
        const nextPlans = nextPlan.plans || [nextPlan];
        setPlans(nextPlans);
        setPlan(nextPlans[0]);
        setAdvisories((nextPlan.currentActions || []).map((action, index) => ({
          ...action,
          _id: `${action.activity}-${index}`,
          crop: nextPlan.crop,
          contextualReason: action.reason,
          timing: action.timing,
        })));
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

  const toggleStage = async (stage) => {
    try {
      await updateCropProgress(stage.stageId, { crop: plan.crop, stageName: stage.stage, completed: !stage.completed }, token);
      setPlan((current) => ({ ...current, seasonalTimeline: current.seasonalTimeline.map((item) => item.stageId === stage.stageId ? { ...item, completed: !stage.completed } : item) }));
    } catch (error) {
      Alert.alert('Progress not saved', error.response?.data?.message || 'Please try again.');
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

      {/* Seasonal plan */}
      {plan && (
        <>
        {plans.length > 1 && <View style={{ paddingHorizontal: 16, paddingTop: 12 }}><Text style={s.guidanceTitle}>Your selected crops</Text><ScrollView horizontal showsHorizontalScrollIndicator={false}>{plans.map((cropPlan) => <TouchableOpacity key={cropPlan.crop} onPress={() => { setPlan(cropPlan); setAdvisories((cropPlan.currentActions || []).map((action, index) => ({ ...action, _id: `${action.activity}-${index}`, crop: cropPlan.crop, contextualReason: action.reason, timing: action.timing }))); }} style={{ backgroundColor: cropPlan.crop === plan.crop ? GREEN : '#fff', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, marginRight: 8, borderWidth: 1, borderColor: GREEN }}><Text style={{ color: cropPlan.crop === plan.crop ? '#fff' : GREEN, fontWeight: '800' }}>{cropPlan.crop}</Text></TouchableOpacity>)}</ScrollView></View>}
        <View style={s.planCard}>
          <Text style={s.planEyebrow}>{plan.region}</Text>
          <Text style={s.planTitle}>{plan.crop} Seasonal Plan</Text>
          <Text style={s.planStage}>Current stage: {plan.currentStatus?.stage}</Text>
          <Text style={s.planMessage}>{plan.currentStatus?.message}</Text>
          <Text style={s.advSource}>📖 Guidance: {plan.references?.agriculturalKnowledge}</Text>
          {plan.references?.weatherData && <Text style={s.advSource}>🌦️ Weather: {plan.references.weatherData}</Text>}
        </View>
        </>
      )}

      {plan?.seasonalTimeline?.length > 0 && (
        <View style={s.guidanceCard}>
          <Text style={s.guidanceTitle}>Season stages</Text>
          <Text style={s.datasetText}>Mark each stage when the work is finished.</Text>
          {plan.seasonalTimeline.map((stage) => (
            <View key={stage.stageId} style={{ backgroundColor: stage.completed ? '#e8f5e9' : '#fff', borderRadius: 10, padding: 13, marginTop: 10, borderWidth: 1, borderColor: stage.completed ? GREEN : '#d6e4d8' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={s.pestName}>{stage.stage}</Text>
                  <Text style={s.guidanceText}>{stage.daysAfterPlanting} days after planting</Text>
                </View>
                <TouchableOpacity onPress={() => toggleStage(stage)} style={{ backgroundColor: GREEN, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 10 }}>
                  <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>{stage.completed ? 'Undo' : 'Done'}</Text>
                </TouchableOpacity>
              </View>
              <Text style={s.guidanceText}>{stage.description}</Text>
              {stage.activities?.map((activity, index) => <Text key={index} style={s.guidanceText}>• {activity.activityName}: {activity.description}{activity.timing ? ` (${activity.timing})` : ''}</Text>)}
            </View>
          ))}
        </View>
      )}

      {plan?.cropGuidance && (
        <View style={s.guidanceCard}>
          <Text style={s.guidanceTitle}>Verified crop guidance</Text>

          <Text style={s.guidanceHeading}>Planting setup</Text>
          {plan.cropGuidance.planting?.spacingOptions?.map((option, index) => (
            <Text key={index} style={s.guidanceText}>
              Rows {option.rowCm} cm · Within row {option.withinRowCm} cm{option.approxPlantsPerHa ? ` · ${option.approxPlantsPerHa} plants/ha` : ''}
            </Text>
          ))}
          {plan.cropGuidance.planting?.basinSpacingCm && <Text style={s.guidanceText}>Basins: {plan.cropGuidance.planting.basinSpacingCm.join(' x ')} cm</Text>}

          <Text style={s.guidanceHeading}>Fertilizer records</Text>
          {plan.cropGuidance.fertilizer?.map((item, index) => <Text key={index} style={s.guidanceText}>{item.type}: {item.rateKgPerHa ? `${item.rateKgPerHa} kg/ha` : 'Rate not stated'} · {item.description}</Text>)}

          <Text style={s.guidanceHeading}>Weed management</Text>
          <Text style={s.guidanceText}>{plan.cropGuidance.weedManagement?.earlyControl || 'No verified weed timing recorded.'}</Text>
          {plan.cropGuidance.weedManagement?.methods?.length > 0 && <Text style={s.guidanceText}>Methods: {plan.cropGuidance.weedManagement.methods.join(', ')}</Text>}

          <Text style={s.guidanceHeading}>Pest thresholds</Text>
          {plan.cropGuidance.pests?.map((pest) => (
            <View key={pest.pestId}>
              <Text style={s.pestName}>{pest.pestName}</Text>
              {pest.thresholds?.map((threshold, index) => <Text key={index} style={s.guidanceText}>{threshold.stage}: damage {threshold.damagePercent || 'not stated'}{threshold.eggMassPercent ? ` · eggs ${threshold.eggMassPercent}` : ''}{threshold.action ? ` · ${threshold.action}` : ''}</Text>)}
              {pest.management?.length > 0 && <Text style={s.guidanceText}>Management: {pest.management.join(', ')}</Text>}
            </View>
          ))}
          <Text style={s.datasetText}>Dataset version: {plan.cropGuidance.datasetVersion || 'not stated'}</Text>
        </View>
      )}

      <Text style={s.sectionTitle}>🌱 Your Next Actions</Text>
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
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#ffffff', marginHorizontal: 12, marginVertical: 12, textTransform: 'uppercase', letterSpacing: 0.3 },
  advCard: { backgroundColor: '#fff', marginHorizontal: 12, marginVertical: 6, padding: 14, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: GREEN, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 1 },
  advCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  advCrop: { fontSize: 11, fontWeight: '700', color: GREEN, textTransform: 'uppercase', letterSpacing: 0.3 },
  advActivity: { fontSize: 15, fontWeight: '700', color: '#1a1a1a', marginTop: 4 },
  sourceBadge: { backgroundColor: LIGHT_GREEN, width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  advDesc: { fontSize: 13, color: '#ffffff', lineHeight: 19, marginBottom: 10 },
  reasonBox: { backgroundColor: '#f0f8f0', padding: 10, borderRadius: 8, marginBottom: 10, borderLeftWidth: 3, borderLeftColor: GREEN },
  reasonLabel: { fontSize: 11, fontWeight: '700', color: GREEN, marginBottom: 4 },
  reasonText: { fontSize: 12, color: '#1b5e20', lineHeight: 18 },
  advTiming: { fontSize: 12, color: '#f57c00', fontWeight: '600', marginBottom: 8 },
  advSource: { fontSize: 11, color: '#888', fontStyle: 'italic', marginBottom: 8 },
  expandHint: { fontSize: 11, color: GREEN, fontWeight: '600', marginTop: 8 },
  expandedContent: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#eee' },
  expandedTitle: { fontSize: 12, fontWeight: '700', color: '#1a1a1a', marginBottom: 6 },
  expandedText: { fontSize: 12, color: '#ffffff', lineHeight: 18 },
  btnPrimary: { backgroundColor: GREEN, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, alignItems: 'center', marginTop: 12 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  planCard: { backgroundColor: '#e8f5e9', marginHorizontal: 12, marginTop: 12, padding: 16, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: GREEN },
  planEyebrow: { color: GREEN, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  planTitle: { color: '#17351f', fontSize: 20, fontWeight: '800', marginTop: 5 },
  planStage: { color: '#35623d', fontSize: 13, fontWeight: '700', marginTop: 8 },
  planMessage: { color: '#45604b', fontSize: 13, lineHeight: 19, marginTop: 6, marginBottom: 4 },
  guidanceCard: { backgroundColor: '#fff', marginHorizontal: 12, marginTop: 12, padding: 16, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: GREEN },
  guidanceTitle: { color: '#17351f', fontSize: 17, fontWeight: '800', marginBottom: 4 },
  guidanceHeading: { color: GREEN, fontSize: 12, fontWeight: '800', marginTop: 14, marginBottom: 4 },
  guidanceText: { color: '#45604b', fontSize: 12, lineHeight: 18, marginBottom: 3 },
  pestName: { color: '#17351f', fontSize: 13, fontWeight: '800', marginTop: 5 },
  datasetText: { color: '#708276', fontSize: 11, marginTop: 14 },
});
