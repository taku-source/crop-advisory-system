import React, { useState } from 'react';
import LoginPage      from './pages/LoginPage.jsx';
import DashboardPage  from './pages/DashboardPage.jsx';
import FarmersPage    from './pages/FarmersPage.jsx';
import { KnowledgePage, DiseasePage, SoilPage } from './pages/KnowledgePages.jsx';
import { RulesPage, NotificationsPage, ReportsPage } from './pages/ManagementPages.jsx';
import AdminLayout    from './components/AdminLayout.jsx';
import { Toast }      from './components/UI.jsx';

const PAGE_TITLES = {
  dashboard: 'Dashboard Overview',
  farmers:   'Farmer Management',
  knowledge: 'Agricultural Knowledge',
  diseases:  'Disease Database',
  soil:      'Soil Knowledge',
  rules:     'Advisory Rules Engine',
  notifs:    'Notifications',
  reports:   'Reports',
};

export default function App() {
  const [user, setUser]   = useState(null);
  const [page, setPage]   = useState('dashboard');

  if (!user) return <><LoginPage onLogin={setUser} /><Toast /></>;

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <DashboardPage onNavigate={setPage} />;
      case 'farmers':   return <FarmersPage />;
      case 'knowledge': return <KnowledgePage />;
      case 'diseases':  return <DiseasePage />;
      case 'soil':      return <SoilPage />;
      case 'rules':     return <RulesPage />;
      case 'notifs':    return <NotificationsPage />;
      case 'reports':   return <ReportsPage />;
      default:          return <DashboardPage onNavigate={setPage} />;
    }
  };

  return (
    <>
      <AdminLayout
        page={page}
        onNavigate={setPage}
        user={user}
        title={PAGE_TITLES[page] || ''}
        actions={
          <button
            onClick={() => setUser(null)}
            style={{ fontSize:12, color:'#888', background:'none', border:'1px solid #e2ebe2', borderRadius:8, padding:'5px 12px', cursor:'pointer', fontFamily:'Inter,sans-serif' }}
          >
            Sign out
          </button>
        }
      >
        {renderPage()}
      </AdminLayout>
      <Toast />
    </>
  );
}
