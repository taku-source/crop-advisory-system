import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, RefreshControl, Switch,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { updateProfile, changePassword, getNotifications, getKnowledge, getFarmerReport } from '../api';

const GREEN = '#2e7d32';
const LIGHT_GREEN = '#e8f5e9';

// ─── ProfileScreen ────────────────────────────────────────────────────────────
export function ProfileScreen() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('profile');
  const [form, setForm] = useState({ fullName: user?.fullName || '', phone: user?.phone || '', district: user?.district || '', ward: user?.ward || '', farmName: user?.farmName || '', farmSize: user?.farmSize || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [report, setReport] = useState(null);

  useEffect(() => {
    getFarmerReport().then((r) => setReport(r.data.report)).catch(() => {});
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile(form);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!pwForm.currentPassword || !pwForm.newPassword) return Alert.alert('Error', 'Please fill all fields');
    if (pwForm.newPassword !== pwForm.confirmPassword) return Alert.alert('Error', 'Passwords do not match');
    if (pwForm.newPassword.length < 6) return Alert.alert('Error', 'New password must be at least 6 characters');
    setSaving(true);
    try {
      await changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      Alert.alert('Success', 'Password changed successfully');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Password change failed');
    } finally {
      setSaving(false);
    }
  };

  const upd = (setter, key) => (val) => setter((f) => ({ ...f, [key]: val }));

  const summaryStats = report ? [
    { label: 'Total Records', val: report.totalRecords, icon: '📝' },
    { label: 'Planting', val: report.byCategory?.Planting || 0, icon: '🌱' },
    { label: 'Harvests', val: report.byCategory?.Harvest || 0, icon: '🌾' },
    { label: 'Expenses', val: `$${(report.totalExpenses || 0).toFixed(0)}`, icon: '💰' },
  ] : [];

  return (
    <ScrollView style={s.container}>
      {/* User header */}
      <View style={s.profileHeader}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{user?.fullName?.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={s.profileName}>{user?.fullName}</Text>
        <Text style={s.profileSub}>{user?.farmName} · {user?.district}</Text>
        <View style={s.roleBadge}><Text style={s.roleText}>Farmer</Text></View>
      </View>

      {/* Farm summary */}
      {summaryStats.length > 0 && (
        <View style={s.statsRow}>
          {summaryStats.map((stat) => (
            <View key={stat.label} style={s.statCard}>
              <Text style={s.statIcon}>{stat.icon}</Text>
              <Text style={s.statVal}>{stat.val}</Text>
              <Text style={s.statLbl}>{stat.label}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Tabs */}
      <View style={s.tabs}>
        {['profile', 'security'].map((t) => (
          <TouchableOpacity key={t} style={[s.tab, tab === t && s.tabActive]} onPress={() => setTab(t)}>
            <Text style={[s.tabText, tab === t && s.tabTextActive]}>{t === 'profile' ? '👤 Profile' : '🔒 Security'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={s.formSection}>
        {tab === 'profile' ? (
          <>
            {[
              { key: 'fullName', label: 'Full Name' },
              { key: 'phone', label: 'Phone Number', keyboard: 'phone-pad' },
              { key: 'district', label: 'District' },
              { key: 'ward', label: 'Ward' },
              { key: 'farmName', label: 'Farm Name' },
              { key: 'farmSize', label: 'Farm Size' },
            ].map((f) => (
              <View key={f.key}>
                <Text style={s.label}>{f.label}</Text>
                <TextInput style={s.input} value={form[f.key]} onChangeText={upd(setForm, f.key)} keyboardType={f.keyboard || 'default'} />
              </View>
            ))}
            <View style={{ marginVertical: 4 }}>
              <Text style={s.label}>Email</Text>
              <TextInput style={[s.input, s.inputDisabled]} value={user?.email} editable={false} />
            </View>
            <TouchableOpacity style={s.btnPrimary} onPress={handleSaveProfile} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Save Changes</Text>}
            </TouchableOpacity>
          </>
        ) : (
          <>
            {[
              { key: 'currentPassword', label: 'Current Password' },
              { key: 'newPassword', label: 'New Password' },
              { key: 'confirmPassword', label: 'Confirm New Password' },
            ].map((f) => (
              <View key={f.key}>
                <Text style={s.label}>{f.label}</Text>
                <TextInput style={s.input} value={pwForm[f.key]} onChangeText={upd(setPwForm, f.key)} secureTextEntry />
              </View>
            ))}
            <TouchableOpacity style={s.btnPrimary} onPress={handleChangePassword} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Change Password</Text>}
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Logout */}
      <TouchableOpacity style={s.logoutBtn} onPress={() => Alert.alert('Logout', 'Are you sure?', [{ text: 'Cancel' }, { text: 'Logout', style: 'destructive', onPress: logout }])}>
        <Text style={s.logoutText}>🚪 Logout</Text>
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ─── NotificationsScreen ──────────────────────────────────────────────────────
export function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.data.notifications);
    } catch { /* ignore */ }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetch(); }, []);

  const TYPE_COLORS = { Advisory: '#1565c0', 'Disease Alert': '#c62828', Reminder: '#e65100', Announcement: '#555' };
  const TYPE_ICONS  = { Advisory: '📋', 'Disease Alert': '⚠️', Reminder: '⏰', Announcement: '📣' };

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={GREEN} /></View>;

  return (
    <ScrollView style={s.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetch(); }} />}>
      {notifications.length === 0 && (
        <View style={[s.center, { paddingTop: 80 }]}>
          <Text style={{ fontSize: 48 }}>🔔</Text>
          <Text style={{ color: '#aaa', marginTop: 12, fontSize: 15 }}>No notifications yet</Text>
        </View>
      )}
      {notifications.map((n) => (
        <View key={n._id} style={[s.notifCard, { borderLeftColor: TYPE_COLORS[n.type] || '#ccc' }]}>
          <View style={s.notifTop}>
            <Text style={[s.notifType, { color: TYPE_COLORS[n.type] || '#555' }]}>
              {TYPE_ICONS[n.type]} {n.type}
            </Text>
            <Text style={s.notifDate}>{new Date(n.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</Text>
          </View>
          <Text style={s.notifTitle}>{n.title}</Text>
          <Text style={s.notifMsg}>{n.message}</Text>
        </View>
      ))}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ─── KnowledgeScreen ──────────────────────────────────────────────────────────
export function KnowledgeScreen() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [expanded, setExpanded]  = useState(null);

  const CATS = ['All', 'Farming Guide', 'Best Practices', 'Disease Prevention', 'Fertilizer', 'Pest Management'];
  const CAT_ICONS_KB = { 'Farming Guide': '📖', 'Best Practices': '⭐', 'Disease Prevention': '🛡️', 'Fertilizer': '💊', 'Pest Management': '🐛' };

  useEffect(() => {
    getKnowledge().then((r) => setArticles(r.data.articles)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = articles.filter((a) => {
    const matchCat = catFilter === 'All' || a.category === catFilter;
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.content.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={GREEN} /></View>;

  return (
    <View style={s.container}>
      <View style={s.toolbar}>
        <TextInput style={s.searchInput} placeholder="Search knowledge base..." value={search} onChangeText={setSearch} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.catFilter} contentContainerStyle={{ paddingHorizontal: 12 }}>
        {CATS.map((c) => (
          <TouchableOpacity key={c} style={[s.catChip, catFilter === c && s.catChipActive]} onPress={() => setCatFilter(c)}>
            <Text style={[s.catChipText, catFilter === c && { color: '#fff' }]}>{c === 'All' ? 'All' : `${CAT_ICONS_KB[c]} ${c}`}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView>
        {filtered.map((a) => (
          <TouchableOpacity key={a._id} style={s.articleCard} onPress={() => setExpanded(expanded === a._id ? null : a._id)} activeOpacity={0.85}>
            <View style={s.articleTop}>
              <Text style={s.articleCat}>{CAT_ICONS_KB[a.category]} {a.category}</Text>
              {a.crop !== 'General' && <View style={s.cropTag}><Text style={s.cropTagText}>{a.crop}</Text></View>}
            </View>
            <Text style={s.articleTitle}>{a.title}</Text>
            {expanded === a._id ? (
              <Text style={s.articleContent}>{a.content}</Text>
            ) : (
              <Text style={s.articlePreview} numberOfLines={2}>{a.content}</Text>
            )}
            {a.tags?.length > 0 && (
              <View style={s.tagRow}>
                {a.tags.slice(0, 4).map((t) => <View key={t} style={s.tag}><Text style={s.tagText}>#{t}</Text></View>)}
              </View>
            )}
            <Text style={s.expandHint}>{expanded === a._id ? '▲ Show less' : '▼ Read more'}</Text>
          </TouchableOpacity>
        ))}
        {filtered.length === 0 && (
          <View style={[s.center, { paddingTop: 60 }]}>
            <Text style={{ fontSize: 40 }}>📚</Text>
            <Text style={{ color: '#aaa', marginTop: 12 }}>No articles found</Text>
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  profileHeader: { backgroundColor: GREEN, alignItems: 'center', padding: 28, paddingTop: 40 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 30, color: '#fff', fontWeight: '800' },
  profileName: { fontSize: 20, fontWeight: '700', color: '#fff' },
  profileSub: { fontSize: 13, color: '#a5d6a7', marginTop: 4 },
  roleBadge: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginTop: 8 },
  roleText: { color: '#fff', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  statsRow: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  statCard: { flex: 1, alignItems: 'center', padding: 12 },
  statIcon: { fontSize: 20, marginBottom: 2 },
  statVal: { fontSize: 18, fontWeight: '800', color: '#1b5e20' },
  statLbl: { fontSize: 10, color: '#888', textTransform: 'uppercase', marginTop: 2, textAlign: 'center' },
  tabs: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: GREEN },
  tabText: { fontSize: 13, color: '#888', fontWeight: '600' },
  tabTextActive: { color: GREEN },
  formSection: { padding: 16 },
  label: { fontSize: 11, fontWeight: '700', color: '#555', marginBottom: 5, marginTop: 12, textTransform: 'uppercase', letterSpacing: 0.3 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 14, backgroundColor: '#fafafa' },
  inputDisabled: { backgroundColor: '#f0f0f0', color: '#aaa' },
  btnPrimary: { backgroundColor: GREEN, padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  logoutBtn: { marginHorizontal: 16, marginTop: 8, padding: 15, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#ffcdd2', backgroundColor: '#fff5f5' },
  logoutText: { color: '#c62828', fontWeight: '700', fontSize: 15 },
  // Notifications
  notifCard: { backgroundColor: '#fff', marginHorizontal: 14, marginVertical: 5, borderRadius: 12, padding: 14, borderLeftWidth: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 1 },
  notifTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  notifType: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },
  notifDate: { fontSize: 11, color: '#aaa' },
  notifTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a1a', marginBottom: 4 },
  notifMsg: { fontSize: 13, color: '#555', lineHeight: 19 },
  // Knowledge
  toolbar: { backgroundColor: '#fff', padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  searchInput: { backgroundColor: '#f0f0f0', borderRadius: 10, padding: 10, fontSize: 14 },
  catFilter: { backgroundColor: '#fff', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee', flexGrow: 0 },
  catChip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: '#ddd', marginRight: 8, backgroundColor: '#fff' },
  catChipActive: { backgroundColor: GREEN, borderColor: GREEN },
  catChipText: { fontSize: 12, color: '#555', fontWeight: '600' },
  articleCard: { backgroundColor: '#fff', marginHorizontal: 14, marginVertical: 6, borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  articleTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  articleCat: { fontSize: 11, color: '#888', fontWeight: '700', textTransform: 'uppercase', flex: 1 },
  cropTag: { backgroundColor: '#e8f5e9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  cropTagText: { fontSize: 11, color: GREEN, fontWeight: '700' },
  articleTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a1a', marginBottom: 6 },
  articlePreview: { fontSize: 13, color: '#666', lineHeight: 19 },
  articleContent: { fontSize: 13, color: '#444', lineHeight: 21 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  tag: { backgroundColor: '#f5f5f5', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  tagText: { fontSize: 11, color: '#888' },
  expandHint: { fontSize: 11, color: GREEN, marginTop: 8, textAlign: 'right', fontWeight: '600' },
});
