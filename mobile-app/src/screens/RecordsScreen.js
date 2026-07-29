import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import { getRecords, createRecord, updateRecord, deleteRecord, getRecordSummary } from '../api';

const GREEN = '#2e7d32';

const CATEGORIES = ['Planting', 'Fertilizer', 'Pesticide', 'Harvest', 'Expense'];
const CAT_ICONS = { Planting: '🌱', Fertilizer: '💊', Pesticide: '🧪', Harvest: '🌾', Expense: '💰' };
const CAT_COLORS = { Planting: '#4caf50', Fertilizer: '#2196f3', Pesticide: '#ff9800', Harvest: '#8bc34a', Expense: '#f44336' };

const CATEGORY_FIELDS = {
  Planting:   [{ key: 'crop', label: 'Crop *', required: true }, { key: 'variety', label: 'Variety' }, { key: 'area', label: 'Area (e.g. 1 ha)' }],
  Fertilizer: [{ key: 'crop', label: 'Crop' }, { key: 'productName', label: 'Fertilizer Type *', required: true }, { key: 'quantity', label: 'Quantity Applied *', required: true }],
  Pesticide:  [{ key: 'crop', label: 'Crop' }, { key: 'productName', label: 'Chemical/Product *', required: true }, { key: 'quantity', label: 'Quantity Used *', required: true }],
  Harvest:    [{ key: 'crop', label: 'Crop *', required: true }, { key: 'variety', label: 'Variety' }, { key: 'quantityHarvested', label: 'Quantity Harvested *', required: true }],
  Expense:    [{ key: 'item', label: 'Item/Description *', required: true }, { key: 'cost', label: 'Cost (USD) *', required: true, keyboard: 'numeric' }],
};

