'use client';

import { useEffect, useState } from 'react';

interface LaserPointerProps {
  enabled: boolean;
}

export function LaserPointer({ enabled }: LaserPointerProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled) return;

    const handleMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      className="pointer-events-none fixed z-50"
      style={{
        left: position.x - 8,
        top: position.y - 8,
        width: 16,
        height: 16,
        borderRadius: '50%',
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        boxShadow: '0 0 12px rgba(239, 68, 68, 0.6)',
      }}
    />
  );
}
