import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from './components/UI';
import Logo from './components/Logo';
import FarmersPage from './pages/FarmersPage';
import AdvisoriesPage from './pages/AdvisoriesPage';
import DiseasesPage from './pages/DiseasesPage';
import NotificationsPage from './pages/NotificationsPage';
import RegisterPage from './pages/RegisterPage';
import FarmerDashboardPage from './pages/FarmerDashboardPage';
import FarmerAdvisoriesPage from './pages/FarmerAdvisoriesPage';
import FarmerDiseasePage from './pages/FarmerDiseasePage';
import FarmerRecordsPage from './pages/FarmerRecordsPage';
import FarmerNotificationsPage from './pages/FarmerNotificationsPage';
import FarmerKnowledgePage from './pages/FarmerKnowledgePage';
import { ReportsPage, KnowledgePage } from './pages/ReportsKnowledgePages';

const featureCards = [
  {
    title: 'Disease Identifier',
    body: 'Rapid symptom matching for maize, beans, and tomatoes with confidence scoring.',
    icon: '🔍',
    accent: '#4ade80',
    highlight: 'Maize Streak Virus · 75% match',
  },
  {
    title: 'Seasonal Advices',
    body: 'Keep every planting, spraying, and harvest activity aligned with the current season.',
    icon: '📋',
    accent: '#c8a96e',
    highlight: 'Top dressing due in 3 days',
  },
  {
    title: 'Farm Records',
    body: 'Capture planting, fertilizer, pesticide, and harvest history in one place.',
    icon: '📝',
    accent: '#60a5fa',
    highlight: '7 records logged this week',
  },
];

