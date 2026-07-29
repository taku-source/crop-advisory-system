import React, { useState, useEffect } from 'react';
import { getNotifications } from '../api';
import { PageHeader, Chip, toast } from '../components/UI';

const TYPE_COLORS = { Advisory: 'blue', 'Disease Alert': 'red', Reminder: 'orange', Announcement: 'green' };

export default function FarmerNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getNotifications();
        setNotifications(res.data.notifications);
      } catch {
        toast.error('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div>
      <PageHeader title="Farmer Notifications" />
      {loading ? (
        <div style={{ color: '#666' }}>Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div style={{ color: '#888' }}>No notifications yet. Check back regularly for updates.</div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {notifications.map((note) => (
            <div key={note._id} style={{ background: '#fff', borderRadius: 18, padding: 22, boxShadow: '0 16px 36px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 14 }}>
                <div>
                  <strong style={{ fontSize: 15 }}>{note.title}</strong>
                  <div style={{ color: '#666', fontSize: 12, marginTop: 6 }}>{new Date(note.createdAt).toLocaleDateString('en-GB')}</div>
                </div>
                <Chip color={TYPE_COLORS[note.type] ? 'grey' : 'grey'}>{note.type}</Chip>
              </div>
              <p style={{ color: '#444', lineHeight: 1.7 }}>{note.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
