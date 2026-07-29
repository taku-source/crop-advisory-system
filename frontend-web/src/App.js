import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer, toast } from './components/UI';
import Logo from './components/Logo';
import FarmersPage      from './pages/FarmersPage';
import AdvisoriesPage   from './pages/AdvisoriesPage';
import DiseasesPage     from './pages/DiseasesPage';
import NotificationsPage from './pages/NotificationsPage';
import RegisterPage     from './pages/RegisterPage';
import FarmerDashboardPage from './pages/FarmerDashboardPage';
import FarmerAdvisoriesPage from './pages/FarmerAdvisoriesPage';
import FarmerDiseasePage   from './pages/FarmerDiseasePage';
import FarmerRecordsPage   from './pages/FarmerRecordsPage';
import FarmerNotificationsPage from './pages/FarmerNotificationsPage';
import FarmerKnowledgePage from './pages/FarmerKnowledgePage';
import { ReportsPage, KnowledgePage } from './pages/ReportsKnowledgePages';

// ─── Dashboard overview ───────────────────────────────────────────────────────
function DashboardPage() {
  const { user } = useAuth();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const quickStats = [
    { icon: '👨‍🌾', label: 'Manage Farmers', desc: 'View, edit and manage farmer accounts', page: 'farmers', color: '#2e7d32' },
    { icon: '📋', label: 'Seasonal Advisories', desc: 'Create and schedule farming advisories', page: 'advisories', color: '#1565c0' },
    { icon: '🦠', label: 'Disease Database', desc: 'Manage symptom-based disease identification', page: 'diseases', color: '#6a1b9a' },
    { icon: '🔔', label: 'Notifications', desc: 'Send push notifications to all farmers', page: 'notifications', color: '#e65100' },
    { icon: '📈', label: 'Reports', desc: 'Analytics and system usage reports', page: 'reports', color: '#00695c' },
    { icon: '📚', label: 'Knowledge Base', desc: 'Manage farming guides and articles', page: 'knowledge', color: '#c62828' },
  ];

  return (
    <div>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)', borderRadius: 16, padding: '28px 32px', marginBottom: 28, color: '#fff' }}>
        <div style={{ fontSize: 13, color: '#a5d6a7', marginBottom: 4 }}>{greeting},</div>
        <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>{user?.fullName}</div>
        <div style={{ fontSize: 13, color: '#81c784' }}>
          Seasonal Crop Advisory System · Zimbabwe Agro-Ecological Region III · Main Season 2024/25
        </div>
        <div style={{ marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { label: 'System Status', val: '🟢 Online' },
            { label: 'Push Notifications', val: '📱 Firebase Active' },
            { label: 'Cron Jobs', val: '⏰ Daily 07:00' },
            { label: 'Season', val: '🌽 Main Season' },
          ].map((s) => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 14px', fontSize: 12 }}>
              <span style={{ color: '#a5d6a7' }}>{s.label}: </span><strong>{s.val}</strong>
            </div>
          ))}
        </div>
      </div>

      {/* Quick access grid */}
      <h2 style={{ fontSize: 15, fontWeight: 700, color: '#333', marginBottom: 14 }}>Quick Access</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {quickStats.map((s) => (
          <QuickCard key={s.page} {...s} />
        ))}
      </div>

      {/* Season timeline */}
      <h2 style={{ fontSize: 15, fontWeight: 700, color: '#333', marginTop: 28, marginBottom: 14 }}>Season Timeline — Maize 2024/25</h2>
      <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
        <div style={{ display: 'flex', gap: 0, overflowX: 'auto', paddingBottom: 8 }}>
          {[
            { month: 'Oct', activity: 'Land Prep', done: true },
            { month: 'Nov', activity: 'Planting', done: true },
            { month: 'Dec', activity: 'Weeding', done: true },
            { month: 'Jan', activity: 'Top Dress', done: false, current: true },
            { month: 'Feb', activity: 'FAW Check', done: false },
            { month: 'Mar', activity: 'Pest Ctrl', done: false },
            { month: 'Apr', activity: 'Harvest', done: false },
          ].map((t, i, arr) => (
            <div key={t.month} style={{ flex: 1, minWidth: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
              {/* Connector line */}
              {i < arr.length - 1 && <div style={{ position: 'absolute', top: 16, left: '50%', width: '100%', height: 2, background: t.done ? '#2e7d32' : '#e0e0e0', zIndex: 0 }} />}
              {/* Dot */}
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: t.done ? '#2e7d32' : t.current ? '#fff' : '#f5f5f5', border: t.current ? '3px solid #2e7d32' : t.done ? 'none' : '2px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, zIndex: 1, boxShadow: t.current ? '0 0 0 4px rgba(46,125,50,0.2)' : 'none' }}>
                {t.done ? '✓' : t.current ? '●' : '○'}
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: t.done ? '#2e7d32' : t.current ? '#1b5e20' : '#aaa', marginTop: 6 }}>{t.month}</div>
              <div style={{ fontSize: 10, color: '#888', textAlign: 'center', marginTop: 2 }}>{t.activity}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function QuickCard({ icon, label, desc, page, color }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={() => window._setPage(page)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ background: '#fff', borderRadius: 12, padding: 20, cursor: 'pointer', transition: 'all 0.15s', boxShadow: hover ? `0 8px 24px ${color}22` : '0 1px 4px rgba(0,0,0,0.07)', borderTop: `3px solid ${color}`, transform: hover ? 'translateY(-2px)' : 'none' }}>
      <div style={{ fontSize: 28, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 12, color: '#888', lineHeight: 1.5 }}>{desc}</div>
    </div>
  );
}

// ─── Login page ───────────────────────────────────────────────────────────────
function LoginPage({ onSwitchMode }) {
  const { login } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f4faf0 0%, #e7f5e4 45%, #d0e8cc 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
      <div style={{ background: '#ffffff', borderRadius: 28, padding: '42px 36px', width: '100%', maxWidth: 460, boxShadow: '0 30px 80px rgba(0,0,0,0.14)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, marginBottom: 30 }}>
          <Logo size={82} />
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ margin: '0 0 8px', fontSize: 26, fontWeight: 800, color: '#1b5e20' }}>Crop Advisory System</h1>
          </div>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#555', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '14px 16px', border: '1px solid #dde4db', borderRadius: 14, fontSize: 14, outline: 'none', boxSizing: 'border-box', background: '#f7faf5' }}
              placeholder="admin@cropadvisory.zw" autoComplete="email" />
          </div>
          <div style={{ marginBottom: 22 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#555', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '14px 16px', border: '1px solid #dde4db', borderRadius: 14, fontSize: 14, outline: 'none', boxSizing: 'border-box', background: '#f7faf5' }}
              placeholder="••••••••" autoComplete="current-password" />
          </div>

          {error && <div style={{ background: '#ffebee', color: '#b71c1c', padding: '12px 14px', borderRadius: 12, fontSize: 13, marginBottom: 18, lineHeight: 1.5 }}>⚠️ {error}</div>}

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px 16px', background: '#2e7d32', color: '#fff', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.75 : 1 }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <button type="button" onClick={() => onSwitchMode('register')} style={{ marginTop: 24, display: 'block', width: '100%', background: '#fff', border: '1px solid #c8e6c9', borderRadius: 14, color: '#2e7d32', cursor: 'pointer', fontWeight: 700, padding: '12px 16px' }}>Register as a farmer</button>
      </div>
    </div>
  );
}

// ─── Sidebar + layout ─────────────────────────────────────────────────────────
const NAV = [
  { id: 'dashboard',     icon: '📊', label: 'Dashboard' },
  { id: 'farmers',       icon: '👨‍🌾', label: 'Farmers' },
  { id: 'advisories',    icon: '📋', label: 'Advisories' },
  { id: 'diseases',      icon: '🦠', label: 'Diseases' },
  { id: 'notifications', icon: '🔔', label: 'Notifications' },
  { id: 'reports',       icon: '📈', label: 'Reports' },
  { id: 'knowledge',     icon: '📚', label: 'Knowledge Base' },
];

const PAGE_TITLES = { dashboard: 'Dashboard', farmers: 'Farmer Management', advisories: 'Seasonal Advisories', diseases: 'Disease Database', notifications: 'Notifications', reports: 'Reports & Analytics', knowledge: 'Knowledge Base' };

function AdminLayout() {
  const { user, logout } = useAuth();
  const [page, setPage]  = useState('dashboard');

  // expose globally for QuickCard clicks
  window._setPage = setPage;

  const pages = { dashboard: <DashboardPage />, farmers: <FarmersPage />, advisories: <AdvisoriesPage />, diseases: <DiseasesPage />, notifications: <NotificationsPage />, reports: <ReportsPage />, knowledge: <KnowledgePage /> };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'Segoe UI', system-ui, sans-serif", color: '#1a1a1a' }}>
      {/* Sidebar */}
      <aside style={{ width: 236, background: '#1b5e20', color: '#fff', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: 30 }}>🌽</div>
          <div style={{ fontSize: 14, fontWeight: 800, marginTop: 8, lineHeight: 1.2 }}>Crop Advisory</div>
          <div style={{ fontSize: 10, color: '#81c784', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>Admin Dashboard</div>
        </div>

        <nav style={{ flex: 1, padding: '10px 0' }}>
          {NAV.map((n) => (
            <div key={n.id} onClick={() => setPage(n.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', cursor: 'pointer', fontSize: 13, color: page === n.id ? '#fff' : '#c8e6c9', borderLeft: `3px solid ${page === n.id ? '#69f0ae' : 'transparent'}`, background: page === n.id ? 'rgba(255,255,255,0.12)' : 'transparent', fontWeight: page === n.id ? 700 : 400, transition: 'all 0.15s' }}>
              <span style={{ width: 18, textAlign: 'center', fontSize: 16 }}>{n.icon}</span>
              {n.label}
            </div>
          ))}
        </nav>

        <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{user?.fullName}</div>
          <div style={{ fontSize: 11, color: '#81c784', marginBottom: 10 }}>{user?.email}</div>
          <button onClick={logout} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '7px 14px', borderRadius: 7, fontSize: 12, cursor: 'pointer', fontWeight: 600, width: '100%' }}>
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <div style={{ background: '#fff', padding: '14px 28px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1b5e20' }}>{PAGE_TITLES[page]}</h1>
          <div style={{ display: 'flex', gap: 10 }}>
            {['Region III', 'Main Season 2024/25'].map((b) => (
              <span key={b} style={{ background: '#e8f5e9', color: '#2e7d32', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20 }}>{b}</span>
            ))}
          </div>
        </div>

        {/* Page content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 28, background: '#f0f4f0' }}>
          {pages[page] || <DashboardPage />}
        </div>
      </div>
    </div>
  );
}

// ─── Root app ─────────────────────────────────────────────────────────────────
function FarmerLayout() {
  const { user, logout } = useAuth();
  const [page, setPage]  = useState('dashboard');

  const pages = {
    dashboard: <FarmerDashboardPage onNavigate={setPage} />,
    advisories: <FarmerAdvisoriesPage />,
    disease: <FarmerDiseasePage />,
    records: <FarmerRecordsPage />,
    notifications: <FarmerNotificationsPage />,
    knowledge: <FarmerKnowledgePage />,
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Segoe UI', system-ui, sans-serif", color: '#1a1a1a' }}>
      <aside style={{ width: 260, background: '#1b5e20', color: '#fff', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
          <div style={{ fontSize: 32 }}>🌽</div>
          <div style={{ fontSize: 16, fontWeight: 800, marginTop: 10 }}>Crop Advisory</div>
          <div style={{ fontSize: 11, color: '#81c784', marginTop: 6, textTransform: 'uppercase', letterSpacing: 0.4 }}>Farmer Portal</div>
        </div>

        <nav style={{ flex: 1, padding: '16px 0' }}>
          {[
            { id: 'dashboard', icon: '🏠', label: 'Home' },
            { id: 'advisories', icon: '📋', label: 'Advisories' },
            { id: 'disease', icon: '🔍', label: 'Disease ID' },
            { id: 'records', icon: '📝', label: 'Records' },
            { id: 'notifications', icon: '🔔', label: 'Notifications' },
            { id: 'knowledge', icon: '📚', label: 'Knowledge' },
          ].map((item) => (
            <div key={item.id} onClick={() => setPage(item.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', cursor: 'pointer', color: page === item.id ? '#fff' : '#c8e6c9', background: page === item.id ? 'rgba(255,255,255,0.12)' : 'transparent', borderLeft: `4px solid ${page === item.id ? '#69f0ae' : 'transparent'}`, fontWeight: page === item.id ? 700 : 500, transition: 'all 0.15s' }}>
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        <div style={{ padding: '18px 20px', borderTop: '1px solid rgba(255,255,255,0.14)' }}>
          <div style={{ fontSize: 13, fontWeight: 700 }}>{user?.fullName}</div>
          <div style={{ fontSize: 11, color: '#a5d6a7', marginTop: 4 }}>{user?.district || '—'} · {user?.ward || '—'}</div>
          <button onClick={logout} style={{ marginTop: 16, width: '100%', background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: 10, color: '#fff', padding: '10px 14px', cursor: 'pointer', fontWeight: 700 }}>Logout</button>
        </div>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ background: '#fff', padding: '18px 26px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1b5e20' }}>{page === 'dashboard' ? 'Dashboard' : page === 'advisories' ? 'Advisories' : page === 'disease' ? 'Disease Identifier' : page === 'records' ? 'Farm Records' : page === 'notifications' ? 'Notifications' : 'Knowledge Base'}</h1>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#555' }}>Region III</span>
            <span style={{ fontSize: 12, color: '#555' }}>Main Season 2024/25</span>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 28, background: '#f0f4f0' }}>
          {pages[page]}
        </div>
      </div>
    </div>
  );
}

function AppInner() {
  const { user, loading } = useAuth();
  const [mode, setMode] = useState('login');

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1b5e20' }}>
      <div style={{ textAlign: 'center', color: '#fff' }}>
        <div style={{ fontSize: 60 }}>🌽</div>
        <div style={{ marginTop: 16, fontSize: 15, color: '#a5d6a7' }}>Loading...</div>
      </div>
    </div>
  );

  if (!user) {
    return mode === 'register' ? <RegisterPage onSwitchMode={setMode} /> : <LoginPage onSwitchMode={setMode} />;
  }

  return user.role === 'admin' ? <AdminLayout /> : <FarmerLayout />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
      <ToastContainer />
    </AuthProvider>
  );
}