const steps = [
  { title: 'Register', body: 'Create account details and farm information for each farmer.', icon: '📲' },
  { title: 'Get Advice', body: 'Receive a season calendar tailored to Agro-Ecological Region III.', icon: '📋' },
  { title: 'Get Reminded', body: 'Push alerts keep everyone aligned before each critical field task.', icon: '🔔' },
];

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

  const seasonalItems = [
    'Land preparation · Oct 2024',
    'Planting window · Nov 2024',
    'First weeding · Dec 2024',
    'Top dressing · Jan 2025',
    'Fall armyworm check · Midlands',
  ];

  const featureCards = [
    {
      title: 'Disease Identifier',
      body: 'Rapid symptom matching for maize, beans, and tomatoes with confidence scoring.',
      icon: '🔍',
      accent: '#4ade80',
      highlight: 'Maize Streak Virus · 75% match',
    },
    {
      title: 'Seasonal Advices',
      body: 'Keep every planting, spraying, and harvest activity aligned with the current season.',
      icon: '📋',
      accent: '#c8a96e',
      highlight: 'Top dressing due in 3 days',
    },
    {
      title: 'Farm Records',
      body: 'Capture planting, fertilizer, pesticide, and harvest history in one place.',
      icon: '📝',
      accent: '#60a5fa',
      highlight: '7 records logged this week',
    },
  ];

  const steps = [
    { title: 'Register', body: 'Create account details and farm information for each farmer.', icon: '📲' },
    { title: 'Get Advice', body: 'Receive a season calendar tailored to Agro-Ecological Region III.', icon: '📋' },
    { title: 'Get Reminded', body: 'Push notifications keep everyone aligned before each critical field task.', icon: '🔔' },
  ];

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <section style={{ background: 'linear-gradient(135deg, #07120a 0%, #102414 55%, #1b3a1f 100%)', borderRadius: 28, padding: '32px 32px 28px', border: '1px solid #24462f', color: '#f4fce8', boxShadow: '0 18px 42px rgba(0,0,0,0.16)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at top right, rgba(74, 222, 128, 0.22), transparent 38%)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <Logo size={100} />
              <div>
                <div style={{ fontSize: 12, color: '#8ee4a4', letterSpacing: 1.2, textTransform: 'uppercase', fontWeight: 700 }}>{greeting}, {user?.fullName || 'Agric Team'}</div>
                <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>Seasonal crop advisory hub</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {['🟢 Live system', '📱 Firebase active', '🌽 Main season 2024/25'].map((item) => (
                <span key={item} style={{ background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 999, padding: '7px 12px', fontSize: 12, color: '#d8f2db' }}>{item}</span>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.8fr', gap: 24, alignItems: 'center' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.25)', color: '#8ee4a4', borderRadius: 999, padding: '6px 10px', fontSize: 12, marginBottom: 16 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80' }} />
                Region III · Zimbabwe
              </div>
              <h2 style={{ fontSize: 34, lineHeight: 1.15, margin: '0 0 12px', fontWeight: 800 }}>Bring field updates, disease checks, and advisories together in one view.</h2>
              <p style={{ margin: 0, fontSize: 15, color: '#b8d9ba', maxWidth: 620, lineHeight: 1.7 }}>The new dashboard blends planning, farmer support, and agronomic guidance so your team can move from alerts to action quickly.</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 18 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
                {[
                  { label: 'Advisories', value: '6' },
                  { label: 'Diseases', value: '9' },
                  { label: 'Farmers', value: '128' },
                  { label: 'Alerts', value: '24/7' },
                ].map((stat) => (
                  <div key={stat.label} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: '14px 12px' }}>
                    <div style={{ fontSize: 22, fontWeight: 800 }}>{stat.value}</div>
                    <div style={{ fontSize: 12, color: '#9ad1a2', marginTop: 4 }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ background: '#0f231a', borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 10px 24px rgba(0,0,0,0.16)', padding: '16px 18px' }}>
        <div style={{ display: 'flex', overflowX: 'auto', gap: 10, paddingBottom: 4 }}>
          {seasonalItems.map((item) => (
            <span key={item} style={{ background: '#122916', color: '#9fbfa8', border: '1px solid rgba(74,222,128,0.18)', borderRadius: 999, padding: '8px 12px', fontSize: 12, whiteSpace: 'nowrap', fontWeight: 600 }}>{item}</span>
          ))}
        </div>
      </section>

      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h3 style={{ margin: 0, color: '#e6f6ea', fontSize: 16 }}>Quick access</h3>
          <span style={{ fontSize: 12, color: '#9fbfa8' }}>Jump straight into the tools your team uses most</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {quickStats.map((s) => (
            <QuickCard key={s.page} {...s} />
          ))}
        </div>
      </section>

      <section style={{ display: 'grid', gap: 18 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 18, alignItems: 'stretch' }}>
          <div style={{ background: '#0f231a', borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 10px 24px rgba(0,0,0,0.16)', padding: 20 }}>
            <div style={{ fontSize: 12, color: '#4ade80', fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 }}>How it works</div>
            <div style={{ display: 'grid', gap: 12 }}>
              {steps.map((step, index) => (
                <div key={step.title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 0', borderBottom: index < steps.length - 1 ? '1px solid #edf4ec' : 'none' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: '#122916', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{step.icon}</div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#e6f6ea', marginBottom: 4 }}>{step.title}</div>
                    <div style={{ fontSize: 13, color: '#9fbfa8', lineHeight: 1.6 }}>{step.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#0f231a', borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)', padding: 20 }}>
            <div style={{ fontSize: 12, color: '#4ade80', fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 }}>This season</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#e6f6ea', marginBottom: 12 }}>Focus on the next critical window.</div>
            <div style={{ display: 'grid', gap: 10 }}>
              {[
                { label: 'Top dressing', detail: 'Apply fertilizer before the next rain' },
                { label: 'Field scouting', detail: 'Inspect maize and tomato plots for pests' },
                { label: 'Recordkeeping', detail: 'Log input use and farm activity updates' },
              ].map((item) => (
                <div key={item.label} style={{ background: '#122916', borderRadius: 14, border: '1px solid rgba(74,222,128,0.14)', padding: '12px 14px' }}>
                  <div style={{ fontWeight: 700, color: '#e6f6ea' }}>{item.label}</div>
                  <div style={{ fontSize: 13, color: '#9fbfa8', marginTop: 4 }}>{item.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {featureCards.map((feature) => (
            <div key={feature.title} style={{ background: '#0f231a', borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 10px 24px rgba(0,0,0,0.16)', padding: 20 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: `${feature.accent}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 12 }}>{feature.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#e6f6ea', marginBottom: 6 }}>{feature.title}</div>
              <div style={{ fontSize: 13, color: '#9fbfa8', lineHeight: 1.65 }}>{feature.body}</div>
              <div style={{ marginTop: 14, fontSize: 12, color: feature.accent, fontWeight: 700 }}>{feature.highlight}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function PublicHomepage({ onSignIn, onRegister, onHome }) {
  React.useEffect(() => {
    const els = document.querySelectorAll('.feature-card');
    els.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(12px)';
      el.style.transition = 'opacity 480ms ease, transform 480ms ease';
    });
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateY(0)';
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.pageYOffset - 84;
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#091009', color: '#e6f6ea', fontFamily: "'Inter', sans-serif" }}>
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, padding: '18px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(9,16,9,0.6)', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}><Logo size={80} onClick={onHome} /></div>
          <div style={{ fontWeight: 800, fontSize: 18, color: '#c8f7d0', cursor: 'pointer' }} onClick={onHome}>Crop Advisory</div>
        </div>
        <nav style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
          <a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }} style={{ color: '#9fbfa8', textDecoration: 'none' }}>Features</a>
          <a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollToSection('how-it-works'); }} style={{ color: '#9fbfa8', textDecoration: 'none' }}>How It Works</a>
          <a href="#diseases" onClick={(e) => { e.preventDefault(); scrollToSection('diseases'); }} style={{ color: '#9fbfa8', textDecoration: 'none' }}>Diseases</a>
          <a href="#region" onClick={(e) => { e.preventDefault(); scrollToSection('region'); }} style={{ color: '#9fbfa8', textDecoration: 'none' }}>Region III</a>
          <button onClick={() => onSignIn()} style={{ marginLeft: 12, padding: '8px 14px', borderRadius: 8, background: 'transparent', color: '#e6f6ea', border: '1px solid rgba(255,255,255,0.06)' }}>Sign In</button>
          <button onClick={() => onRegister()} style={{ marginLeft: 8, padding: '8px 14px', borderRadius: 8, background: '#2be07a', color: '#04220b', border: 'none', fontWeight: 800 }}>Sign Up</button>
        </nav>
      </header>

      <main style={{ paddingTop: 120 }}>
        <section style={{ minHeight: '78vh', display: 'flex', alignItems: 'center', padding: '40px 28px', backgroundImage: 'linear-gradient(180deg, rgba(0,0,0,0.1), rgba(0,0,0,0.0))' }}>
          <div style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gap: 48, alignItems: 'center' }}>
            <div>
              <div style={{ color: '#6fe89a', fontFamily: "'Syne Mono', monospace", letterSpacing: '.12em', fontSize: 12, marginBottom: 12, textAlign: 'left' }}>START THIS SEASON</div>
              <h1 style={{ fontSize: 120, lineHeight: 0.9, margin: 0, fontFamily: "'Syne', sans-serif", fontWeight: 900, textAlign: 'left' }}>Farm<br/><span style={{ color: '#2be07a', textDecoration: 'underline 6px rgba(43,224,122,0.25)', textDecorationSkipInk: 'none' }}>smarter</span><br/>this season.</h1>
              <p style={{ marginTop: 22, color: '#94bfa3', maxWidth: 680, fontSize: 16, lineHeight: 1.7 }}>Seasonal advisories, symptom-based disease identification, and farm records — built for small-scale farmers in Zimbabwe's Agro-Ecological Region III.</p>
              <div style={{ marginTop: 28, display: 'flex', justifyContent: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                <button onClick={() => onRegister()} style={{ background: '#2be07a', color: '#04220b', padding: '14px 26px', borderRadius: 12, fontWeight: 800, fontSize: 15 }}>✍️ Sign Up</button>
                <button onClick={() => onRegister()} style={{ background: 'transparent', color: '#e6f6ea', padding: '14px 26px', borderRadius: 12, fontWeight: 800, fontSize: 15, border: '1px solid rgba(255,255,255,0.12)' }}>📱 Download Free App</button>
              </div>
            </div>
          </div>
        </section>

        <section id="features" style={{ padding: '60px 28px', borderTop: '1px solid rgba(255,255,255,0.02)' }}>
          <div style={{ maxWidth: 1180, margin: '0 auto' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
              <div style={{ minWidth: 260 }}>
                <div style={{ color: '#6fe89a', fontFamily: "'Syne Mono', monospace", letterSpacing: '.16em', fontSize: 12, marginBottom: 12 }}>FEATURES</div>
                <h2 style={{ fontSize: 56, lineHeight: 1.05, margin: 0, fontFamily: "'Syne', sans-serif", fontWeight: 900 }}>Everything you need to manage advisory, disease, and farm records.</h2>
              </div>
              <p style={{ color: '#9fbfa8', maxWidth: 500, margin: 0, lineHeight: 1.8 }}>Crop Advisory gives your team the tools to diagnose crops, deliver seasonal advisories, and keep farmer records in one polished, easy-to-use dashboard.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
              {featureCards.map((feature) => (
                <div key={feature.title} className="feature-card" style={{ background: '#0f231a', borderRadius: 24, padding: 24, border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 16, background: `${feature.accent}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 16 }}>{feature.icon}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#e6f6ea', marginBottom: 10 }}>{feature.title}</div>
                  <div style={{ color: '#9fbfa8', fontSize: 14, lineHeight: 1.8 }}>{feature.body}</div>
                  <div style={{ marginTop: 18, fontSize: 12, color: feature.accent, fontWeight: 700 }}>{feature.highlight}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="diseases" style={{ padding: '60px 28px', borderTop: '1px solid rgba(255,255,255,0.02)' }}>
          <div style={{ maxWidth: 1180, margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 24, alignItems: 'start', marginBottom: 32 }}>
              <div>
                <div style={{ color: '#6fe89a', fontFamily: "'Syne Mono', monospace", letterSpacing: '.16em', fontSize: 12, marginBottom: 12 }}>DISEASE DATABASE</div>
                <h2 style={{ fontSize: 64, lineHeight: 0.95, margin: 0, fontFamily: "'Syne', sans-serif", fontWeight: 900 }}>Know your enemy before it spreads.</h2>
              </div>
              <p style={{ color: '#9fbfa8', maxWidth: 460, margin: 0, lineHeight: 1.85 }}>9 diseases across Maize, Tomato, and Beans — matched by symptom, not guesswork. The disease library is built to help your team identify issues fast and act with confidence.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
              {[
                { crop: 'Maize', title: 'Maize Streak Virus', body: 'Transmitted by leafhoppers. Causes yellow streaking and severe stunting. No chemical cure — early detection is critical.', tags: ['Yellow leaf streaks', 'Stunted growth', 'Small plant size'], color: '#4ade80' },
                { crop: 'Tomato', title: 'Late Blight', body: 'Caused by Phytophthora infestans. Can destroy an entire crop within days in cool, wet conditions. Act immediately.', tags: ['Water-soaked spots', 'White mould', 'Rapid plant death'], color: '#f43f5e' },
                { crop: 'Beans', title: 'Angular Leaf Spot', body: 'Fungal disease common in wet seasons. Angular brown spots limited by leaf veins. Managed with crop rotation and copper fungicides.', tags: ['Angular brown spots', 'Bounded by veins', 'Defoliation'], color: '#f59e0b' },
                { crop: 'Maize', title: 'Grey Leaf Spot', body: 'Fungal disease spread by wind and rain. Rectangular grey lesions reduce photosynthesis and cause early leaf death.', tags: ['Grey rectangular spots', 'Yellow halo', 'Leaf blight'], color: '#4ade80' },
                { crop: 'Tomato', title: 'Bacterial Wilt', body: 'Soil-borne bacterium that enters through roots. Whole plant wilts suddenly while still green. No chemical treatment.', tags: ['Sudden wilting', 'Brown stem inside', 'Slimy ooze'], color: '#f43f5e' },
                { crop: 'Beans', title: 'Bean Rust', body: 'Caused by Uromyces appendiculatus. Reddish-brown pustules on leaf undersides lead to premature leaf drop and yield loss.', tags: ['Rust pustules', 'Yellow leaves', 'Leaf drop'], color: '#f59e0b' },
              ].map((item) => (
                <div key={item.title} className="feature-card" style={{ background: '#0f231a', borderRadius: 24, padding: 26, border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#9ef0b3', letterSpacing: 1.2, textTransform: 'uppercase' }}>{item.crop}</div>
                    <div style={{ width: 16, height: 16, borderRadius: 999, background: item.color + '22' }} />
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#e6f6ea', marginBottom: 12 }}>{item.title}</div>
                  <div style={{ color: '#9fbfa8', fontSize: 14, lineHeight: 1.8, marginBottom: 18 }}>{item.body}</div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
                    {item.tags.map((tag) => (
                      <div key={tag} style={{ background: '#112d1d', color: '#9ef0b3', borderRadius: 999, padding: '7px 12px', fontSize: 11 }}>{tag}</div>
                    ))}
                  </div>
                  <div style={{ height: 4, width: '100%', borderRadius: 999, background: '#122916' }}>
                    <div style={{ width: item.crop === 'Maize' ? '76%' : item.crop === 'Tomato' ? '68%' : '64%', height: '100%', borderRadius: 999, background: item.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" style={{ padding: '60px 28px', borderTop: '1px solid rgba(255,255,255,0.02)' }}>
          <div style={{ maxWidth: 1180, margin: '0 auto' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
              <div style={{ minWidth: 260 }}>
                <div style={{ color: '#6fe89a', fontFamily: "'Syne Mono', monospace", letterSpacing: '.16em', fontSize: 12, marginBottom: 12 }}>HOW IT WORKS</div>
                <h2 style={{ fontSize: 56, lineHeight: 1.05, margin: 0, fontFamily: "'Syne', sans-serif", fontWeight: 900 }}>A simple workflow for farm planning and diagnosis.</h2>
              </div>
              <p style={{ color: '#9fbfa8', maxWidth: 500, margin: 0, lineHeight: 1.8 }}>Register once, receive tailored advisories, then diagnose crop health with symptom-driven disease matching and record every farm activity.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18 }}>
              {steps.map((step) => (
                <div key={step.title} className="feature-card" style={{ background: '#0f231a', borderRadius: 24, padding: 26, border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#6fe89a', letterSpacing: 1.2, marginBottom: 14 }}>{step.title}</div>
                  <div style={{ width: 54, height: 54, borderRadius: 18, background: '#123824', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 16 }}>{step.icon}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#e6f6ea', marginBottom: 10 }}>{step.title}</div>
                  <div style={{ color: '#9fbfa8', fontSize: 14, lineHeight: 1.75 }}>{step.body}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="region" style={{ padding: '60px 28px', borderTop: '1px solid rgba(255,255,255,0.02)' }}>
          <div style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 18, alignItems: 'center' }}>
            <div style={{ background: '#0f231a', borderRadius: 24, padding: 28, border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ height: 330, borderRadius: 22, background: 'radial-gradient(circle at top left, rgba(122, 238, 148, 0.12), transparent 36%), radial-gradient(circle at bottom right, rgba(39, 170, 82, 0.14), transparent 28%), linear-gradient(180deg, rgba(13, 28, 18, 1) 0%, rgba(10, 24, 14, 1) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9fbfa8', fontSize: 12, position: 'relative' }}>
                <div style={{ width: '92%', height: '90%', borderRadius: 22, border: '1px dashed rgba(74, 222, 128, 0.35)', position: 'relative', padding: 26, display: 'grid', placeItems: 'center' }}>
                  <div style={{ color: '#6fe89a', fontFamily: "'Syne Mono', monospace", letterSpacing: '.18em', fontSize: 11, marginBottom: 16 }}>REGION III</div>
                  <div style={{ width: 140, height: 120, borderRadius: 20, border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 90, height: 90, borderRadius: '50%', border: '1px solid rgba(74, 222, 128, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#9fbfa8' }}>MAP</div>
                  </div>
                  <div style={{ position: 'absolute', bottom: 18, left: 24, fontSize: 11, color: '#6b8f70' }}>Zimbabwe · Agro-Ecological Region III</div>
                </div>
              </div>
            </div>
            <div>
              <div style={{ color: '#6fe89a', fontFamily: "'Syne Mono', monospace", letterSpacing: '.16em', fontSize: 12, marginBottom: 12 }}>BUILT FOR REGION III</div>
              <h3 style={{ fontSize: 56, lineHeight: 0.92, margin: 0, fontFamily: "'Syne', sans-serif", fontWeight: 900 }}>Designed around your land, your rain, your season.</h3>
              <p style={{ color: '#9fbfa8', marginTop: 18, maxWidth: 520, lineHeight: 1.8, fontSize: 15 }}>Agro-Ecological Region III receives 500–750mm of rainfall per season, making timing everything. Crop Advisory is calibrated to this region's soil types, rainfall patterns, and crop calendar — not a generic farming app repurposed for Zimbabwe.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16, marginTop: 24 }}>
                {[
                  { value: '500mm', label: 'Minimum annual rainfall' },
                  { value: 'Nov-Apr', label: 'Main cropping season' },
                  { value: '3', label: 'Main crops covered' },
                  { value: 'Free', label: 'Always, for farmers' },
                ].map((item) => (
                  <div key={item.value} style={{ background: '#0f231a', borderRadius: 18, padding: 20, border: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ fontSize: 32, fontWeight: 900, color: '#6fe89a', marginBottom: 8 }}>{item.value}</div>
                    <div style={{ color: '#9fbfa8', fontSize: 13 }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function QuickCard({ icon, label, desc, page, color }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={() => typeof window !== 'undefined' && window._setPage && window._setPage(page)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ background: '#0f231a', borderRadius: 16, padding: 20, cursor: 'pointer', transition: 'all 0.15s', boxShadow: hover ? `0 10px 28px ${color}22` : '0 6px 18px rgba(0,0,0,0.08)', border: '1px solid rgba(255,255,255,0.08)', borderTop: `3px solid ${color}`, transform: hover ? 'translateY(-2px)' : 'none' }}>
      <div style={{ fontSize: 28, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#e6f6ea', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 12, color: '#9fbfa8', lineHeight: 1.5 }}>{desc}</div>
    </div>
  );
}

function LoginPage({ onSwitchMode, onHome }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#091009', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
      <div style={{ background: '#0f231a', borderRadius: 28, padding: '42px 36px', width: '100%', maxWidth: 460, boxShadow: '0 30px 80px rgba(0,0,0,0.35)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, marginBottom: 30 }}>
          <Logo size={220} onClick={onHome} />
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ margin: '0 0 8px', fontSize: 26, fontWeight: 800, color: '#e6f6ea' }}>Crop Advisory</h1>
          </div>
        </div>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#555', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '14px 16px', border: '1px solid #2f4d3c', borderRadius: 14, fontSize: 14, outline: 'none', boxSizing: 'border-box', background: '#122916', color: '#e6f6ea' }} placeholder="admin@cropadvisory.zw" autoComplete="email" />
          </div>
          <div style={{ marginBottom: 22 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#555', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '14px 16px', border: '1px solid #2f4d3c', borderRadius: 14, fontSize: 14, outline: 'none', boxSizing: 'border-box', background: '#122916', color: '#e6f6ea' }} placeholder="••••••••" autoComplete="current-password" />
          </div>

          {error && <div style={{ background: '#ffebee', color: '#b71c1c', padding: '12px 14px', borderRadius: 12, fontSize: 13, marginBottom: 18, lineHeight: 1.5 }}>⚠️ {error}</div>}

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px 16px', background: '#2e7d32', color: '#fff', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.75 : 1 }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <button type="button" onClick={() => onSwitchMode('register')} style={{ marginTop: 24, display: 'block', width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, color: '#e6f6ea', cursor: 'pointer', fontWeight: 700, padding: '12px 16px' }}>Register as a farmer</button>
      </div>
    </div>
  );
}

const NAV = [
  { id: 'dashboard', icon: '📊', label: 'Dashboard' },
  { id: 'farmers', icon: '👨‍🌾', label: 'Farmers' },
  { id: 'advisories', icon: '📋', label: 'Advisories' },
  { id: 'diseases', icon: '🦠', label: 'Diseases' },
  { id: 'notifications', icon: '🔔', label: 'Notifications' },
  { id: 'reports', icon: '📈', label: 'Reports' },
  { id: 'knowledge', icon: '📚', label: 'Knowledge Base' },
];

const PAGE_TITLES = { dashboard: 'Dashboard', farmers: 'Farmer Management', advisories: 'Seasonal Advisories', diseases: 'Disease Database', notifications: 'Notifications', reports: 'Reports & Analytics', knowledge: 'Knowledge Base' };

function AdminLayout() {
  const { user, logout } = useAuth();
  const [page, setPage] = useState('dashboard');

  window._setPage = setPage;

  const pages = { dashboard: <DashboardPage />, farmers: <FarmersPage />, advisories: <AdvisoriesPage />, diseases: <DiseasesPage />, notifications: <NotificationsPage />, reports: <ReportsPage />, knowledge: <KnowledgePage /> };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'Segoe UI', system-ui, sans-serif", color: '#e6f6ea', background: '#091009' }}>
      <aside style={{ width: 236, background: '#091009', color: '#fff', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Logo size={100} onClick={() => setPage('dashboard')} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, lineHeight: 1.2 }}>Crop Advisory</div>
              <div style={{ fontSize: 10, color: '#81c784', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>Admin Dashboard</div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '10px 0' }}>
          {NAV.map((n) => (
            <div key={n.id} onClick={() => setPage(n.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', cursor: 'pointer', fontSize: 13, color: page === n.id ? '#fff' : '#c8e6c9', borderLeft: `3px solid ${page === n.id ? '#69f0ae' : 'transparent'}`, background: page === n.id ? 'rgba(255,255,255,0.12)' : 'transparent', fontWeight: page === n.id ? 700 : 400, transition: 'all 0.15s' }}>
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

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#091009' }}>
        <div style={{ background: '#0f231a', padding: '14px 28px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#e6f6ea' }}>{PAGE_TITLES[page]}</h1>
          <div style={{ display: 'flex', gap: 10 }}>
            {['Region III', 'Main Season 2024/25'].map((b) => (
              <span key={b} style={{ background: 'rgba(255,255,255,0.08)', color: '#9fbfa8', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20 }}>{b}</span>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 28, background: '#091009' }}>
          {pages[page] || <DashboardPage />}
        </div>
      </div>
    </div>
  );
}

function FarmerLayout() {
  const { user, logout } = useAuth();
  const [page, setPage] = useState('dashboard');

  const pages = {
    dashboard: <FarmerDashboardPage onNavigate={setPage} />,
    advisories: <FarmerAdvisoriesPage />,
    disease: <FarmerDiseasePage />,
    records: <FarmerRecordsPage />,
    notifications: <FarmerNotificationsPage />,
    knowledge: <FarmerKnowledgePage />,
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Segoe UI', system-ui, sans-serif", color: '#e6f6ea', background: '#091009' }}>
      <aside style={{ width: 260, background: '#091009', color: '#fff', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.10)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Logo size={100} onClick={() => setPage('dashboard')} />
            <div>
              <div style={{ fontSize: 16, fontWeight: 800 }}>Crop Advisory</div>
              <div style={{ fontSize: 11, color: '#81c784', marginTop: 6, textTransform: 'uppercase', letterSpacing: 0.4 }}>Farmer Portal</div>
            </div>
          </div>
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
            <div key={item.id} onClick={() => setPage(item.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', cursor: 'pointer', color: page === item.id ? '#fff' : '#c8e6c9', background: page === item.id ? 'rgba(255,255,255,0.12)' : 'transparent', borderLeft: `4px solid ${page === item.id ? '#69f0ae' : 'transparent'}`, fontWeight: page === item.id ? 700 : 500, transition: 'all 0.15s' }}>
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
        <div style={{ background: '#0f231a', padding: '18px 26px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#e6f6ea' }}>{page === 'dashboard' ? 'Dashboard' : page === 'advisories' ? 'Advisories' : page === 'disease' ? 'Disease Identifier' : page === 'records' ? 'Farm Records' : page === 'notifications' ? 'Notifications' : 'Knowledge Base'}</h1>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#9fbfa8' }}>Region III</span>
            <span style={{ fontSize: 12, color: '#9fbfa8' }}>Main Season 2024/25</span>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 28, background: '#091009' }}>
          {pages[page]}
        </div>
      </div>
    </div>
  );
}

function AppInner() {
  const { user, loading } = useAuth();
  const [mode, setMode] = useState('home');

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#091009', color: '#e6f6ea' }}>
        <div style={{ textAlign: 'center' }}>
          <Logo size={160} />
          <div style={{ marginTop: 16, fontSize: 15, color: '#a5d6a7' }}>Loading Crop Advisory...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    if (mode === 'register') return <RegisterPage onSwitchMode={setMode} onHome={() => setMode('home')} />;
    if (mode === 'login') return <LoginPage onSwitchMode={setMode} onHome={() => setMode('home')} />;
    return <PublicHomepage onSignIn={() => setMode('login')} onRegister={() => setMode('register')} onHome={() => setMode('home')} />;
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
