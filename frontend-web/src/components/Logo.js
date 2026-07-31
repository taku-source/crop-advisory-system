import React from 'react';

export default function Logo({ size = 96 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: size / 2, background: '#0f231a', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 14px 40px rgba(0,0,0,0.25)', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)' }}>
      <img src="/logo.png" alt="Crop Advisory Logo" style={{ width: '90%', height: '90%', objectFit: 'contain' }} />
    </div>
  );
}
