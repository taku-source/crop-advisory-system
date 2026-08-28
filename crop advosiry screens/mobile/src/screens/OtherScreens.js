import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, StatusBar, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../context/AuthContext';
import { Colors, Fonts, Spacing, Radius } from '../constants/theme';
import { KNOWLEDGE_ARTICLES, KNOWLEDGE_CATS, NOTIFICATIONS } from '../constants/data';

// ─── KnowledgeScreen ──────────────────────────────────────────────────────────
export function KnowledgeScreen({ navigation }) {
  const [search, setSearch]       = useState('');
  const [catFilter, setCatFilter] = useState(null);

  const filtered = KNOWLEDGE_ARTICLES.filter(a => {
    const matchCat = !catFilter || a.crop.toLowerCase() === catFilter;
    const matchSrch = !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.preview.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSrch;
  });

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <View style={s.hdr}><Text style={s.hdrTitle}>Knowledge</Text></View>

      {/* Search */}
      <View style={s.searchWrap}>
        <Text style={{ color: Colors.grey, marginRight: 6 }}>🔍</Text>
        <TextInput
          style={s.searchInput} value={search} onChangeText={setSearch}
          placeholder="Search guides and articles…" placeholderTextColor={Colors.grey}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={{ color: Colors.grey, marginLeft: 6 }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Category grid — only when not searching */}
        {!search && (
          <View style={s.catGrid}>
            {KNOWLEDGE_CATS.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[s.catCard, catFilter === cat.id && s.catCardActive]}
                onPress={() => setCatFilter(catFilter === cat.id ? null : cat.id)}
                activeOpacity={0.8}
              >
                <Text style={s.catEmoji}>{cat.emoji}</Text>
                <Text style={[s.catName, catFilter === cat.id && s.catNameActive]}>{cat.name}</Text>
                <Text style={s.catCount}>{cat.count} guides</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Articles */}
        <View style={{ paddingHorizontal: Spacing.lg, paddingBottom: 30 }}>
          <Text style={s.sectionLbl}>
            {catFilter ? `${catFilter.charAt(0).toUpperCase() + catFilter.slice(1)} Guides` : 'All Articles'}
          </Text>
          {filtered.map(article => (
            <TouchableOpacity key={article.id} style={s.artCard} activeOpacity={0.8}>
              <Text style={s.artCrop}>{article.crop} · {article.category}</Text>
              <Text style={s.artTitle}>{article.title}</Text>
              <Text style={s.artPreview} numberOfLines={2}>{article.preview}</Text>
            </TouchableOpacity>
          ))}
          {filtered.length === 0 && (
            <View style={s.empty}>
              <Text style={{ fontSize: 36 }}>📚</Text>
              <Text style={s.emptyText}>No articles found</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <BottomNav active="Knowledge" navigation={navigation} />
    </SafeAreaView>
  );
}

// ─── NotificationsScreen ──────────────────────────────────────────────────────
export function NotificationsScreen({ navigation }) {
  const ICON_BG = { weather: Colors.skyDim, crop: Colors.leafDim, alert: 'rgba(248,113,113,.1)' };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <View style={s.hdr}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>←</Text>
        </TouchableOpacity>
        <Text style={s.hdrTitle}>Notifications</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
        {NOTIFICATIONS.map(notif => (
          <View key={notif.id} style={s.notifItem}>
            <View style={[s.notifIcon, { backgroundColor: ICON_BG[notif.type] || Colors.card }]}>
              <Text style={{ fontSize: 18 }}>{notif.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.notifTitle}>{notif.title}</Text>
              <Text style={s.notifBody}>{notif.body}</Text>
              <Text style={s.notifTime}>{notif.time}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── ProfileScreen ────────────────────────────────────────────────────────────
export function ProfileScreen({ navigation }) {
  const { user, logout, updateProfile } = useAuth();
  const [editMode, setEditMode]         = useState(false);
  const [form, setForm]                 = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    district: user?.district || '',
    ward: user?.ward || '',
    farmSize: user?.farmSize || '',
    soilType: user?.soilType || '',
  });

  const upd = (key) => (val) => setForm(f => ({ ...f, [key]: val }));
  const initials = (user?.fullName || 'FM').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

  const handleSave = async () => {
    await updateProfile(form);
    setEditMode(false);
  };

  const handleLogout = () =>
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);

  const PROFILE_ROWS = [
    { label: 'Full name',  key: 'fullName' },
    { label: 'Phone',      key: 'phone' },
    { label: 'District',   key: 'district' },
    { label: 'Ward',       key: 'ward' },
    { label: 'Farm size',  key: 'farmSize' },
    { label: 'Soil type',  key: 'soilType' },
  ];

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Profile hero */}
        <View style={s.profHero}>
          <View style={s.avatar}><Text style={s.avatarTxt}>{initials}</Text></View>
          <Text style={s.profName}>{user?.fullName}</Text>
          <Text style={s.profSub}>{user?.district || 'Kadoma'} · Region III · {user?.soilType || 'Sandy Loam'}</Text>
          <View style={s.profStats}>
            <View style={s.pStat}><Text style={s.pStatVal}>14</Text><Text style={s.pStatLbl}>Records</Text></View>
            <View style={s.pStat}><Text style={s.pStatVal}>{user?.farmSize || '2 ha'}</Text><Text style={s.pStatLbl}>Farm</Text></View>
            <View style={s.pStat}><Text style={s.pStatVal}>30%</Text><Text style={s.pStatLbl}>Season</Text></View>
          </View>
        </View>

        <View style={{ paddingHorizontal: Spacing.xl }}>
          {/* Edit / Save toggle */}
          <TouchableOpacity
            style={[s.editBtn, editMode && s.editBtnActive]}
            onPress={() => editMode ? handleSave() : setEditMode(true)}
            activeOpacity={0.85}
          >
            <Text style={[s.editBtnTxt, editMode && s.editBtnTxtActive]}>
              {editMode ? '✓ Save Changes' : '✎ Edit Profile'}
            </Text>
          </TouchableOpacity>

          {/* Personal Details */}
          <Text style={s.sectionLbl}>Personal Details</Text>
          {PROFILE_ROWS.map(row => (
            <View key={row.key} style={s.profRow}>
              <Text style={s.profRowLabel}>{row.label}</Text>
              {editMode ? (
                <TextInput style={s.profRowInput} value={form[row.key]} onChangeText={upd(row.key)} />
              ) : (
                <Text style={s.profRowVal}>{user?.[row.key] || '—'}</Text>
              )}
            </View>
          ))}

          {/* My Crops */}
          <Text style={[s.sectionLbl, { marginTop: 20 }]}>My Crops</Text>
          {(user?.crops || ['maize']).map(c => (
            <View key={c} style={s.profRow}>
              <Text style={s.profRowLabel}>🌽 {c.charAt(0).toUpperCase() + c.slice(1)}</Text>
              <Text style={[s.profRowVal, { color: Colors.leaf }]}>Active</Text>
            </View>
          ))}
          <TouchableOpacity style={s.addCropRow}>
            <Text style={s.addCropTxt}>+ Add another crop</Text>
          </TouchableOpacity>

          {/* Settings */}
          <Text style={[s.sectionLbl, { marginTop: 20 }]}>Settings</Text>
          {[
            { label: '🔔 Notifications', val: 'On' },
            { label: '📍 Location',       val: 'Enabled' },
            { label: '🔒 Change password', val: '' },
          ].map(row => (
            <TouchableOpacity key={row.label} style={s.profRow} activeOpacity={0.8}>
              <Text style={s.profRowLabel}>{row.label}</Text>
              <Text style={s.profRowVal}>{row.val} ›</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
            <Text style={s.logoutTxt}>🚪 Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.black },
  hdr: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: 12 },
  hdrTitle: { fontFamily: Fonts.display, fontSize: 22, fontWeight: '800', color: Colors.white },
  back: { fontFamily: Fonts.semibold, fontSize: 18, color: Colors.leaf },

  // Knowledge
  searchWrap: { flexDirection: 'row', alignItems: 'center', marginHorizontal: Spacing.lg, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, paddingHorizontal: 13, marginBottom: 12 },
  searchInput: { flex: 1, paddingVertical: 11, fontSize: 13, color: Colors.white, fontFamily: Fonts.body },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, paddingHorizontal: Spacing.lg, marginBottom: 16 },
  catCard: { width: '47%', backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.lg, padding: 15 },
  catCardActive: { backgroundColor: Colors.leafDim, borderColor: Colors.leaf },
  catEmoji: { fontSize: 24, marginBottom: 8 },
  catName: { fontFamily: Fonts.semibold, fontSize: 13, color: Colors.white, marginBottom: 2 },
  catNameActive: { color: Colors.leaf },
  catCount: { fontFamily: Fonts.mono, fontSize: 10, color: Colors.grey },
  sectionLbl: { fontFamily: Fonts.mono, fontSize: 10, color: Colors.grey, letterSpacing: 0.9, textTransform: 'uppercase', marginBottom: 10 },
  artCard: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, padding: 13, marginBottom: 8 },
  artCrop: { fontFamily: Fonts.mono, fontSize: 10, color: Colors.leaf, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 4 },
  artTitle: { fontFamily: Fonts.semibold, fontSize: 13, color: Colors.white, marginBottom: 4 },
  artPreview: { fontFamily: Fonts.body, fontSize: 12, color: Colors.grey, lineHeight: 18 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontFamily: Fonts.body, fontSize: 14, color: Colors.grey, marginTop: 10 },

  // Notifications
  notifItem: { flexDirection: 'row', gap: 12, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, padding: 13, marginBottom: 8 },
  notifIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  notifTitle: { fontFamily: Fonts.semibold, fontSize: 13, color: Colors.white, marginBottom: 3 },
  notifBody: { fontFamily: Fonts.body, fontSize: 12, color: Colors.grey, lineHeight: 17 },
  notifTime: { fontFamily: Fonts.mono, fontSize: 10, color: Colors.grey, marginTop: 4 },

  // Profile
  profHero: { backgroundColor: '#0d2b18', paddingHorizontal: Spacing.xl, paddingTop: 20, paddingBottom: 20 },
  avatar: { width: 60, height: 60, backgroundColor: 'rgba(74,222,128,.2)', borderRadius: 30, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(74,222,128,.3)', marginBottom: 12 },
  avatarTxt: { fontFamily: Fonts.display, fontSize: 22, fontWeight: '800', color: Colors.leaf },
  profName: { fontFamily: Fonts.display, fontSize: 22, fontWeight: '800', color: Colors.white },
  profSub: { fontFamily: Fonts.mono, fontSize: 11, color: Colors.grey, marginTop: 3 },
  profStats: { flexDirection: 'row', marginTop: 16, gap: 0 },
  pStat: { flex: 1, backgroundColor: 'rgba(0,0,0,.25)', borderRadius: 9, padding: 10, alignItems: 'center', marginRight: 8 },
  pStatVal: { fontFamily: Fonts.display, fontSize: 18, fontWeight: '800', color: Colors.leaf },
  pStatLbl: { fontFamily: Fonts.mono, fontSize: 9, color: Colors.grey2, textTransform: 'uppercase', marginTop: 1 },
  editBtn: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, padding: 11, alignItems: 'center', marginTop: 18, marginBottom: 16 },
  editBtnActive: { backgroundColor: Colors.leafDim, borderColor: Colors.leaf },
  editBtnTxt: { fontFamily: Fonts.semibold, fontSize: 14, color: Colors.grey },
  editBtnTxtActive: { color: Colors.leaf },
  profRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, padding: 13, marginBottom: 7 },
  profRowLabel: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.white },
  profRowVal: { fontFamily: Fonts.mono, fontSize: 12, color: Colors.grey },
  profRowInput: { fontFamily: Fonts.body, fontSize: 13, color: Colors.white, textAlign: 'right', flex: 1, marginLeft: 8 },
  addCropRow: { backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.border, borderStyle: 'dashed', borderRadius: 10, padding: 13, alignItems: 'center', marginBottom: 7 },
  addCropTxt: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.grey },
  logoutBtn: { marginTop: 20, borderWidth: 1, borderColor: 'rgba(248,113,113,.3)', borderRadius: 11, padding: 14, alignItems: 'center' },
  logoutTxt: { fontFamily: Fonts.bold, fontSize: 14, color: Colors.danger },
});
