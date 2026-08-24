import React, { useState, useEffect } from 'react';
import { getSeasonalPlan, getNotifications, getRecordSummary } from '../api';
import Logo from '../components/Logo';
import { PageHeader, StatCard, Button, toast } from '../components/UI';

export default function FarmerDashboardPage({ onNavigate }) {
  const [summary, setSummary] = useState(null);
  const [plan, setPlan] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [planRes, noteRes, sumRes] = await Promise.all([
          getSeasonalPlan(),
          getNotifications(),
          getRecordSummary(),
        ]);
        setPlan(planRes.data.data);
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

  if (loading) return <div style={{ padding: 32, color: '#ffffff' }}>Loading dashboard...</div>;

  return (
    <div>
      <div style={{ background: '#07120a', borderRadius: 24, padding: '28px 32px', marginBottom: 28, color: '#e6f6ea', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 16px 40px rgba(0,0,0,0.28)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
          <Logo size={160} />
          <div>
            <div style={{ fontSize: 13, color: '#9fbfa8', marginBottom: 4, fontWeight: 700 }}>{greeting},</div>
            <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 2 }}>Welcome back</div>
            <div style={{ fontSize: 13, color: '#9fbfa8' }}>Your personalized farm advisory and weather-aware guidance.</div>
          </div>
        </div>
        <div style={{ marginTop: 8, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { label: 'System Status', val: '🟢 Online' },
            { label: 'Notifications', val: '📱 New updates' },
            { label: 'Region', val: '🗺️ III' },
            { label: 'Season', val: '🌽 Main Season' },
          ].map((s) => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '8px 14px', fontSize: 12, border: '1px solid rgba(255,255,255,0.12)', color: '#9fbfa8' }}>
              <span style={{ color: '#c8f7d0' }}>{s.label}: </span><strong style={{ color: '#e6f6ea' }}>{s.val}</strong>
            </div>
          ))}
        </div>
      </div>

      <PageHeader title="Farmer Dashboard" action={<Button onClick={() => onNavigate('advisories')}>View all advisories</Button>} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16, marginBottom: 26 }}>
        <StatCard icon="📋" label="Current Actions" value={plan?.currentActions?.length ?? 0} color="#1565c0" />
        <StatCard icon="🔔" label="Recent Alerts" value={notifications.length} color="#e65100" />
        <StatCard icon="📝" label="Farm Records" value={summary?.totalRecords ?? 0} color="#2e7d32" />
        <StatCard icon="💰" label="Estimated Expenses" value={`$${Math.round(summary?.totalExpenses || 0)}`} color="#6a1b9a" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 18 }}>
        <section style={{ background: '#0f231a', borderRadius: 20, padding: 24, boxShadow: '0 10px 30px rgba(0,0,0,0.16)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div><h2 style={{ margin: 0, fontSize: 18, color: '#e6f6ea' }}>What you should do now</h2><p style={{ margin: '6px 0 0', color: '#9fbfa8' }}>{plan?.crop || 'Selected crop'} · {plan?.currentStatus?.stage || 'Preparing plan'}</p></div>
            <Button variant="secondary" onClick={() => onNavigate('advisories')}>See all</Button>
          </div>
          <div style={{ color: '#ffffff', fontSize: 15, fontWeight: 700 }}>{plan?.currentActions?.[0]?.activity || 'No action is currently available'}</div>
          <div style={{ marginTop: 8, color: '#cfd9c8', fontSize: 13, lineHeight: 1.6 }}>{plan?.currentActions?.[0]?.description || plan?.currentStatus?.message}</div>
          <div style={{ marginTop: 12, color: '#8ee4a4', fontSize: 12 }}>Why: {plan?.currentActions?.[0]?.reason || 'Matched your crop, soil, season and Region III guidance.'}</div>
        </section>

        <section style={{ background: '#0f231a', borderRadius: 20, padding: 24, boxShadow: '0 10px 30px rgba(0,0,0,0.16)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div><h2 style={{ margin: 0, fontSize: 18, color: '#e6f6ea' }}>Recent Alerts</h2><p style={{ margin: '6px 0 0', color: '#9fbfa8' }}>Notifications from your advisor.</p></div>
            <Button variant="secondary" onClick={() => onNavigate('notifications')}>See all</Button>
          </div>
          {notifications.length === 0
            ? <div style={{ color: '#9fbfa8' }}>No notifications yet.</div>
            : notifications.map((note) => (
              <div key={note._id} style={{ marginBottom: 16, padding: 14, borderRadius: 14, background: '#0f231a', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                  <div><strong style={{ fontSize: 14, color: '#e6f6ea' }}>{note.title}</strong><div style={{ color: '#9fbfa8', fontSize: 12 }}>{note.type}</div></div>
                  <span style={{ color: '#9fbfa8', fontSize: 12 }}>{new Date(note.createdAt).toLocaleDateString('en-GB')}</span>
                </div>
                <p style={{ margin: '10px 0 0', color: '#cfd9c8' }}>{note.message}</p>
              </div>
            ))}
        </section>
      </div>
    </div>
  );
}
