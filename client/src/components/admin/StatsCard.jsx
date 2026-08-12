import Icon from '../common/Icon';

/**
 * A dashboard figure with its icon.
 *
 * `icon` is a name from the Icon registry ('group', 'news'), not a component.
 * It used to be a component and was destructured as `{ icon: Icon }`, which
 * shadowed the import added when the site moved to one icon library — the
 * rename made `<Icon>` refer to the prop rather than to the component, and the
 * card silently rendered nothing at all. Kept as a plain string for that reason:
 * there is nothing here left to shadow.
 */
export default function StatsCard({ icon, value, label, color = '#000066' }) {
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
        {icon && <Icon name={icon} size={26} />}
      </div>
      <div>
        <p
          style={{
            margin: 0,
            fontSize: 28,
            fontWeight: 700,
            color: '#000066',
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
