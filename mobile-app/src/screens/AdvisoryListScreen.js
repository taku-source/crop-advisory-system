import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { getAdvisories } from '../api';

const GREEN = '#2e7d32';
const LIGHT_GREEN = '#e8f5e9';

export default function AdvisoryListScreen({ navigation }) {
  const [advisories, setAdvisories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch]         = useState('');
  const [selectedCrop, setSelectedCrop] = useState('All');
  const CROPS = ['All', 'Maize', 'Tomato', 'Beans'];

  const fetchAdvisories = async () => {
    try {
      const res = await getAdvisories();
      setAdvisories(res.data.advisories);
    } catch {
      Alert.alert('Error', 'Failed to load advisories');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchAdvisories(); }, []);

  const filtered = advisories.filter((a) => {
    const matchCrop   = selectedCrop === 'All' || a.crop === selectedCrop;
    const matchSearch = !search || a.activity.toLowerCase().includes(search.toLowerCase()) ||
                        a.description.toLowerCase().includes(search.toLowerCase());
    return matchCrop && matchSearch;
  });

  // Separate upcoming vs past
  const now = new Date();
  const upcoming = filtered.filter((a) => new Date(a.recommendedDate) >= now);
  const past     = filtered.filter((a) => new Date(a.recommendedDate) < now);

  const formatDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const getDaysUntil = (d) => {
    const diff = Math.ceil((new Date(d) - now) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    if (diff < 0)  return `${Math.abs(diff)} days ago`;
    return `In ${diff} days`;
  };

  const getUrgencyColor = (d) => {
    const diff = Math.ceil((new Date(d) - now) / (1000 * 60 * 60 * 24));
    if (diff <= 3)  return '#e53935';
    if (diff <= 7)  return '#fb8c00';
    return GREEN;
  };

  const AdvisoryCard = ({ advisory }) => {
    const [expanded, setExpanded] = useState(false);
    const daysLabel = getDaysUntil(advisory.recommendedDate);
    const urgencyColor = getUrgencyColor(advisory.recommendedDate);
    const isPast = new Date(advisory.recommendedDate) < now;

    return (
      <TouchableOpacity style={[s.card, isPast && s.cardPast]} onPress={() => setExpanded(!expanded)} activeOpacity={0.8}>
        <View style={s.cardTop}>
          <View style={[s.cropBadge, isPast && { backgroundColor: '#f5f5f5' }]}>
            <Text style={[s.cropText, isPast && { color: '#aaa' }]}>{advisory.crop}</Text>
          </View>
          <View style={[s.dateBadge, { backgroundColor: isPast ? '#f5f5f5' : `${urgencyColor}15` }]}>
            <Text style={[s.dateText, { color: isPast ? '#aaa' : urgencyColor }]}>{daysLabel}</Text>
          </View>
        </View>

        <Text style={[s.activityName, isPast && s.textMuted]}>{advisory.activity}</Text>
        <Text style={s.description} numberOfLines={expanded ? undefined : 2}>{advisory.description}</Text>
        <Text style={s.dateLabel}>{formatDate(advisory.recommendedDate)}</Text>

        {expanded && advisory.instructions ? (
          <View style={s.instructions}>
            <Text style={s.instructionsLabel}>Instructions:</Text>
            <Text style={s.instructionsText}>{advisory.instructions}</Text>
          </View>
        ) : null}

        <Text style={s.expandHint}>{expanded ? '▲ Less' : '▼ More details'}</Text>
      </TouchableOpacity>
    );
  };

  if (loading) return (
    <View style={s.center}>
      <ActivityIndicator size="large" color={GREEN} />
    </View>
  );

  return (
    <View style={s.container}>
      {/* Search */}
      <View style={s.header}>
        <TextInput style={s.searchInput} placeholder="Search activities..." value={search}
          onChangeText={setSearch} clearButtonMode="while-editing" />
      </View>

      {/* Crop filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.cropFilter} contentContainerStyle={{ paddingHorizontal: 16 }}>
        {CROPS.map((c) => (
          <TouchableOpacity key={c} style={[s.cropChip, selectedCrop === c && s.cropChipActive]} onPress={() => setSelectedCrop(c)}>
            <Text style={[s.cropChipText, selectedCrop === c && s.cropChipTextActive]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAdvisories(); }} />}>
        {upcoming.length > 0 && (
          <>
            <Text style={s.sectionTitle}>📅 Upcoming ({upcoming.length})</Text>
            {upcoming.map((a) => <AdvisoryCard key={a._id} advisory={a} />)}
          </>
        )}
        {past.length > 0 && (
          <>
            <Text style={s.sectionTitle}>✅ Past Advisories ({past.length})</Text>
            {past.map((a) => <AdvisoryCard key={a._id} advisory={a} />)}
          </>
        )}
        {filtered.length === 0 && (
          <View style={s.empty}>
            <Text style={s.emptyIcon}>📋</Text>
            <Text style={s.emptyText}>No advisories found</Text>
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#fff', padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  searchInput: { backgroundColor: '#f0f0f0', borderRadius: 10, padding: 10, fontSize: 14 },
  cropFilter: { backgroundColor: '#fff', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  cropChip: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#ddd', marginRight: 8, backgroundColor: '#fff' },
  cropChipActive: { backgroundColor: GREEN, borderColor: GREEN },
  cropChipText: { fontSize: 13, color: '#555', fontWeight: '600' },
  cropChipTextActive: { color: '#fff' },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#555', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  card: { backgroundColor: '#fff', marginHorizontal: 16, marginVertical: 6, borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2, borderLeftWidth: 4, borderLeftColor: GREEN },
  cardPast: { borderLeftColor: '#ddd', opacity: 0.75 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  cropBadge: { backgroundColor: LIGHT_GREEN, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  cropText: { fontSize: 11, fontWeight: '700', color: GREEN },
  dateBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  dateText: { fontSize: 11, fontWeight: '700' },
  activityName: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 4 },
  textMuted: { color: '#aaa' },
  description: { fontSize: 13, color: '#555', lineHeight: 19 },
  dateLabel: { fontSize: 11, color: '#aaa', marginTop: 6 },
  instructions: { marginTop: 12, backgroundColor: '#f8faf8', borderRadius: 8, padding: 12 },
  instructionsLabel: { fontSize: 12, fontWeight: '700', color: GREEN, marginBottom: 4, textTransform: 'uppercase' },
  instructionsText: { fontSize: 13, color: '#444', lineHeight: 20 },
  expandHint: { fontSize: 11, color: GREEN, marginTop: 8, textAlign: 'right', fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 15, color: '#aaa' },
});
