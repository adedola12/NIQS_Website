export default function StatsCard({ icon: Icon, value, label, color = '#0B1F4B' }) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 10,
        padding: '22px 24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        border: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flex: '1 1 220px',
        minWidth: 200,
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 10,
          background: `${color}15`,
          color: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {Icon && <Icon size={24} />}
      </div>
      <div>
        <p
          style={{
            margin: 0,
            fontSize: 28,
            fontWeight: 700,
            color: '#0B1F4B',
            lineHeight: 1.1,
          }}
        >
          {value ?? '--'}
        </p>
        <p style={{ margin: '2px 0 0', fontSize: 13, color: '#6b7280' }}>{label}</p>
      </div>
    </div>
  );
}
