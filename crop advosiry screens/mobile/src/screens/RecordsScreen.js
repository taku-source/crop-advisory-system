import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, StatusBar, Alert, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNav from '../components/BottomNav';
import { Colors, Fonts, Spacing, Radius } from '../constants/theme';
import { RECORD_CATEGORIES, SAMPLE_RECORDS } from '../constants/data';

const CAT_ICON_BG = {
  planting:   'rgba(74,222,128,.12)',
  fertiliser: 'rgba(56,189,248,.12)',
  pesticide:  'rgba(251,191,36,.12)',
  harvest:    'rgba(200,169,110,.12)',
  expense:    'rgba(248,113,113,.12)',
};

const CATEGORY_FIELDS = {
  planting:   [{ key:'crop', label:'Crop *', required:true }, { key:'variety', label:'Variety' }, { key:'area', label:'Area planted' }, { key:'rowSpacing', label:'Row spacing' }, { key:'plantSpacing', label:'Plant spacing' }, { key:'basalFert', label:'Basal fertiliser applied' }],
  fertiliser: [{ key:'crop', label:'Crop' }, { key:'product', label:'Fertiliser / product *', required:true }, { key:'rate', label:'Rate (kg/ha) *', required:true }, { key:'area', label:'Area treated' }],
  pesticide:  [{ key:'crop', label:'Crop' }, { key:'chemical', label:'Chemical / product *', required:true }, { key:'quantity', label:'Quantity used *', required:true }, { key:'target', label:'Target pest / disease' }],
  harvest:    [{ key:'crop', label:'Crop *', required:true }, { key:'variety', label:'Variety' }, { key:'qty', label:'Quantity harvested *', required:true }, { key:'area', label:'Area harvested' }],
  expense:    [{ key:'item', label:'Item / description *', required:true }, { key:'cost', label:'Cost (USD) *', required:true, keyboard:'numeric' }, { key:'supplier', label:'Supplier / where purchased' }],
};

// ─── RecordsScreen ────────────────────────────────────────────────────────────
export function RecordsScreen({ navigation }) {
  const [records, setRecords] = useState(SAMPLE_RECORDS);
  const [filter, setFilter]   = useState('all');
  const [showAdd, setShowAdd] = useState(false);

  const filtered = filter === 'all' ? records : records.filter(r => r.category === filter);

  const totalExpenses = records.filter(r => r.category === 'expense').length;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <View style={s.hdr}>
        <Text style={s.hdrTitle}>Farm Records</Text>
      </View>

      {/* Summary strip */}
      <View style={s.sumRow}>
        <View style={s.sumCard}>
          <Text style={s.sumVal}>{records.length}</Text>
          <Text style={s.sumLbl}>Total</Text>
        </View>
        <View style={s.sumCard}>
          <Text style={[s.sumVal, { color: Colors.soil }]}>
            {records.filter(r => r.category === 'expense').length}
          </Text>
          <Text style={s.sumLbl}>Expenses</Text>
        </View>
        <View style={s.sumCard}>
          <Text style={[s.sumVal, { color: Colors.sky }]}>
            {records.filter(r => r.category === 'harvest').length}
          </Text>
          <Text style={s.sumLbl}>Harvests</Text>
        </View>
      </View>

      {/* Add button */}
      <TouchableOpacity style={s.addBtn} onPress={() => setShowAdd(true)} activeOpacity={0.85}>
        <Text style={s.addBtnText}>+ Add Record</Text>
      </TouchableOpacity>

      {/* Category filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterRow} contentContainerStyle={{ paddingHorizontal: Spacing.lg, gap: 7 }}>
        {[{ id:'all', label:'All', emoji:'📋' }, ...RECORD_CATEGORIES].map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[s.filterChip, filter === cat.id && s.filterChipActive]}
            onPress={() => setFilter(cat.id)}
            activeOpacity={0.8}
          >
            <Text style={[s.filterChipTxt, filter === cat.id && s.filterChipTxtActive]}>
              {cat.emoji} {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Records list */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={s.empty}>
            <Text style={{ fontSize: 40, marginBottom: 10 }}>📝</Text>
            <Text style={s.emptyText}>No records yet. Tap + Add Record to get started.</Text>
          </View>
        ) : filtered.map(rec => (
          <View key={rec.id} style={s.recItem}>
            <View style={[s.recIcon, { backgroundColor: CAT_ICON_BG[rec.category] || Colors.muted }]}>
              <Text style={{ fontSize: 18 }}>
                {RECORD_CATEGORIES.find(c => c.id === rec.category)?.emoji || '📝'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.recName}>{rec.name}</Text>
              <Text style={s.recMeta}>{rec.meta}</Text>
            </View>
            <Text style={s.recDate}>{rec.date}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Add Record Modal */}
      <Modal visible={showAdd} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowAdd(false)}>
        <AddRecordModal onClose={() => setShowAdd(false)} onSave={(rec) => { setRecords(prev => [rec, ...prev]); setShowAdd(false); }} />
      </Modal>

      <BottomNav active="Records" navigation={navigation} />
    </SafeAreaView>
  );
}