export default function RecordsScreen() {
  const [records, setRecords]     = useState([]);
  const [summary, setSummary]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch]       = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [saving, setSaving]       = useState(false);

  // Form state
  const [form, setForm] = useState({ category: 'Planting', date: new Date().toISOString().split('T')[0], notes: '' });

  const fetchAll = useCallback(async () => {
    try {
      const [recRes, sumRes] = await Promise.all([getRecords(), getRecordSummary()]);
      setRecords(recRes.data.records);
      setSummary(sumRes.data.summary);
    } catch {
      Alert.alert('Error', 'Failed to load records');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openAdd = () => {
    setEditRecord(null);
    setForm({ category: 'Planting', date: new Date().toISOString().split('T')[0], notes: '' });
    setShowModal(true);
  };

  const openEdit = (record) => {
    setEditRecord(record);
    setForm({ ...record, date: record.date?.split('T')[0] || new Date().toISOString().split('T')[0] });
    setShowModal(true);
  };

  const handleSave = async () => {
    const fields = CATEGORY_FIELDS[form.category] || [];
    const missing = fields.filter((f) => f.required && !form[f.key]);
    if (missing.length > 0) return Alert.alert('Required', `Please fill: ${missing.map((f) => f.label.replace(' *', '')).join(', ')}`);
    if (!form.date) return Alert.alert('Required', 'Please enter a date');

    setSaving(true);
    try {
      if (editRecord) {
        await updateRecord(editRecord._id, form);
        Alert.alert('Saved', 'Record updated successfully');
      } else {
        await createRecord(form);
        Alert.alert('Saved', 'Record added successfully');
      }
      setShowModal(false);
      fetchAll();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save record');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Record', 'Are you sure you want to delete this record?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try { await deleteRecord(id); fetchAll(); }
          catch { Alert.alert('Error', 'Failed to delete'); }
        },
      },
    ]);
  };

  const filtered = records.filter((r) => {
    const matchCat = catFilter === 'All' || r.category === catFilter;
    const matchSearch = !search || JSON.stringify(r).toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const updateField = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={GREEN} /></View>;

  return (
    <View style={s.container}>
      {/* Summary strip */}
      {summary && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.summaryRow} contentContainerStyle={{ padding: 12, gap: 10 }}>
          <View style={s.summaryCard}>
            <Text style={s.summaryVal}>{summary.totalRecords}</Text>
            <Text style={s.summaryLbl}>Total</Text>
          </View>
          {CATEGORIES.map((c) => (
            <View key={c} style={[s.summaryCard, { borderTopColor: CAT_COLORS[c], borderTopWidth: 3 }]}>
              <Text style={s.summaryVal}>{summary.byCategory?.[c] || 0}</Text>
              <Text style={s.summaryLbl}>{c}</Text>
            </View>
          ))}
          {summary.totalExpenses > 0 && (
            <View style={[s.summaryCard, { borderTopColor: '#f44336', borderTopWidth: 3, minWidth: 90 }]}>
              <Text style={[s.summaryVal, { fontSize: 14 }]}>${summary.totalExpenses.toFixed(0)}</Text>
              <Text style={s.summaryLbl}>Expenses</Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Search + Add */}
      <View style={s.toolbar}>
        <TextInput style={s.searchInput} placeholder="Search records..." value={search} onChangeText={setSearch} />
        <TouchableOpacity style={s.addBtn} onPress={openAdd}>
          <Text style={s.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Category filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.catFilter} contentContainerStyle={{ paddingHorizontal: 12 }}>
        {['All', ...CATEGORIES].map((c) => (
          <TouchableOpacity key={c} style={[s.catChip, catFilter === c && { backgroundColor: CAT_COLORS[c] || GREEN, borderColor: CAT_COLORS[c] || GREEN }]} onPress={() => setCatFilter(c)}>
            <Text style={[s.catChipText, catFilter === c && { color: '#fff' }]}>{c === 'All' ? 'All' : `${CAT_ICONS[c]} ${c}`}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAll(); }} />}>
        {filtered.map((r) => (
          <View key={r._id} style={s.recordCard}>
            <View style={s.recordHeader}>
              <View style={[s.catDot, { backgroundColor: CAT_COLORS[r.category] }]} />
              <Text style={s.recordCat}>{CAT_ICONS[r.category]} {r.category}</Text>
              <Text style={s.recordDate}>{new Date(r.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</Text>
            </View>

            {r.crop     && <Text style={s.recordField}><Text style={s.fieldKey}>Crop: </Text>{r.crop} {r.variety ? `(${r.variety})` : ''}</Text>}
            {r.area     && <Text style={s.recordField}><Text style={s.fieldKey}>Area: </Text>{r.area}</Text>}
            {r.productName && <Text style={s.recordField}><Text style={s.fieldKey}>Product: </Text>{r.productName} — {r.quantity}</Text>}
            {r.quantityHarvested && <Text style={s.recordField}><Text style={s.fieldKey}>Harvested: </Text>{r.quantityHarvested}</Text>}
            {r.item     && <Text style={s.recordField}><Text style={s.fieldKey}>Item: </Text>{r.item}</Text>}
            {r.cost     && <Text style={s.recordField}><Text style={s.fieldKey}>Cost: </Text>${r.cost}</Text>}
            {r.notes    && <Text style={[s.recordField, { fontStyle: 'italic', color: '#888' }]}>{r.notes}</Text>}

            <View style={s.recordActions}>
              <TouchableOpacity style={s.editBtn} onPress={() => openEdit(r)}><Text style={s.editBtnText}>Edit</Text></TouchableOpacity>
              <TouchableOpacity style={s.delBtn} onPress={() => handleDelete(r._id)}><Text style={s.delBtnText}>Delete</Text></TouchableOpacity>
            </View>
          </View>
        ))}
        {filtered.length === 0 && (
          <View style={s.empty}>
            <Text style={{ fontSize: 48 }}>📝</Text>
            <Text style={s.emptyText}>{search ? 'No matching records' : 'No records yet. Tap + Add to get started.'}</Text>
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowModal(false)}>
        <View style={s.modal}>
          <View style={s.modalHeader}>
            <TouchableOpacity onPress={() => setShowModal(false)}><Text style={s.cancelText}>Cancel</Text></TouchableOpacity>
            <Text style={s.modalTitle}>{editRecord ? 'Edit Record' : 'Add Record'}</Text>
            <TouchableOpacity onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator color={GREEN} /> : <Text style={s.saveText}>Save</Text>}
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
            {/* Category */}
            {!editRecord && (
              <>
                <Text style={s.label}>Category *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
                  {CATEGORIES.map((c) => (
                    <TouchableOpacity key={c} style={[s.catChip, form.category === c && { backgroundColor: CAT_COLORS[c], borderColor: CAT_COLORS[c] }]} onPress={() => setForm((f) => ({ ...f, category: c }))}>
                      <Text style={[s.catChipText, form.category === c && { color: '#fff' }]}>{CAT_ICONS[c]} {c}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            {/* Date */}
            <Text style={s.label}>Date *</Text>
            <TextInput style={s.input} value={form.date} onChangeText={updateField('date')} placeholder="YYYY-MM-DD" />

            {/* Dynamic fields per category */}
            {(CATEGORY_FIELDS[form.category] || []).map((field) => (
              <View key={field.key}>
                <Text style={s.label}>{field.label}</Text>
                <TextInput style={s.input} value={form[field.key] || ''} onChangeText={updateField(field.key)}
                  keyboardType={field.keyboard || 'default'} placeholder={field.label.replace(' *', '')} />
              </View>
            ))}

            {/* Notes */}
            <Text style={s.label}>Notes</Text>
            <TextInput style={[s.input, { minHeight: 80 }]} value={form.notes || ''} onChangeText={updateField('notes')} placeholder="Additional notes..." multiline />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  summaryRow: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee', flexGrow: 0 },
  summaryCard: { backgroundColor: '#f9f9f9', borderRadius: 10, padding: 10, alignItems: 'center', minWidth: 70 },
  summaryVal: { fontSize: 20, fontWeight: '800', color: '#1b5e20' },
  summaryLbl: { fontSize: 10, color: '#888', marginTop: 2, textTransform: 'uppercase' },
  toolbar: { flexDirection: 'row', padding: 12, gap: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  searchInput: { flex: 1, backgroundColor: '#f0f0f0', borderRadius: 10, padding: 10, fontSize: 14 },
  addBtn: { backgroundColor: GREEN, borderRadius: 10, paddingHorizontal: 16, justifyContent: 'center' },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  catFilter: { backgroundColor: '#fff', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee', flexGrow: 0 },
  catChip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: '#ddd', marginRight: 8, backgroundColor: '#fff' },
  catChipText: { fontSize: 12, color: '#555', fontWeight: '600' },
  recordCard: { backgroundColor: '#fff', marginHorizontal: 14, marginVertical: 5, borderRadius: 12, padding: 14, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  recordHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  catDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  recordCat: { fontSize: 12, fontWeight: '700', color: '#555', flex: 1, textTransform: 'uppercase', letterSpacing: 0.3 },
  recordDate: { fontSize: 11, color: '#aaa' },
  recordField: { fontSize: 13, color: '#333', marginTop: 2 },
  fieldKey: { fontWeight: '700', color: '#555' },
  recordActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 10 },
  editBtn: { backgroundColor: '#e8f5e9', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
  editBtnText: { color: GREEN, fontWeight: '700', fontSize: 12 },
  delBtn: { backgroundColor: '#ffebee', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
  delBtnText: { color: '#c62828', fontWeight: '700', fontSize: 12 },
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
  emptyText: { fontSize: 14, color: '#aaa', textAlign: 'center', marginTop: 12 },
  // Modal
  modal: { flex: 1, backgroundColor: '#fff' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee', paddingTop: 56 },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  cancelText: { color: '#888', fontSize: 15 },
  saveText: { color: GREEN, fontWeight: '700', fontSize: 15 },
  label: { fontSize: 12, fontWeight: '700', color: '#555', marginBottom: 5, marginTop: 12, textTransform: 'uppercase', letterSpacing: 0.3 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 14, backgroundColor: '#fafafa' },
});
