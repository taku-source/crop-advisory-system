import React from 'react';

export default function Logo({ size = 78 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: size / 2, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 14px 40px rgba(0,0,0,0.12)', overflow: 'hidden' }}>
      <img src="/logo.png" alt="Crop Advisory Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
    </div>
  );
}