// ─── AddRecordModal ───────────────────────────────────────────────────────────
function AddRecordModal({ onClose, onSave }) {
  const [category, setCategory] = useState('planting');
  const [form, setForm]         = useState({ date: new Date().toISOString().split('T')[0], notes: '' });

  const upd = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = () => {
    const fields = CATEGORY_FIELDS[category] || [];
    const missing = fields.filter(f => f.required && !form[f.key]?.trim());
    if (missing.length > 0 || !form.date) {
      return Alert.alert('Required', `Please fill in: ${missing.map(f => f.label.replace(' *', '')).join(', ')}`);
    }
    const cat = RECORD_CATEGORIES.find(c => c.id === category);
    onSave({
      id: Date.now().toString(),
      category,
      name: `${cat?.label || category} — ${form.crop || form.item || ''}`,
      meta: form.variety || form.product || form.chemical || form.qty || `$${form.cost}` || '',
      date: form.date,
    });
  };

  return (
    <View style={s.modal}>
      {/* Modal header */}
      <View style={s.modalHdr}>
        <TouchableOpacity onPress={onClose}><Text style={s.modalCancel}>Cancel</Text></TouchableOpacity>
        <Text style={s.modalTitle}>Add Record</Text>
        <TouchableOpacity onPress={handleSave}><Text style={s.modalSave}>Save</Text></TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: Spacing.xl }} keyboardShouldPersistTaps="handled">

        {/* Category selector */}
        <Text style={s.formLabel}>Record type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 18 }} contentContainerStyle={{ gap: 8 }}>
          {RECORD_CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[s.catChip, category === cat.id && { backgroundColor: cat.color + '22', borderColor: cat.color }]}
              onPress={() => { setCategory(cat.id); setForm({ date: form.date, notes: '' }); }}
              activeOpacity={0.8}
            >
              <Text style={[s.catChipTxt, category === cat.id && { color: cat.color }]}>{cat.emoji} {cat.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Date */}
        <Text style={s.formLabel}>Date *</Text>
        <TextInput style={s.formInput} value={form.date} onChangeText={upd('date')} placeholder="YYYY-MM-DD" placeholderTextColor={Colors.grey} />

        {/* Dynamic fields */}
        {(CATEGORY_FIELDS[category] || []).map(field => (
          <View key={field.key}>
            <Text style={s.formLabel}>{field.label}</Text>
            <TextInput
              style={s.formInput}
              value={form[field.key] || ''}
              onChangeText={upd(field.key)}
              placeholder={field.label.replace(' *', '')}
              placeholderTextColor={Colors.grey}
              keyboardType={field.keyboard || 'default'}
            />
          </View>
        ))}

        {/* Notes */}
        <Text style={s.formLabel}>Notes</Text>
        <TextInput
          style={[s.formInput, { minHeight: 80, textAlignVertical: 'top' }]}
          value={form.notes} onChangeText={upd('notes')}
          placeholder="Additional notes…" placeholderTextColor={Colors.grey}
          multiline
        />
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.black },
  hdr: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md },
  hdrTitle: { fontFamily: Fonts.display, fontSize: 22, fontWeight: '800', color: Colors.white },

  sumRow: { flexDirection: 'row', marginHorizontal: Spacing.lg, marginBottom: 12, gap: 8 },
  sumCard: { flex: 1, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, padding: 12, alignItems: 'center' },
  sumVal: { fontFamily: Fonts.display, fontSize: 22, fontWeight: '800', color: Colors.leaf },
  sumLbl: { fontFamily: Fonts.mono, fontSize: 9, color: Colors.grey, textTransform: 'uppercase', marginTop: 2 },

  addBtn: { marginHorizontal: Spacing.lg, backgroundColor: Colors.leaf, borderRadius: 12, padding: 12, alignItems: 'center', marginBottom: 12, flexDirection: 'row', justifyContent: 'center', gap: 7 },
  addBtnText: { fontFamily: Fonts.bold, fontSize: 14, color: '#041a0a' },

  filterRow: { flexGrow: 0, marginBottom: 12, paddingVertical: 4 },
  filterChip: { paddingHorizontal: 13, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.card },
  filterChipActive: { backgroundColor: Colors.leafDim, borderColor: Colors.leaf },
  filterChipTxt: { fontFamily: Fonts.semibold, fontSize: 12, color: Colors.grey },
  filterChipTxtActive: { color: Colors.leaf },

  recItem: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, padding: 13, marginBottom: 8 },
  recIcon: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  recName: { fontFamily: Fonts.semibold, fontSize: 13, color: Colors.white, marginBottom: 2 },
  recMeta: { fontFamily: Fonts.mono, fontSize: 10, color: Colors.grey },
  recDate: { fontFamily: Fonts.mono, fontSize: 10, color: Colors.grey },

  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontFamily: Fonts.body, fontSize: 14, color: Colors.grey, textAlign: 'center', marginTop: 10 },

  // Modal
  modal: { flex: 1, backgroundColor: Colors.black },
  modalHdr: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.xl, paddingTop: 56, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalTitle: { fontFamily: Fonts.display, fontSize: 17, fontWeight: '800', color: Colors.white },
  modalCancel: { fontFamily: Fonts.semibold, fontSize: 15, color: Colors.grey },
  modalSave: { fontFamily: Fonts.bold, fontSize: 15, color: Colors.leaf },
  formLabel: { fontFamily: Fonts.mono, fontSize: 10, color: Colors.grey, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 5, marginTop: 14 },
  formInput: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, padding: 12, fontSize: 14, color: Colors.white, fontFamily: Fonts.body },
  catChip: { paddingHorizontal: 13, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.card },
  catChipTxt: { fontFamily: Fonts.semibold, fontSize: 12, color: Colors.grey },
});
