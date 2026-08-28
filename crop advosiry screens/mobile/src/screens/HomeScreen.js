import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import BottomNav from '../components/BottomNav';
import { Colors, Fonts, Spacing, Radius } from '../constants/theme';
import { NOTIFICATIONS } from '../constants/data';

// Simulated advisory engine output
const getRecommendation = (user) => ({
  action: '🌱 Prepare field for planting',
  why: 'Planting conditions are becoming suitable. Prepare your field and plant after the next effective rainfall.',
  reason: `Your crop (Maize), soil (${user?.soilType || 'Sandy Loam'}), location (${user?.district || 'Kadoma'}) and current seasonal date match the Region III planting window.`,
});

const getWeather = () => ({
  temp: '29°C', desc: 'Rain expected', icon: '🌧',
  source: 'Open-Meteo',
  forecast: [{ day: 'Fri', icon: '🌧' }, { day: 'Sat', icon: '🌦' }, { day: 'Sun', icon: '☀️' }],
});

const getUpNext = () => [
  { name: 'Planting',         date: 'Mid Nov 2024', soon: true  },
  { name: 'Basal fertiliser', date: 'At planting',  soon: false },
  { name: 'First weeding',    date: '2–3 wks after',soon: false },
];

export default function HomeScreen({ navigation }) {
  const { user, logout }    = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const rec     = getRecommendation(user);
  const weather = getWeather();
  const upNext  = getUpNext();
  const hour    = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 1000));
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.black} />
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.leaf} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>{greeting},</Text>
            <Text style={s.name}>{user?.fullName || 'Farmer'}</Text>
            <Text style={s.location}>📍 {user?.district || 'Kadoma'} · Region III</Text>
          </View>
          <TouchableOpacity style={s.notifBtn} onPress={() => navigation.navigate('Notifications')}>
            <Text style={{ fontSize: 16 }}>🔔</Text>
          </TouchableOpacity>
        </View>

        {/* Crop card */}
        <View style={s.cropCard}>
          <View style={s.ccLeft}>
            <Text style={s.ccLabel}>Your crop</Text>
            <Text style={s.ccName}>Maize</Text>
            <Text style={s.ccMeta}>{user?.soilType || 'Sandy Loam'} · {user?.farmSize || '2 ha'} · {user?.district || 'Kadoma'}</Text>
            <View style={s.stageBadge}><Text style={s.stageText}>🌱 Planting Stage</Text></View>
          </View>
          <View style={s.ccRight}>
            <Text style={s.ccEmoji}>🌽</Text>
            <Text style={s.ccPct}>30% through season</Text>
          </View>
        </View>

        {/* Weather */}
        <View style={s.wxBar}>
          <Text style={s.wxIcon}>{weather.icon}</Text>
          <View style={s.wxInfo}>
            <Text style={s.wxTemp}>{weather.temp} · {weather.desc}</Text>
            <Text style={s.wxSource}>{weather.source} · {user?.district || 'Kadoma'} · 7-day</Text>
          </View>
          <View style={s.wxFc}>
            {weather.forecast.map(d => (
              <View key={d.day} style={s.wxDay}>
                <Text style={{ fontSize: 14 }}>{d.icon}</Text>
                <Text style={s.wxDayLbl}>{d.day}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* NOW card */}
        <View style={s.nowCard}>
          <View style={s.nowLabel}>
            <View style={s.pulse} />
            <Text style={s.nowLabelText}>What to do now</Text>
          </View>
          <Text style={s.nowAction}>{rec.action}</Text>
          <Text style={s.nowWhy}>{rec.why}</Text>
          <View style={s.whyBox}>
            <Text style={s.whyBoxText}>
              <Text style={{ color: Colors.grey2, fontFamily: Fonts.semibold }}>Why? </Text>
              {rec.reason}
            </Text>
          </View>
          <TouchableOpacity style={s.btnPrimary} onPress={() => navigation.navigate('ActivityDetail', { stageId: 'planting' })} activeOpacity={0.85}>
            <Text style={s.btnPrimaryText}>View full instructions</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.btnOutline} onPress={() => navigation.navigate('SeasonPlan')} activeOpacity={0.85}>
            <Text style={s.btnOutlineText}>View seasonal plan</Text>
          </TouchableOpacity>
        </View>

        {/* Up next */}
        <View style={s.upNext}>
          <Text style={s.unLabel}>Up next</Text>
          {upNext.map((item, i) => (
            <View key={i} style={[s.unItem, i === upNext.length - 1 && { borderBottomWidth: 0 }]}>
              <View style={[s.unDot, item.soon && s.unDotSoon]} />
              <Text style={s.unName}>{item.name}</Text>
              <Text style={s.unDate}>{item.date}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <BottomNav active="Home" navigation={navigation} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.black },
  scroll: { flex: 1 },
  content: { paddingBottom: 20 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, paddingBottom: Spacing.md },
  greeting: { fontFamily: Fonts.body, fontSize: 13, color: Colors.grey2 },
  name: { fontFamily: Fonts.display, fontSize: 24, fontWeight: '800', color: Colors.white, letterSpacing: -0.5 },
  location: { fontFamily: Fonts.mono, fontSize: 11, color: Colors.grey, marginTop: 3 },
  notifBtn: { width: 36, height: 36, backgroundColor: Colors.card, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },

  cropCard: { marginHorizontal: Spacing.lg, marginBottom: 10, backgroundColor: '#0d2b18', borderWidth: 1, borderColor: '#1e4a2a', borderRadius: Radius.lg, padding: Spacing.lg, flexDirection: 'row', justifyContent: 'space-between' },
  ccLeft: {},
  ccLabel: { fontFamily: Fonts.mono, fontSize: 10, color: Colors.leaf, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 3 },
  ccName: { fontFamily: Fonts.display, fontSize: 22, fontWeight: '800', color: Colors.white },
  ccMeta: { fontFamily: Fonts.body, fontSize: 11, color: Colors.grey2, marginTop: 3 },
  stageBadge: { marginTop: 10, backgroundColor: 'rgba(74,222,128,.12)', borderWidth: 1, borderColor: 'rgba(74,222,128,.2)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start' },
  stageText: { fontFamily: Fonts.mono, fontSize: 10, color: Colors.leaf },
  ccRight: { alignItems: 'flex-end' },
  ccEmoji: { fontSize: 44 },
  ccPct: { fontFamily: Fonts.mono, fontSize: 10, color: Colors.grey, marginTop: 4 },

  wxBar: { marginHorizontal: Spacing.lg, marginBottom: 10, backgroundColor: Colors.skyDim, borderWidth: 1, borderColor: '#1a3a50', borderRadius: Radius.md, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  wxIcon: { fontSize: 26 },
  wxInfo: { flex: 1 },
  wxTemp: { fontFamily: Fonts.display, fontSize: 17, fontWeight: '700', color: Colors.sky },
  wxSource: { fontFamily: Fonts.mono, fontSize: 10, color: '#7ab8d8', marginTop: 1 },
  wxFc: { flexDirection: 'row', gap: 8 },
  wxDay: { alignItems: 'center' },
  wxDayLbl: { fontFamily: Fonts.mono, fontSize: 10, color: '#5a98b8', marginTop: 2 },

  nowCard: { marginHorizontal: Spacing.lg, marginBottom: 10, borderWidth: 1, borderColor: Colors.leaf, backgroundColor: Colors.leafDim, borderRadius: Radius.lg, padding: Spacing.lg },
  nowLabel: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 10 },
  pulse: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: Colors.leaf },
  nowLabelText: { fontFamily: Fonts.mono, fontSize: 10, color: Colors.leaf, letterSpacing: 1, textTransform: 'uppercase' },
  nowAction: { fontFamily: Fonts.display, fontSize: 19, fontWeight: '800', color: Colors.white, marginBottom: 8 },
  nowWhy: { fontFamily: Fonts.body, fontSize: 12, color: Colors.grey2, lineHeight: 19, marginBottom: 0 },
  whyBox: { backgroundColor: 'rgba(255,255,255,.04)', borderLeftWidth: 2, borderLeftColor: Colors.leaf, borderRadius: 8, padding: 10, marginTop: 8, marginBottom: 14 },
  whyBoxText: { fontFamily: Fonts.body, fontSize: 11, color: Colors.grey2, lineHeight: 17 },
  btnPrimary: { backgroundColor: Colors.leaf, borderRadius: 11, padding: 12, alignItems: 'center' },
  btnPrimaryText: { fontFamily: Fonts.bold, fontSize: 14, color: '#041a0a' },
  btnOutline: { backgroundColor: 'transparent', borderRadius: 11, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: Colors.border, marginTop: 8 },
  btnOutlineText: { fontFamily: Fonts.semibold, fontSize: 13, color: Colors.white },

  upNext: { marginHorizontal: Spacing.lg, marginBottom: 10 },
  unLabel: { fontFamily: Fonts.mono, fontSize: 10, color: Colors.grey, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 },
  unItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  unDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.muted },
  unDotSoon: { backgroundColor: Colors.warn },
  unName: { flex: 1, fontFamily: Fonts.medium, fontSize: 13, color: Colors.white },
  unDate: { fontFamily: Fonts.mono, fontSize: 10, color: Colors.grey },
});
