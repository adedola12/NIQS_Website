import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import API from '../../api/axios';
import AdminHeader from '../../components/admin/AdminHeader';

const SectionLabel = ({ children }) => (
  <div style={{
    fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '.72rem',
    textTransform: 'uppercase', letterSpacing: '.12em', color: 'var(--color-txt-3)',
    borderBottom: '1px solid var(--color-bdr)', paddingBottom: '.5rem',
    marginBottom: '1.2rem', marginTop: '2rem',
  }}>
    {children}
  </div>
);

const Field = ({ label, name, value, onChange, type = 'text', placeholder = '' }) => (
  <div style={{ marginBottom: '1rem' }}>
    <label style={{ display: 'block', fontSize: '.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--color-txt-3)', marginBottom: '.4rem' }}>
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        width: '100%', padding: '10px 12px', fontSize: '.84rem', borderRadius: 8,
        border: '1.5px solid var(--color-bdr)', background: 'var(--color-off)',
        fontFamily: 'var(--font-body)', color: 'var(--color-txt)',
        transition: 'border-color .15s',
      }}
      onFocus={e => { e.target.style.borderColor = 'var(--color-navy)'; e.target.style.background = '#fff'; }}
      onBlur={e => { e.target.style.borderColor = 'var(--color-bdr)'; e.target.style.background = 'var(--color-off)'; }}
    />
  </div>
);

const EMPTY = {
  waqsnUrl: '',
  qsrbnUrl: '',
  pagsUrl: '',
  twitterUrl: '',
  facebookUrl: '',
  linkedinUrl: '',
  youtubeUrl: '',
  instagramUrl: '',
  yqsfCpdEvents: '',
  yqsfTotalAwards: '',
  phone1: '',
  phone2: '',
  email1: '',
  email2: '',
  address: '',
  officeHours: '',
};

export default function ManageSiteSettings() {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/site-settings')
      .then(res => {
        const d = res.data || {};
        setForm(prev => ({ ...prev, ...d }));
      })
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await API.put('/site-settings', form);
      toast.success('Settings saved');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-txt-3)' }}>Loading settings…</div>
  );

  return (
    <div>
      <AdminHeader
        title="Site Settings"
        subtitle="Manage external links, social media, and contact information shown across the website"
      />

      <div style={{ maxWidth: 760, margin: '0 auto', background: '#fff', borderRadius: 14, border: '1px solid var(--color-bdr)', padding: '2.5rem' }}>

        {/* ── External Links ── */}
        <SectionLabel>External / Partner Links</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1.5rem' }}>
          <div>
            <Field
              label="WAQSN Website URL (Women Assoc. of QS Nigeria)"
              name="waqsnUrl"
              value={form.waqsnUrl}
              onChange={handleChange}
              placeholder="https://waqsn.org.ng"
            />
            {form.waqsnUrl && (
              <div style={{ marginTop: '-.6rem', marginBottom: '1rem' }}>
                <a href={form.waqsnUrl} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: '.72rem', color: 'var(--color-gold)', fontWeight: 600 }}>
                  Test link ↗
                </a>
              </div>
            )}
          </div>
          <Field label="QSRBN Website URL" name="qsrbnUrl" value={form.qsrbnUrl} onChange={handleChange} placeholder="https://qsrbn.gov.ng" />
          <Field label="PAQS Website URL" name="pagsUrl" value={form.pagsUrl} onChange={handleChange} placeholder="https://paqs.net" />
        </div>

        {/* ── Social Media ── */}
        <SectionLabel>Social Media</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1.5rem' }}>
          <Field label="Twitter / X URL" name="twitterUrl" value={form.twitterUrl} onChange={handleChange} placeholder="https://twitter.com/niqs_ng" />
          <Field label="Facebook URL" name="facebookUrl" value={form.facebookUrl} onChange={handleChange} placeholder="https://facebook.com/niqsng" />
          <Field label="LinkedIn URL" name="linkedinUrl" value={form.linkedinUrl} onChange={handleChange} placeholder="https://linkedin.com/company/niqs" />
          <Field label="YouTube URL" name="youtubeUrl" value={form.youtubeUrl} onChange={handleChange} placeholder="https://youtube.com/@niqs" />
          <Field label="Instagram URL" name="instagramUrl" value={form.instagramUrl} onChange={handleChange} placeholder="https://instagram.com/niqs_ng" />
        </div>

        {/* ── YQSF Stats ── */}
        <SectionLabel>YQSF Stats</SectionLabel>
        <p style={{ fontSize: '.75rem', color: 'var(--color-txt-3)', marginBottom: '1.2rem', marginTop: '-.6rem' }}>
          These values are displayed on the Young QS Forum public page. Leave blank to show the default placeholder values.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1.5rem' }}>
          <Field label="CPD Events / Year" name="yqsfCpdEvents" value={form.yqsfCpdEvents} onChange={handleChange} placeholder="e.g. 40" />
          <Field label="Total Awards So Far" name="yqsfTotalAwards" value={form.yqsfTotalAwards} onChange={handleChange} placeholder="e.g. 10+" />
        </div>

        {/* ── Contact Details ── */}
        <SectionLabel>Contact Details</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1.5rem' }}>
          <Field label="Primary Phone" name="phone1" value={form.phone1} onChange={handleChange} placeholder="+234 901 234 5678" />
          <Field label="Secondary Phone" name="phone2" value={form.phone2} onChange={handleChange} placeholder="+234 801 234 5678" />
          <Field label="Primary Email" name="email1" value={form.email1} onChange={handleChange} type="email" placeholder="info@niqs.org.ng" />
          <Field label="Secondary Email" name="email2" value={form.email2} onChange={handleChange} type="email" placeholder="secretary@niqs.org.ng" />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--color-txt-3)', marginBottom: '.4rem' }}>
            Office Address
          </label>
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            rows={3}
            placeholder="NIQS House, Plot 759 Cadastral Zone, Central Business District, Abuja, FCT, Nigeria"
            style={{
              width: '100%', padding: '10px 12px', fontSize: '.84rem', borderRadius: 8,
              border: '1.5px solid var(--color-bdr)', background: 'var(--color-off)',
              fontFamily: 'var(--font-body)', color: 'var(--color-txt)', resize: 'vertical',
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--color-navy)'; e.target.style.background = '#fff'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--color-bdr)'; e.target.style.background = 'var(--color-off)'; }}
          />
        </div>
        <Field label="Office Hours" name="officeHours" value={form.officeHours} onChange={handleChange} placeholder="Monday — Friday: 8:00 AM — 5:00 PM" />

        {/* ── Save ── */}
        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-bdr)', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '10px 28px', fontSize: '.82rem', fontWeight: 700,
              borderRadius: 8, border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
              background: 'var(--color-navy)', color: '#fff', fontFamily: 'var(--font-body)',
              opacity: saving ? .6 : 1, transition: 'opacity .15s',
            }}
          >
            {saving ? 'Saving…' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
