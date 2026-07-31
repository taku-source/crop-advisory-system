import React, { useState, useEffect, useCallback } from 'react';
import { getRecords, createRecord, updateRecord, deleteRecord, getRecordSummary } from '../api';
import { PageHeader, SearchBar, Button, Chip, Modal, Field, Input, Textarea, Select, toast } from '../components/UI';

const CATEGORIES = ['Planting', 'Fertilizer', 'Pesticide', 'Harvest', 'Expense'];
const CATEGORY_FIELDS = {
  Planting:   [{ key: 'crop', label: 'Crop *' }, { key: 'variety', label: 'Variety' }, { key: 'area', label: 'Area' }],
  Fertilizer: [{ key: 'productName', label: 'Fertilizer Type *' }, { key: 'quantity', label: 'Quantity' }],
  Pesticide:  [{ key: 'productName', label: 'Chemical/Product *' }, { key: 'quantity', label: 'Quantity' }],
  Harvest:    [{ key: 'crop', label: 'Crop *' }, { key: 'quantityHarvested', label: 'Quantity Harvested *' }],
  Expense:    [{ key: 'item', label: 'Item/Description *' }, { key: 'cost', label: 'Cost (USD) *' }],
};

export default function FarmerRecordsPage() {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ category: 'Planting', date: new Date().toISOString().slice(0, 10), notes: '' });
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [recordsRes, summaryRes] = await Promise.all([getRecords(), getRecordSummary()]);
      setRecords(recordsRes.data.records);
      setSummary(summaryRes.data.summary);
    } catch {
      toast.error('Failed to load records');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleOpen = (record = null) => {
    if (record) {
      setEditing(record);
      setForm({ ...record, date: record.date?.split('T')[0] || new Date().toISOString().slice(0, 10) });
    } else {
      setEditing(null);
      setForm({ category: 'Planting', date: new Date().toISOString().slice(0, 10), notes: '' });
    }
    setModalOpen(true);
  };

  const handleChange = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const validate = () => {
    const required = CATEGORY_FIELDS[form.category] || [];
    const missing = required.filter((field) => field.label.endsWith('*') && !form[field.key]);
    if (!form.date) missing.push({ label: 'Date *' });
    return missing;
  };

  const handleSave = async () => {
    const missing = validate();
    if (missing.length) return toast.error(`Please fill required fields: ${missing.map((f) => f.label.replace('*', '').trim()).join(', ')}`);
    setSaving(true);
    try {
      if (editing) {
        await updateRecord(editing._id, form);
        toast.success('Record updated');
      } else {
        await createRecord(form);
        toast.success('Record added');
      }
      setModalOpen(false);
      loadData();
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (recordId) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      await deleteRecord(recordId);
      toast.success('Record deleted');
      loadData();
    } catch {
      toast.error('Delete failed');
    }
  };

  const filtered = records.filter((record) => {
    const matchesCategory = category === 'All' || record.category === category;
    const matchesSearch = !search || JSON.stringify(record).toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div>
      <PageHeader title="Farm Records" action={<Button onClick={() => handleOpen()}>+ Add Record</Button>} />
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search records..." />
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: '#122916', color: '#e6f6ea', minWidth: 180 }}>
          <option value="All">All Categories</option>
          {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      {summary && (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
          <div style={{ background: '#0f231a', padding: 18, borderRadius: 16, boxShadow: '0 12px 30px rgba(0,0,0,0.16)', minWidth: 180, border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: 12, color: '#9fbfa8' }}>Total Records</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#e6f6ea' }}>{summary.totalRecords}</div>
          </div>
          {Object.entries(summary.byCategory || {}).map(([key, value]) => (
            <div key={key} style={{ background: '#0f231a', padding: 18, borderRadius: 16, boxShadow: '0 12px 30px rgba(0,0,0,0.16)', minWidth: 140, border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: 12, color: '#9fbfa8' }}>{key}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#e6f6ea' }}>{value}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gap: 16 }}>
        {filtered.length === 0 ? <div style={{ color: '#9fbfa8' }}>No records found.</div> : filtered.map((record) => (
          <div key={record._id} style={{ background: '#0f231a', borderRadius: 20, padding: 22, boxShadow: '0 16px 40px rgba(0,0,0,0.16)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#e6f6ea' }}>{record.category}</div>
                <div style={{ color: '#9fbfa8', fontSize: 13 }}>{new Date(record.date).toLocaleDateString('en-GB')}</div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <Button variant="secondary" size="sm" onClick={() => handleOpen(record)}>Edit</Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(record._id)}>Delete</Button>
              </div>
            </div>
            <div style={{ display: 'grid', gap: 10, fontSize: 14 }}>
              {record.crop && <div><strong>Crop:</strong> {record.crop}</div>}
              {record.productName && <div><strong>Product:</strong> {record.productName}</div>}
              {record.quantity && <div><strong>Quantity:</strong> {record.quantity}</div>}
              {record.quantityHarvested && <div><strong>Harvested:</strong> {record.quantityHarvested}</div>}
              {record.item && <div><strong>Item:</strong> {record.item}</div>}
              {record.cost != null && <div><strong>Cost:</strong> ${record.cost}</div>}
              {record.notes && <div><strong>Notes:</strong> {record.notes}</div>}
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <Modal title={editing ? 'Edit Record' : 'New Farm Record'} onClose={() => setModalOpen(false)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Category"><Select value={form.category} onChange={handleChange('category')}>
              {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </Select></Field>
            <Field label="Date"><Input type="date" value={form.date} onChange={handleChange('date')} /></Field>
          </div>

          {(CATEGORY_FIELDS[form.category] || []).map((field) => (
            <Field key={field.key} label={field.label}><Input value={form[field.key] || ''} onChange={handleChange(field.key)} /></Field>
          ))}

          <Field label="Notes"><Textarea rows={4} value={form.notes} onChange={handleChange('notes')} /></Field>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 18 }}>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Record'}</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
