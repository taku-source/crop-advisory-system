import React, { useState, useEffect, useCallback } from 'react';
import { getNotifications, createNotification, deleteNotification } from '../api';
import { PageHeader, Table, Chip, Button, Modal, Field, Input, Textarea, Select, ConfirmDialog, toast } from '../components/UI';

const TYPE_COLORS = { Advisory: 'blue', 'Disease Alert': 'red', Reminder: 'orange', Announcement: 'grey' };
const TYPE_ICONS  = { Advisory: '📋', 'Disease Alert': '⚠️', Reminder: '⏰', Announcement: '📣' };

const EMPTY_FORM = { title: '', message: '', type: 'Announcement', targetAll: true };

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm]     = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const fetch = useCallback(async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.data.notifications);
    } catch { toast.error('Failed to load notifications'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const upd = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSend = async () => {
    if (!form.title || !form.message) return toast.error('Title and message are required');
    setSaving(true);
    try {
      await createNotification(form);
      toast.success('Notification sent to all farmers 📲');
      setModalOpen(false);
      setForm(EMPTY_FORM);
      fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to send'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await deleteNotification(confirm._id); toast.success('Deleted'); fetch(); }
    catch { toast.error('Delete failed'); }
    finally { setConfirm(null); }
  };

  const fmt = (d) => d ? new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

  const columns = [
    {
      label: 'Notification',
      render: (n) => (
        <div>
          <div style={{ fontWeight: 700, marginBottom: 2 }}>{n.title}</div>
          <div style={{ fontSize: 12, color: '#666', maxWidth: 320 }}>{n.message}</div>
        </div>
      ),
    },
    { label: 'Type', render: (n) => <span>{TYPE_ICONS[n.type]} <Chip color={TYPE_COLORS[n.type] || 'grey'}>{n.type}</Chip></span> },
    { label: 'Target', render: (n) => <Chip color="green">{n.targetAll ? '👥 All Farmers' : '👤 Selected'}</Chip> },
    { label: 'Sent', render: (n) => <span style={{ fontSize: 12, color: '#aaa' }}>{fmt(n.createdAt)}</span> },
    { label: 'Actions', render: (n) => <Button size="sm" variant="danger" onClick={() => setConfirm(n)}>Delete</Button> },
  ];

  // Aggregate stats
  const byType = notifications.reduce((a, n) => { a[n.type] = (a[n.type] || 0) + 1; return a; }, {});

  return (
    <div>
      <PageHeader
        title="Notifications"
        action={<Button onClick={() => setModalOpen(true)}>📣 Send Notification</Button>}
      />

      {/* Summary chips */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {Object.entries(byType).map(([type, count]) => (
          <div key={type} style={{ background: '#fff', border: '1px solid #eee', borderRadius: 10, padding: '8px 16px', fontSize: 13 }}>
            {TYPE_ICONS[type]} <strong>{count}</strong> {type}
          </div>
        ))}
        {notifications.length > 0 && (
          <div style={{ background: '#e8f5e9', border: '1px solid #c8e6c9', borderRadius: 10, padding: '8px 16px', fontSize: 13, color: '#2e7d32' }}>
            📊 <strong>{notifications.length}</strong> total notifications
          </div>
        )}
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: 40, color: '#aaa' }}>Loading...</div>
        : <Table columns={columns} rows={notifications} empty="No notifications sent yet" />}

      {modalOpen && (
        <Modal title="📣 Send Notification" onClose={() => setModalOpen(false)}>
          <Field label="Title *">
            <Input value={form.title} onChange={upd('title')} placeholder="Short, clear heading..." />
          </Field>
          <Field label="Message *">
            <Textarea value={form.message} onChange={upd('message')} rows={4} placeholder="Your message to farmers..." />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
            <Field label="Type">
              <Select value={form.type} onChange={upd('type')}>
                {['Announcement', 'Advisory', 'Disease Alert', 'Reminder'].map((t) => <option key={t} value={t}>{t}</option>)}
              </Select>
            </Field>
          </div>

          {/* FCM info box */}
          <div style={{ marginTop: 16, background: '#e3f2fd', borderRadius: 10, padding: 14, fontSize: 13, color: '#1565c0', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 18 }}>📱</span>
            <div>
              <strong>Firebase Cloud Messaging</strong><br />
              This notification will be pushed to all farmers with the app installed and push notifications enabled.
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20, paddingTop: 16, borderTop: '1px solid #eee' }}>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSend} disabled={saving}>{saving ? 'Sending...' : 'Send to All Farmers'}</Button>
          </div>
        </Modal>
      )}

      {confirm && (
        <ConfirmDialog
          message={`Delete notification "${confirm.title}"?`}
          onConfirm={handleDelete}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
