import React, { useState, useEffect, useCallback } from 'react';
import { getUsers, suspendUser, activateUser } from '../api';
import { PageHeader, SearchBar, Table, Chip, Button, ConfirmDialog, toast, Modal, Field, Input, Select } from '../components/UI';

const DISTRICTS = ['Midlands', 'Mashonaland West', 'Mashonaland East', 'Mashonaland Central', 'Manicaland', 'Matabeleland North', 'Matabeleland South', 'Masvingo', 'Bulawayo', 'Harare'];

export default function FarmersPage() {
  const [farmers, setFarmers]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [confirm, setConfirm]   = useState(null);
  const [viewFarmer, setViewFarmer] = useState(null);

  const fetch = useCallback(async () => {
    try {
      const res = await getUsers({ role: 'farmer', search });
      setFarmers(res.data.users);
    } catch { toast.error('Failed to load farmers'); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { const t = setTimeout(fetch, 300); return () => clearTimeout(t); }, [fetch]);

  const handleToggle = async (farmer) => {
    try {
      if (farmer.isActive) {
        await suspendUser(farmer._id);
        toast.success('Account suspended');
      } else {
        await activateUser(farmer._id);
        toast.success('Account activated');
      }
      fetch();
    } catch { toast.error('Action failed'); }
    finally { setConfirm(null); }
  };

  const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const columns = [
    {
      label: 'Farmer',
      render: (f) => (
        <div>
          <div style={{ fontWeight: 700 }}>{f.fullName}</div>
          <div style={{ fontSize: 11, color: '#9fbfa8' }}>{f.email}</div>
        </div>
      ),
    },
    { label: 'Phone', render: (f) => f.phone },
    {
      label: 'Location',
      render: (f) => (
        <div>
          <div>{f.district}</div>
          <div style={{ fontSize: 11, color: '#9fbfa8' }}>{f.ward}</div>
        </div>
      ),
    },
    {
      label: 'Farm',
      render: (f) => (
        <div>
          <div>{f.farmName || '—'}</div>
          <div style={{ fontSize: 11, color: '#9fbfa8' }}>{f.farmSize || '—'}</div>
        </div>
      ),
    },
    { label: 'Status', render: (f) => <Chip color={f.isActive ? 'green' : 'red'}>{f.isActive ? 'Active' : 'Suspended'}</Chip> },
    { label: 'Joined', render: (f) => <span style={{ fontSize: 12, color: '#9fbfa8' }}>{fmt(f.createdAt)}</span> },
    {
      label: 'Actions',
      render: (f) => (
        <div style={{ display: 'flex', gap: 6 }}>
          <Button size="sm" variant="secondary" onClick={() => setViewFarmer(f)}>View</Button>
          <Button size="sm" variant={f.isActive ? 'danger' : 'primary'}
            onClick={() => setConfirm({ farmer: f })}>
            {f.isActive ? 'Suspend' : 'Activate'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={`Farmers (${farmers.length})`}
        action={<SearchBar value={search} onChange={setSearch} placeholder="Search name, email, district..." />}
      />

      {loading ? <div style={{ textAlign: 'center', padding: 40, color: '#9fbfa8' }}>Loading...</div> : (
        <Table columns={columns} rows={farmers} empty="No farmers found" />
      )}

      {/* View farmer detail */}
      {viewFarmer && (
        <Modal title={`👨‍🌾 ${viewFarmer.fullName}`} onClose={() => setViewFarmer(null)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, fontSize: 13 }}>
            {[
              ['Email', viewFarmer.email],
              ['Phone', viewFarmer.phone],
              ['District', viewFarmer.district],
              ['Ward', viewFarmer.ward],
              ['Farm Name', viewFarmer.farmName || '—'],
              ['Farm Size', viewFarmer.farmSize || '—'],
              ['Status', viewFarmer.isActive ? '✅ Active' : '🚫 Suspended'],
              ['Joined', new Date(viewFarmer.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })],
            ].map(([k, v]) => (
              <div key={k} style={{ background: '#0f231a', borderRadius: 8, padding: 10, border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: 10, color: '#9fbfa8', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 3 }}>{k}</div>
                <div style={{ fontWeight: 600, color: '#e6f6ea' }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <Button variant="ghost" onClick={() => setViewFarmer(null)}>Close</Button>
            <Button variant={viewFarmer.isActive ? 'danger' : 'primary'}
              onClick={() => { setViewFarmer(null); setConfirm({ farmer: viewFarmer }); }}>
              {viewFarmer.isActive ? 'Suspend Account' : 'Activate Account'}
            </Button>
          </div>
        </Modal>
      )}

      {/* Confirm dialog */}
      {confirm && (
        <ConfirmDialog
          message={`Are you sure you want to ${confirm.farmer.isActive ? 'suspend' : 'activate'} ${confirm.farmer.fullName}'s account?`}
          danger={confirm.farmer.isActive}
          onConfirm={() => handleToggle(confirm.farmer)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
