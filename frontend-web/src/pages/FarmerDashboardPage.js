import React, { useState, useEffect } from 'react';
import { getAdvisories, getNotifications, getRecordSummary } from '../api';
import Logo from '../components/Logo';
import { PageHeader, StatCard, Button, toast } from '../components/UI';

export default function FarmerDashboardPage({ onNavigate }) {
  const [summary, setSummary] = useState(null);
  const [advisories, setAdvisories] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [advRes, noteRes, sumRes] = await Promise.all([
          getAdvisories({ upcoming: true }),
          getNotifications(),
          getRecordSummary(),
        ]);
        setAdvisories(advRes.data.advisories.slice(0, 4));
        setNotifications(noteRes.data.notifications.slice(0, 4));
        setSummary(sumRes.data.summary);
      } catch {
        toast.error('Unable to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';

  if (loading) return <div style={{ padding: 32, color: '#555' }}>Loading dashboard...</div>;

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #f4faf0 0%, #e7f5e4 45%, #d0e8cc 100%)', borderRadius: 24, padding: '28px 32px', marginBottom: 28, color: '#1b5e20', border: '1px solid #c8e6c9', boxShadow: '0 16px 40px rgba(46, 125, 50, 0.10)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
          <Logo size={58} />
          <div>
            <div style={{ fontSize: 13, color: '#2e7d32', marginBottom: 4, fontWeight: 700 }}>{greeting},</div>
            <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 2 }}>Welcome back</div>
            <div style={{ fontSize: 13, color: '#4e7c4b' }}>Your personalized farm advisory and weather-aware guidance.</div>
          </div>
        </div>
        <div style={{ marginTop: 8, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { label: 'System Status', val: '🟢 Online' },
            { label: 'Notifications', val: '📱 New updates' },
            { label: 'Region', val: '🗺️ III' },
            { label: 'Season', val: '🌽 Main Season' },
          ].map((s) => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.75)', borderRadius: 10, padding: '8px 14px', fontSize: 12, border: '1px solid #dceedd' }}>
              <span style={{ color: '#4e7c4b' }}>{s.label}: </span><strong>{s.val}</strong>
            </div>
          ))}
        </div>
      </div>

      <PageHeader title="Farmer Dashboard" action={<Button onClick={() => onNavigate('advisories')}>View all advisories</Button>} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16, marginBottom: 26 }}>
        <StatCard icon="📋" label="Upcoming Advisories" value={advisories.length} color="#1565c0" />
        <StatCard icon="🔔" label="Recent Alerts" value={notifications.length} color="#e65100" />
        <StatCard icon="📝" label="Farm Records" value={summary?.totalRecords ?? 0} color="#2e7d32" />
        <StatCard icon="💰" label="Estimated Expenses" value={`$${Math.round(summary?.totalExpenses || 0)}`} color="#6a1b9a" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 18 }}>
        <section style={{ background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div><h2 style={{ margin: 0, fontSize: 18 }}>Upcoming Advisories</h2><p style={{ margin: '6px 0 0', color: '#666' }}>Latest guidance for your farm.</p></div>
            <Button variant="secondary" onClick={() => onNavigate('advisories')}>See all</Button>
          </div>
          {advisories.length === 0
            ? <div style={{ color: '#888' }}>No upcoming advisories in your area yet.</div>
            : advisories.map((advisory) => (
              <div key={advisory._id} style={{ borderBottom: '1px solid #f1f1f1', padding: '14px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{advisory.activity}</div>
                    <div style={{ fontSize: 13, color: '#777' }}>{advisory.crop}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}><strong>{new Date(advisory.recommendedDate).toLocaleDateString('en-GB')}</strong></div>
                </div>
                <div style={{ marginTop: 8, color: '#555', fontSize: 13 }}>{advisory.description}</div>
              </div>
            ))}
        </section>

        <section style={{ background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div><h2 style={{ margin: 0, fontSize: 18 }}>Recent Alerts</h2><p style={{ margin: '6px 0 0', color: '#666' }}>Notifications from your advisor.</p></div>
            <Button variant="secondary" onClick={() => onNavigate('notifications')}>See all</Button>
          </div>
          {notifications.length === 0
            ? <div style={{ color: '#888' }}>No notifications yet.</div>
            : notifications.map((note) => (
              <div key={note._id} style={{ marginBottom: 16, padding: 14, borderRadius: 14, background: '#fafafa' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                  <div><strong style={{ fontSize: 14 }}>{note.title}</strong><div style={{ color: '#888', fontSize: 12 }}>{note.type}</div></div>
                  <span style={{ color: '#999', fontSize: 12 }}>{new Date(note.createdAt).toLocaleDateString('en-GB')}</span>
                </div>
                <p style={{ margin: '10px 0 0', color: '#555' }}>{note.message}</p>
              </div>
            ))}
        </section>
      </div>
    </div>
  );
}
