import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import API from '../../api/axios';
import AdminHeader from '../../components/admin/AdminHeader';

const ALL_TIERS = [
  { value: 'platinum',  label: 'Platinum',  color: '#C9974A' },
  { value: 'gold',      label: 'Gold',      color: '#D9AB60' },
  { value: 'silver',    label: 'Silver',    color: '#9CA3AF' },
  { value: 'bronze',    label: 'Bronze',    color: '#B07556' },
  { value: 'associate', label: 'Associate', color: '#6B7280' },
];

const DEFAULT = {
  enabled: false,
  tiers: ['platinum', 'gold'],
  rotationMs: 25000,
  dismissible: true,
  label: 'Featured Partner',
};

export default function ManagePartnerAdvert() {
  const [form, setForm] = useState(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [eligibleCount, setEligibleCount] = useState(0);

  useEffect(() => {
    Promise.all([
      API.get('/site-settings').catch(() => ({ data: {} })),
      API.get('/partners').catch(() => ({ data: [] })),
    ]).then(([s, p]) => {
      const ad = s.data?.partnerAd || {};
      setForm({
        enabled:     ad.enabled ?? DEFAULT.enabled,
        tiers:       Array.isArray(ad.tiers) && ad.tiers.length ? ad.tiers : DEFAULT.tiers,
        rotationMs:  ad.rotationMs ?? DEFAULT.rotationMs,
        dismissible: ad.dismissible ?? DEFAULT.dismissible,
        label:       ad.label || DEFAULT.label,
      });
      const all = p.data?.partners || p.data || [];
      const tierSet = new Set(Array.isArray(ad.tiers) && ad.tiers.length ? ad.tiers : DEFAULT.tiers);
      setEligibleCount((Array.isArray(all) ? all : []).filter(x => x.isActive !== false && tierSet.has(x.tier)).length);
    }).finally(() => setLoading(false));
  }, []);

  /* Recompute eligible count whenever tiers change. */
  useEffect(() => {
    if (loading) return;
    API.get('/partners').then(p => {
      const all = p.data?.partners || p.data || [];
      const tierSet = new Set(form.tiers);
      setEligibleCount((Array.isArray(all) ? all : []).filter(x => x.isActive !== false && tierSet.has(x.tier)).length);
    }).catch(() => {});
  }, [form.tiers, loading]);

  const toggleTier = (tier) => {
    setForm(prev => ({
      ...prev,
      tiers: prev.tiers.includes(tier)
        ? prev.tiers.filter(t => t !== tier)
        : [...prev.tiers, tier],
    }));
  };

  const handleSave = async () => {
    if (form.tiers.length === 0) {
      toast.error('Pick at least one partner tier.');
      return;
    }
    setSaving(true);
    try {
      await API.put('/site-settings/partner-ad', {
        enabled:     form.enabled,
        tiers:       form.tiers,
        rotationMs:  Math.max(5000, Number(form.rotationMs) || 25000),
        dismissible: form.dismissible,
        label:       (form.label || '').trim().slice(0, 60) || 'Featured Partner',
      });
      toast.success('Partner advert settings saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-txt-3)' }}>Loading…</div>
  );

  return (
    <div>
      <AdminHeader
        title="Partner Advert"
        breadcrumbs={['Site', 'Partner Advert']}
      />

      <div style={{ maxWidth: 760, margin: '1.5rem auto', padding: '0 1.5rem' }}>
        <div style={{
          background: '#fff', borderRadius: 14, border: '1px solid var(--color-bdr)',
          padding: '2rem 2.2rem',
        }}>
          <p style={{ fontSize: '.82rem', color: 'var(--color-txt-2)', lineHeight: 1.6, marginBottom: '1.6rem' }}>
            Controls the small floating "Featured Partner" card that appears at the bottom-right of every public page.
            Only the <strong>Main Administrator</strong> can change these settings.
          </p>

          {/* Enable toggle */}
          <Row label="Show partner advert site-wide">
            <Toggle
              checked={form.enabled}
              onChange={v => setForm(prev => ({ ...prev, enabled: v }))}
            />
          </Row>

          {/* Tier selection */}
          <Row label="Eligible partner tiers" hint="Partners in any selected tier will rotate through the advert.">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {ALL_TIERS.map(t => {
                const on = form.tiers.includes(t.value);
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => toggleTier(t.value)}
                    style={{
                      padding: '6px 14px',
                      fontSize: '.74rem',
                      fontWeight: 700,
                      letterSpacing: '.06em',
                      textTransform: 'uppercase',
                      borderRadius: 999,
                      border: `1.5px solid ${on ? t.color : 'var(--color-bdr)'}`,
                      background: on ? t.color : '#fff',
                      color: on ? '#fff' : 'var(--color-txt-2)',
                      cursor: 'pointer',
                      transition: 'all .15s',
                    }}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
            <p style={{ fontSize: '.72rem', color: eligibleCount > 0 ? 'var(--color-txt-3)' : '#dc2626', marginTop: 8 }}>
              {eligibleCount} active partner{eligibleCount === 1 ? '' : 's'} match{eligibleCount === 1 ? 'es' : ''} the selected tiers.
              {eligibleCount === 0 && ' The advert will not show until at least one matching partner exists.'}
            </p>
          </Row>

          {/* Rotation */}
          <Row label="Rotation interval" hint="Time each partner is shown before swapping (5–120 seconds).">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input
                type="number"
                min={5}
                max={120}
                value={Math.round((form.rotationMs || 25000) / 1000)}
                onChange={e => {
                  const sec = Math.max(5, Math.min(120, Number(e.target.value) || 25));
                  setForm(prev => ({ ...prev, rotationMs: sec * 1000 }));
                }}
                style={inputStyle}
              />
              <span style={{ fontSize: '.78rem', color: 'var(--color-txt-3)' }}>seconds</span>
            </div>
          </Row>

          {/* Label */}
          <Row label="Overline label" hint="Shown above the partner name. Keep it short.">
            <input
              type="text"
              value={form.label}
              maxLength={60}
              onChange={e => setForm(prev => ({ ...prev, label: e.target.value }))}
              placeholder="Featured Partner"
              style={{ ...inputStyle, width: '100%' }}
            />
          </Row>

          {/* Dismissible */}
          <Row label="Allow visitors to dismiss for 24 hours">
            <Toggle
              checked={form.dismissible}
              onChange={v => setForm(prev => ({ ...prev, dismissible: v }))}
            />
          </Row>

          {/* Save */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.8rem', borderTop: '1px solid var(--color-bdr)', paddingTop: '1.4rem' }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                background: 'var(--color-navy)', color: '#fff',
                border: 'none', borderRadius: 10,
                padding: '11px 26px',
                fontWeight: 700, fontSize: '.84rem',
                fontFamily: 'var(--font-body)',
                cursor: saving ? 'wait' : 'pointer',
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── helpers ── */
const inputStyle = {
  padding: '9px 12px',
  fontSize: '.84rem',
  borderRadius: 8,
  border: '1.5px solid var(--color-bdr)',
  background: 'var(--color-off)',
  fontFamily: 'var(--font-body)',
  color: 'var(--color-txt)',
  outline: 'none',
};

function Row({ label, hint, children }) {
  return (
    <div style={{ marginBottom: '1.6rem' }}>
      <div style={{
        display: 'block',
        fontSize: '.7rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '.1em',
        color: 'var(--color-txt-3)',
        marginBottom: '.5rem',
      }}>
        {label}
      </div>
      {children}
      {hint && <p style={{ fontSize: '.72rem', color: 'var(--color-txt-3)', marginTop: 6, lineHeight: 1.5 }}>{hint}</p>}
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
      style={{
        width: 46, height: 26,
        borderRadius: 999,
        background: checked ? 'var(--color-gold)' : 'var(--color-bdr)',
        border: 'none',
        position: 'relative',
        cursor: 'pointer',
        transition: 'background .2s',
        flexShrink: 0,
      }}
    >
      <span style={{
        position: 'absolute',
        top: 3, left: checked ? 23 : 3,
        width: 20, height: 20,
        borderRadius: '50%',
        background: '#fff',
        boxShadow: '0 2px 4px rgba(0,0,0,.2)',
        transition: 'left .2s',
      }} />
    </button>
  );
}
