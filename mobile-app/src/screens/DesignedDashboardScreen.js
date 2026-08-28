import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { getSeasonalPlan, getRecordSummary } from '../api';

const COLORS = { black: '#07120a', card: '#0f231a', green: '#4ade80', pale: '#d8f2db', muted: '#9fbfa8', blue: '#60a5fa' };

export default function DesignedDashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [plan, setPlan] = useState(null);
  const [summary, setSummary] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [planResponse, summaryResponse] = await Promise.all([getSeasonalPlan(), getRecordSummary()]);
      setPlan(planResponse.data?.data || null);
      setSummary(summaryResponse.data?.summary || null);
    } catch {
      setPlan(null);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const currentPlan = plan?.plans?.[0] || plan;
  const nextAction = currentPlan?.currentActions?.[0];
  const completed = currentPlan?.seasonalTimeline?.filter((stage) => stage.completed).length || 0;
  const totalStages = currentPlan?.seasonalTimeline?.length || 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />
      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={COLORS.green} />}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>Crop Advisory</Text>
            <Text style={styles.greeting}>Good day,</Text>
            <Text style={styles.name}>{user?.fullName || 'Farmer'}</Text>
            <Text style={styles.location}>Region III · {user?.district || 'Location pending'}</Text>
          </View>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Notifications')} accessibilityLabel="Notifications">
            <Text style={styles.icon}>🔔</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.hero}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroLabel}>CURRENT SEASON</Text>
            <Text style={styles.heroTitle}>{currentPlan?.crop || user?.primaryCrop || 'Your crop'}</Text>
            <Text style={styles.heroMeta}>{currentPlan?.farmerContext?.soilType || user?.soilType || 'Soil profile pending'} · {user?.farmSize || 'Farm size pending'}</Text>
            <View style={styles.stageBadge}><Text style={styles.stageText}>{currentPlan?.currentStatus?.stage || 'Pre-planting'}</Text></View>
          </View>
          <Text style={styles.cropMark}>🌱</Text>
        </View>

        <View style={styles.statsRow}>
          <Stat value={`${completed}/${totalStages}`} label="Stages complete" color={COLORS.green} />
          <Stat value={String(summary?.totalRecords || 0)} label="Farm records" color={COLORS.blue} />
          <Stat value={String(currentPlan?.currentActions?.length || 0)} label="Actions now" color="#c8a96e" />
        </View>

        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>What to do now</Text><Text style={styles.live}>LIVE PLAN</Text></View>
        <View style={styles.actionCard}>
          <Text style={styles.actionTitle}>{nextAction?.activity || currentPlan?.currentStatus?.stage || 'Complete your farm profile'}</Text>
          <Text style={styles.actionBody}>{nextAction?.description || currentPlan?.currentStatus?.message || 'Select a crop to receive your seasonal guidance.'}</Text>
          <Text style={styles.reason}>{nextAction?.reason || 'Guidance is generated from your crop, season, soil, and location.'}</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('Advisories')}><Text style={styles.primaryText}>View seasonal plan</Text></TouchableOpacity>
        </View>

        <View style={styles.quickGrid}>
          <QuickButton icon="🔍" label="Identify disease" onPress={() => navigation.navigate('Disease')} />
          <QuickButton icon="📝" label="Farm records" onPress={() => navigation.navigate('Records')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ value, label, color }) {
  return <View style={styles.stat}><Text style={[styles.statValue, { color }]}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}

function QuickButton({ icon, label, onPress }) {
  return <TouchableOpacity style={styles.quickButton} onPress={onPress}><Text style={styles.quickIcon}>{icon}</Text><Text style={styles.quickText}>{label}</Text><Text style={styles.arrow}>›</Text></TouchableOpacity>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.black },
  content: { padding: 18, paddingBottom: 32 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  eyebrow: { color: COLORS.green, fontSize: 11, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase' },
  greeting: { color: COLORS.muted, fontSize: 14, marginTop: 12 },
  name: { color: '#fff', fontSize: 26, fontWeight: '800', marginTop: 2 },
  location: { color: COLORS.muted, fontSize: 11, marginTop: 5 },
  iconButton: { width: 42, height: 42, borderRadius: 12, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#24462f' },
  icon: { fontSize: 18 },
  hero: { backgroundColor: '#102414', borderRadius: 22, padding: 20, borderWidth: 1, borderColor: '#2a5a3a', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  heroCopy: { flex: 1 },
  heroLabel: { color: COLORS.green, fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  heroTitle: { color: '#fff', fontSize: 28, fontWeight: '800', marginTop: 8 },
  heroMeta: { color: COLORS.pale, fontSize: 12, marginTop: 5 },
  stageBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(74,222,128,.13)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, marginTop: 14 },
  stageText: { color: COLORS.green, fontSize: 11, fontWeight: '700' },
  cropMark: { fontSize: 52, alignSelf: 'center' },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 22 },
  stat: { flex: 1, backgroundColor: COLORS.card, borderRadius: 14, padding: 13, borderWidth: 1, borderColor: 'rgba(255,255,255,.08)' },
  statValue: { fontSize: 21, fontWeight: '800' },
  statLabel: { color: COLORS.muted, fontSize: 10, marginTop: 5 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  live: { color: COLORS.green, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  actionCard: { backgroundColor: 'rgba(74,222,128,.12)', borderWidth: 1, borderColor: COLORS.green, borderRadius: 20, padding: 18, marginBottom: 14 },
  actionTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  actionBody: { color: COLORS.pale, fontSize: 13, lineHeight: 20, marginTop: 9 },
  reason: { color: COLORS.muted, fontSize: 11, lineHeight: 17, marginTop: 12 },
  primaryButton: { backgroundColor: COLORS.green, borderRadius: 11, padding: 13, alignItems: 'center', marginTop: 16 },
  primaryText: { color: '#041a0a', fontSize: 14, fontWeight: '800' },
  quickGrid: { gap: 9 },
  quickButton: { backgroundColor: COLORS.card, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,.08)', padding: 15, flexDirection: 'row', alignItems: 'center' },
  quickIcon: { fontSize: 20, marginRight: 12 },
  quickText: { color: '#fff', fontSize: 14, fontWeight: '700', flex: 1 },
  arrow: { color: COLORS.green, fontSize: 24 },
});
