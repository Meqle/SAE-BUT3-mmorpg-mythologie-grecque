// briques d'interface communes aux onglets du lobby
import { CSSProperties, ReactNode } from 'react';
import { RealmType } from '@greek-myth/shared';

// cadre pixel art d'un onglet
export function Panel({ title, icon, children }: { title?: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <div style={{
      background: 'rgba(20, 28, 43, 0.95)',
      border: '3px solid #241812',
      boxShadow: 'inset 2px 2px 0 #4a5c78, inset -2px -2px 0 #0f1622, 0 6px 0 rgba(0,0,0,0.6)',
      padding: '22px 26px',
      borderRadius: 4
    }}>
      {title && (
        <div style={{ fontSize: 14, color: '#facc15', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 'bold' }}>
          {icon} {title}
        </div>
      )}
      {children}
    </div>
  );
}

// petite case sombre utilisee dans plusieurs onglets
export const box: CSSProperties = {
  background: '#0e1522',
  border: '2px solid #28374e',
  borderRadius: 4,
  padding: '10px 14px'
};

export const realmColor: Record<RealmType, string> = {
  olympus: '#facc15',
  elysium: '#2dd4bf',
  tartarus: '#ef4444'
};
