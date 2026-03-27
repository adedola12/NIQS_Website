import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import API from '../../api/axios';
import AdminHeader from '../../components/admin/AdminHeader';

const DEFAULTS = {
  name: 'Arc. Dr. [President Name]',
  title: 'President, NIQS',
  tenure: 'Elected 2023 – Present',
  linkedIn: '',
  photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80&fit=crop&crop=face',
  backgroundImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=1400&q=80&fit=crop',
  paragraph1: 'It is my honour to serve as President of the Nigerian Institute of Quantity Surveyors at this critical juncture. The construction industry is undergoing significant transformation, and NIQS is well-positioned to lead that change.',
  paragraph2: 'Our focus rests on three pillars: strengthening professional standards, expanding access to quality education and examination, and deepening international partnerships that give our members global relevance.',
  quote: '"Together, we will build a stronger, more impactful NIQS for the benefit of our members and Nigerian society."',
};

export default function ManagePresident() {
  const [form, setForm] = useState({ ...DEFAULTS });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    API.get('/president')
      .then(res => {
        if (res.data?._id) {
          const d = res.data;
          setForm({
            name: d.name || DEFAULTS.name,
            title: d.title || DEFAULTS.title,
            tenure: d.tenure || DEFAULTS.tenure,
            linkedIn: d.linkedIn || '',
            photo: d.photo || DEFAULTS.photo,
            backgroundImage: d.backgroundImage || DEFAULTS.backgroundImage,
            paragraph1: d.paragraph1 || DEFAULTS.paragraph1,
            paragraph2: d.paragraph2 || DEFAULTS.paragraph2,
            quote: d.quote || DEFAULTS.quote,
          });
          setLastUpdated(d.updatedAt);
        }
      })
      .catch(() => toast.error('Could not load president data'))
      .finally(() => setLoading(false));
  }, []);

  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await API.put('/president', form);
      setLastUpdated(res.data.updatedAt);
      toast.success('President profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <AdminHeader title="President Profile" breadcrumbs={['President']} />
        <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <AdminHeader title="President Profile" breadcrumbs={['President']} />

      <div style={{ padding: '24px 28px', maxWidth: 860 }}>

        {/* Info banner */}
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '12px 16px', marginBottom: 24, fontSize: 13, color: '#1e40af' }}>
          <strong>Note:</strong> The President photo is automatically used as both the portrait on the page <em>and</em> the hero background image (darkened). You may also set a separate background image URL below.
          {lastUpdated && <span style={{ float: 'right', color: '#6b7280' }}>Last saved: {new Date(lastUpdated).toLocaleString()}</span>}
        </div>

        <form onSubmit={handleSubmit}>
          {/* ── IDENTITY ── */}
          <SectionTitle>Identity</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <Field label="Full Name / Title" required>
              <input value={form.name} onChange={e => f('name', e.target.value)} style={inputStyle} required placeholder="Arc. Dr. [Name], FNIQS" />
            </Field>
            <Field label="Official Title">
              <input value={form.title} onChange={e => f('title', e.target.value)} style={inputStyle} placeholder="President, NIQS" />
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <Field label="Tenure Period">
              <input value={form.tenure} onChange={e => f('tenure', e.target.value)} style={inputStyle} placeholder="Elected 2023 – Present" />
            </Field>
            <Field label="LinkedIn Profile URL">
              <input value={form.linkedIn} onChange={e => f('linkedIn', e.target.value)} style={inputStyle} placeholder="https://linkedin.com/in/..." />
            </Field>
          </div>

          {/* ── PHOTOS ── */}
          <SectionTitle>Photos</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <Field label="President Portrait URL (also used as hero background)" required>
              <input value={form.photo} onChange={e => f('photo', e.target.value)} style={inputStyle} required placeholder="https://..." />
            </Field>
            <Field label="Override Hero Background URL (optional — uses portrait by default)">
              <input value={form.backgroundImage} onChange={e => f('backgroundImage', e.target.value)} style={inputStyle} placeholder="https://... (leave blank to auto-use portrait)" />
            </Field>
          </div>

          {/* Photo preview */}
          {form.photo && (
            <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 6 }}>Portrait Preview</p>
                <img src={form.photo} alt="Portrait preview" style={{ width: 120, height: 150, objectFit: 'cover', objectPosition: 'top', borderRadius: 10, border: '2px solid #e5e7eb' }} />
              </div>
              {form.backgroundImage && (
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 6 }}>Hero Background Preview</p>
                  <img src={form.backgroundImage} alt="Background preview" style={{ width: 200, height: 150, objectFit: 'cover', borderRadius: 10, border: '2px solid #e5e7eb', filter: 'brightness(0.35)' }} />
                </div>
              )}
            </div>
          )}

          {/* ── MESSAGE ── */}
          <SectionTitle>Presidential Message</SectionTitle>
          <Field label="Paragraph 1" required>
            <textarea value={form.paragraph1} onChange={e => f('paragraph1', e.target.value)} required rows={4} style={{ ...inputStyle, resize: 'vertical', marginBottom: 14 }} />
          </Field>
          <Field label="Paragraph 2">
            <textarea value={form.paragraph2} onChange={e => f('paragraph2', e.target.value)} rows={4} style={{ ...inputStyle, resize: 'vertical', marginBottom: 14 }} />
          </Field>
          <Field label="Featured Quote (displayed in gold-bordered block)">
            <textarea value={form.quote} onChange={e => f('quote', e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder='"Quote text here."' />
          </Field>

          {/* ── ACTIONS ── */}
          <div style={{ display: 'flex', gap: 12, marginTop: 24, paddingTop: 20, borderTop: '1px solid #f3f4f6' }}>
            <button type="submit" disabled={saving} style={{ padding: '12px 28px', background: '#C9974A', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 14, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Saving...' : 'Save President Profile'}
            </button>
            <a href="/president" target="_blank" rel="noreferrer" style={{ padding: '12px 20px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 14, cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
              Preview Page ↗
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <h4 style={{ margin: '20px 0 12px', fontSize: 13, fontWeight: 700, color: '#0B1F4B', textTransform: 'uppercase', letterSpacing: '.06em', borderBottom: '1px solid #f3f4f6', paddingBottom: 8 }}>
      {children}
    </h4>
  );
}

function Field({ label, required, children }) {
  return (
    <div style={{ marginBottom: 0 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>
        {label} {required && <span style={{ color: '#dc2626' }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '9px 12px', border: '1px solid #d1d5db',
  borderRadius: 6, fontSize: 14, color: '#111827', outline: 'none',
  boxSizing: 'border-box', fontFamily: 'inherit',
};
