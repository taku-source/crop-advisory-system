import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getAdvisories, getNotifications, getRecordSummary } from '../api';
import { registerForPushNotifications } from '../notifications';

const GREEN = '#2e7d32';

export default function DashboardScreen({ navigation }) {
  const { user, logout }          = useAuth();
  const [advisories, setAdvisories] = useState([]);
  const [notifications, setNotifs]  = useState([]);
  const [summary, setSummary]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = async () => {
    try {
      const [advRes, notifRes, sumRes] = await Promise.all([
        getAdvisories({ upcoming: true }),
        getNotifications(),
        getRecordSummary(),
      ]);
      setAdvisories(advRes.data.advisories.slice(0, 3));
      setNotifs(notifRes.data.notifications.slice(0, 3));
      setSummary(sumRes.data.summary);
    } catch { /* silent fail — user sees empty state */ }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => {
    fetchAll();
    // Register for push notifications after login
    registerForPushNotifications().catch(() => {});
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const now = new Date();
  const month = now.getMonth();
  const seasonName = (month >= 10 || month <= 3) ? 'Main Season 2024/25' : 'Winter / Dry Season';

  const QUICK_ACTIONS = [
    { label: 'Advisories',   emoji: '📋', screen: 'Advisories' },
    { label: 'Identify\nDisease', emoji: '🔍', screen: 'Disease' },
    { label: 'Farm\nRecords', emoji: '📝', screen: 'Records' },
    { label: 'Knowledge\nBase', emoji: '📚', screen: 'Knowledge' },
  ];

  const TYPE_COLORS = { Advisory: '#1565c0', 'Disease Alert': '#c62828', Reminder: '#e65100', Announcement: '#555' };

  if (loading) return (
    <View style={s.center}>
      <ActivityIndicator size="large" color={GREEN} />
    </View>
  );

  return (
    <ScrollView style={s.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAll(); }} tintColor={GREEN} />}>

      {/* ── Header ── */}
      <View style={s.header}>
        <View style={s.headerTop}>
          <View>
            <Text style={s.greetingText}>{greeting},</Text>
            <Text style={s.userName}>{user?.fullName?.split(' ')[0]} 👋</Text>
          </View>
          <TouchableOpacity style={s.logoutBtn} onPress={logout}>
            <Text style={s.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Season banner */}
        <View style={s.seasonBanner}>
          <View>
            <Text style={s.seasonLabel}>CURRENT SEASON</Text>
            <Text style={s.seasonName}>{seasonName}</Text>
            <Text style={s.seasonSub}>Region III · {user?.district}</Text>
          </View>
          <Text style={{ fontSize: 40 }}>🌽</Text>
        </View>
      </View>

      {/* ── Summary stats ── */}
      {summary && (
        <View style={s.statsRow}>
          {[
            { label: 'Records', val: summary.totalRecords, icon: '📝' },
            { label: 'Plantings', val: summary.byCategory?.Planting || 0, icon: '🌱' },
            { label: 'Harvests', val: summary.byCategory?.Harvest || 0, icon: '🌾' },
            { label: 'Expenses', val: `$${Math.round(summary.totalExpenses || 0)}`, icon: '💰' },
          ].map((s2) => (
            <View key={s2.label} style={s.statCard}>
              <Text style={s.statIcon}>{s2.icon}</Text>
              <Text style={s.statVal}>{s2.val}</Text>
              <Text style={s.statLbl}>{s2.label}</Text>
            </View>
          ))}
        </View>
      )}

      {/* ── Quick actions ── */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Quick Actions</Text>
        <View style={s.quickGrid}>
          {QUICK_ACTIONS.map((a) => (
            <TouchableOpacity key={a.screen} style={s.quickCard} onPress={() => navigation.navigate(a.screen)} activeOpacity={0.8}>
              <Text style={s.quickEmoji}>{a.emoji}</Text>
              <Text style={s.quickLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── Upcoming advisories ── */}
      {advisories.length > 0 && (
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Upcoming Activities</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Advisories')}>
              <Text style={s.seeAll}>See all →</Text>
            </TouchableOpacity>
          </View>
          {advisories.map((a) => {
            const diff = Math.ceil((new Date(a.recommendedDate) - now) / (1000 * 60 * 60 * 24));
            const urgColor = diff <= 3 ? '#e53935' : diff <= 7 ? '#fb8c00' : GREEN;
            return (
              <View key={a._id} style={s.advisoryCard}>
                <View style={[s.advisoryDot, { backgroundColor: urgColor }]} />
                <View style={{ flex: 1 }}>
                  <Text style={s.advisoryActivity}>{a.activity}</Text>
                  <Text style={s.advisoryCrop}>{a.crop}</Text>
                </View>
                <View style={[s.daysBadge, { backgroundColor: `${urgColor}15` }]}>
                  <Text style={[s.daysText, { color: urgColor }]}>
                    {diff === 0 ? 'Today' : diff === 1 ? 'Tomorrow' : `${diff}d`}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* ── Recent notifications ── */}
      <View style={s.section}>
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Recent Alerts</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
            <Text style={s.seeAll}>See all →</Text>
          </TouchableOpacity>
        </View>
        {notifications.length === 0 && (
          <Text style={s.emptyText}>No notifications yet</Text>
        )}
        {notifications.map((n) => (
          <View key={n._id} style={[s.notifCard, { borderLeftColor: TYPE_COLORS[n.type] || '#ccc' }]}>
            <Text style={[s.notifType, { color: TYPE_COLORS[n.type] || '#aaa' }]}>{n.type}</Text>
            <Text style={s.notifTitle}>{n.title}</Text>
            <Text style={s.notifMsg} numberOfLines={2}>{n.message}</Text>
          </View>
        ))}
      </View>

      {/* Farm info footer */}
      <View style={s.farmFooter}>
        <Text style={s.farmName}>{user?.farmName || 'My Farm'}</Text>
        <Text style={s.farmDetail}>{user?.farmSize} · {user?.ward}, {user?.district}</Text>
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f0' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: GREEN, paddingBottom: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 20, paddingTop: 52 },
  greetingText: { color: '#a5d6a7', fontSize: 13 },
  userName: { color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 2 },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.15)', padding: 8, borderRadius: 8, marginTop: 4 },
  logoutText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  seasonBanner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.15)', marginHorizontal: 16, borderRadius: 14, padding: 16 },
  seasonLabel: { fontSize: 10, color: '#a5d6a7', letterSpacing: 1, textTransform: 'uppercase' },
  seasonName: { fontSize: 16, fontWeight: '800', color: '#fff', marginTop: 2 },
  seasonSub: { fontSize: 12, color: '#81c784', marginTop: 2 },
  statsRow: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 16, marginTop: -1, borderRadius: 14, padding: 14, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, elevation: 4, marginBottom: 6 },
  statCard: { flex: 1, alignItems: 'center' },
  statIcon: { fontSize: 18, marginBottom: 2 },
  statVal: { fontSize: 18, fontWeight: '800', color: '#1b5e20' },
  statLbl: { fontSize: 9, color: '#aaa', textTransform: 'uppercase', marginTop: 1 },
  section: { paddingHorizontal: 16, marginTop: 18 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#1a1a1a' },
  seeAll: { fontSize: 12, color: GREEN, fontWeight: '600' },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickCard: { width: '47%', backgroundColor: '#fff', borderRadius: 14, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  quickEmoji: { fontSize: 30, marginBottom: 8 },
  quickLabel: { fontSize: 12, fontWeight: '700', color: '#333', textAlign: 'center', lineHeight: 16 },
  advisoryCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 5, elevation: 1 },
  advisoryDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  advisoryActivity: { fontSize: 14, fontWeight: '700', color: '#1a1a1a' },
  advisoryCrop: { fontSize: 11, color: '#888', marginTop: 1 },
  daysBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  daysText: { fontSize: 11, fontWeight: '800' },
  notifCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8, borderLeftWidth: 4, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 5, elevation: 1 },
  notifType: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 3 },
  notifTitle: { fontSize: 14, fontWeight: '700', color: '#1a1a1a', marginBottom: 3 },
  notifMsg: { fontSize: 12, color: '#666', lineHeight: 17 },
  emptyText: { color: '#bbb', fontSize: 13, textAlign: 'center', paddingVertical: 16 },
  farmFooter: { marginHorizontal: 16, marginTop: 18, backgroundColor: '#fff', borderRadius: 12, padding: 14, alignItems: 'center' },
  farmName: { fontSize: 14, fontWeight: '700', color: GREEN },
  farmDetail: { fontSize: 12, color: '#aaa', marginTop: 2 },
});
