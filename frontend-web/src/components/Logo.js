import React from 'react';

export default function Logo({ size = 96, onClick }) {
  return (
    <img
      src="/logo.png"
      alt="Crop Advisory Logo"
      onClick={onClick}
      onKeyDown={(event) => {
        if (!onClick) return;
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick(event);
        }
      }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        cursor: onClick ? 'pointer' : 'default',
        display: 'block',
        borderRadius: 0,
        background: 'transparent',
      }}
    />
  );
}
