import React from 'react'
import backgrounds from './backgrounds.json'

const TYPE_LABELS = { image: 'Photos', solid: 'Solids', gradient: 'Gradients' }
const TYPE_ORDER  = ['image', 'solid', 'gradient']

export default function BackgroundPicker({ value, onChange, theme = 'Dark' }) {
  const themeKey = theme === 'Dark' ? 'dark' : 'light'
  const visible  = backgrounds.filter(b => b.theme === themeKey)

  const groups = TYPE_ORDER
    .map(type => ({ type, label: TYPE_LABELS[type], items: visible.filter(b => b.type === type) }))
    .filter(g => g.items.length > 0)

  function previewStyle(bg) {
    if (bg.type === 'image')    return { backgroundImage: `url("${bg.path}")`, backgroundSize: 'cover', backgroundPosition: 'center' }
    if (bg.type === 'solid')    return { background: bg.color }
    if (bg.type === 'gradient') return { backgroundImage: bg.value }
    return {}
  }

  return (
    <div>
      {groups.map(group => (
        <div key={group.type} style={{ marginBottom: 14 }}>
          <p style={{ fontSize: 9, fontWeight: 700, color: '#9BA3BF', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 6px', fontFamily: "'Sora', sans-serif" }}>
            {group.label}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {group.items.map(bg => (
              <button
                key={bg.id}
                type="button"
                onClick={() => onChange(bg.id)}
                style={{
                  border: value === bg.id ? '2px solid #000066' : '2px solid #DDE3F0',
                  borderRadius: 8, overflow: 'hidden', cursor: 'pointer',
                  padding: 0, background: 'none', transition: 'border-color 0.15s',
                }}
              >
                <div style={{ height: 40, ...previewStyle(bg) }} />
                <div style={{
                  padding: '3px 6px',
                  background: value === bg.id ? '#F0F0FF' : '#fff',
                  borderTop: '1px solid #DDE3F0',
                }}>
                  <p style={{ fontSize: 9, fontWeight: 600, color: '#000066', margin: 0, fontFamily: "'Sora', sans-serif", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {bg.name}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
