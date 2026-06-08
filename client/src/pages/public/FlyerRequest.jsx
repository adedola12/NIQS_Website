import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getLinkContext, submitFlyerRequest } from '../../api/flyerRequestApi';
import { CATEGORIES, getCategoryConfig } from '../../flyer/categories.js';

const NAVY = '#0B1F4B';
const GOLD = '#C9974A';
const FD = "'Bricolage Grotesque', sans-serif";
const FB = "'Sora', sans-serif";

const PLATFORMS = [
  { v: 'Zoom', l: 'Zoom' },
  { v: 'GoogleMeet', l: 'Google Meet' },
  { v: 'Teams', l: 'Microsoft Teams' },
  { v: 'XSpaces', l: 'X Spaces' },
  { v: 'YouTube', l: 'YouTube Live' },
  { v: 'WhatsApp', l: 'WhatsApp Live' },
];

const BLANK = {
  requesterName: '', requesterEmail: '', requesterPhone: '', requesterOrg: '', notes: '',
  category: 'Training', title: '', subtitle: '', host: '', message: '',
  dateStart: '', dateEnd: '', time: '', timeZone: 'WAT',
  cpdPoints: '', venueType: 'Hybrid', venuePhysical: '', venueCity: '',
  platform: 'Zoom', platformNote: '',
  schedule: '', registrationUrl: '', registrationExtra: '',
};

export default function FlyerRequest() {
  const { token } = useParams();
  const [ctx, setCtx] = useState(null); // { valid, scope, chapterName }
  const [form, setForm] = useState(BLANK);
  const [speakers, setSpeakers] = useState([]);
  const [enquiries, setEnquiries] = useState(['']);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) return;
    getLinkContext(token).then(setCtx).catch(() => setCtx({ valid: false }));
  }, [token]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const cfg = getCategoryConfig(form.category);
  const showVenue = form.venueType !== 'Virtual';
  const showPlatform = form.venueType !== 'In-Person';

  // Occasion flyers (no CPD) default to in-person, mirroring the Flyer Studio.
  const prevCatRef = useRef(form.category);
  useEffect(() => {
    if (form.category !== prevCatRef.current) {
      prevCatRef.current = form.category;
      if (!getCategoryConfig(form.category).isCpd && form.venueType !== 'In-Person') {
        set('venueType', 'In-Person');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.category]);

  function setSpeaker(i, k, v) {
    setSpeakers((list) => list.map((s, idx) => (idx === i ? { ...s, [k]: v } : s)));
  }
  function addSpeaker() {
    if (speakers.length >= 5) return;
    setSpeakers((l) => [...l, { name: '', role: cfg.defaultRole, credentials: '', topic: '' }]);
  }
  function removeSpeaker(i) {
    setSpeakers((l) => l.filter((_, idx) => idx !== i));
  }

  function setEnquiry(i, v) {
    setEnquiries((l) => l.map((e, idx) => (idx === i ? v : e)));
  }
  function addEnquiry() {
    if (enquiries.length >= 5) return;
    setEnquiries((l) => [...l, '']);
  }
  function removeEnquiry(i) {
    setEnquiries((l) => l.filter((_, idx) => idx !== i));
  }

  async function submit() {
    setError('');
    if (!form.requesterName.trim() || !form.requesterEmail.trim()) {
      setError('Please enter your name and email so we can confirm receipt.');
      return;
    }
    if (!form.title.trim()) {
      setError('Please enter the event title.');
      return;
    }
    setSubmitting(true);
    try {
      await submitFlyerRequest({
        ...form,
        token,
        cpdPoints: Number(form.cpdPoints) || 0,
        speakers: speakers.filter((s) => s.name.trim() || s.topic.trim()),
        enquiries: enquiries.map((e) => e.trim()).filter(Boolean),
      });
      setDone(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      setError(e.response?.data?.message || 'Could not submit your request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div style={{ background: '#ECEEF5', minHeight: '70vh', padding: '40px 16px', fontFamily: FB }}>
        <div style={{ maxWidth: 560, margin: '0 auto', background: '#fff', borderRadius: 16, padding: '40px 28px', textAlign: 'center', boxShadow: '0 10px 40px rgba(11,31,75,0.14)' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#DCFCE7', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 14px' }}>✓</div>
          <h2 style={{ fontFamily: FD, fontSize: 24, color: NAVY, margin: '0 0 8px' }}>Request received!</h2>
          <p style={{ fontSize: 14.5, color: '#5A6485', margin: '0 0 6px', lineHeight: 1.55 }}>
            Thank you, {form.requesterName.split(' ')[0]}. The NIQS team will design the flyer for{' '}
            <strong style={{ color: NAVY }}>{form.title}</strong> and follow up shortly.
          </p>
          <p style={{ fontSize: 13, color: '#8892B0', margin: '14px 0 0' }}>
            A confirmation has been sent to {form.requesterEmail}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#ECEEF5', minHeight: '70vh', padding: '40px 16px', fontFamily: FB }}>
      <div style={{ maxWidth: 620, margin: '0 auto', background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 10px 40px rgba(11,31,75,0.14)' }}>

        {/* Header */}
        <div style={{ background: NAVY, color: '#fff', padding: '24px 28px' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
            NIQS Flyer Request
          </span>
          <h1 style={{ fontFamily: FD, fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.15, margin: '8px 0 6px' }}>
            Tell us about your event
          </h1>
          <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.78)', margin: 0, lineHeight: 1.5 }}>
            Fill in the details below and our team will design the flyer for you.
            {ctx?.valid && ctx?.chapterName ? ` This request will be sent to the ${ctx.chapterName}.` : ''}
          </p>
        </div>

        <div style={{ padding: '24px 28px 32px' }}>
          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 18 }}>
              {error}
            </div>
          )}

          {/* ── Your details ── */}
          <SectionTitle>Your details</SectionTitle>
          <Row>
            <Field label="Your name" required>
              <Input value={form.requesterName} onChange={(v) => set('requesterName', v)} placeholder="QS John Doe" />
            </Field>
            <Field label="Email" required>
              <Input type="email" value={form.requesterEmail} onChange={(v) => set('requesterEmail', v)} placeholder="you@email.com" />
            </Field>
          </Row>
          <Row>
            <Field label="Phone">
              <Input value={form.requesterPhone} onChange={(v) => set('requesterPhone', v)} placeholder="080…" />
            </Field>
            <Field label="Organisation / role">
              <Input value={form.requesterOrg} onChange={(v) => set('requesterOrg', v)} placeholder="e.g. Lagos Chapter Secretary" />
            </Field>
          </Row>

          {/* ── Event basics ── */}
          <SectionTitle>Event details</SectionTitle>
          <Field label="Flyer type">
            <Select
              value={form.category}
              onChange={(v) => set('category', v)}
              options={CATEGORIES.map((c) => ({ value: c, label: c }))}
            />
          </Field>
          <Field label={cfg.isCpd ? 'Event title' : 'Headline'} required>
            <Input value={form.title} onChange={(v) => set('title', v)} placeholder="e.g. Advancing Digital Cost Management in Construction" />
          </Field>
          <Field label={cfg.isCpd ? 'Subtitle / short description' : 'Subtitle / occasion'}>
            <Input value={form.subtitle} onChange={(v) => set('subtitle', v)} placeholder="One line describing the occasion" />
          </Field>

          {cfg.showHost && (
            <Field label="Host / where visiting" hint="The chapter, body or office being visited">
              <Input value={form.host} onChange={(v) => set('host', v)} placeholder="e.g. NIQS Lagos State Chapter" />
            </Field>
          )}

          {cfg.showMessage && (
            <Field label={cfg.messageLabel}>
              <TextArea value={form.message} onChange={(v) => set('message', v)} placeholder="Write the citation / message here…" />
            </Field>
          )}

          {cfg.isCpd && (
            <Row>
              <Field label="CPD points">
                <Input type="number" value={form.cpdPoints} onChange={(v) => set('cpdPoints', v)} placeholder="e.g. 5" />
              </Field>
              <Field label="" >
                <span />
              </Field>
            </Row>
          )}

          {cfg.showModules && (
            <Field label="Module breakdown" hint="One module per line">
              <TextArea
                value={form.schedule}
                onChange={(v) => set('schedule', v)}
                placeholder={'Day 1: Introduction to Digital Workflows\nDay 2: BIM & Quantity Surveying\nDay 3: Practical Sessions'}
              />
            </Field>
          )}

          {/* ── Schedule ── */}
          <SectionTitle>Schedule</SectionTitle>
          <Row>
            <Field label="Start date">
              <Input type="date" value={form.dateStart} onChange={(v) => set('dateStart', v)} />
            </Field>
            <Field label="End date" hint="Leave blank for single-day">
              <Input type="date" value={form.dateEnd} onChange={(v) => set('dateEnd', v)} />
            </Field>
          </Row>
          <Row>
            <Field label="Time">
              <Input value={form.time} onChange={(v) => set('time', v)} placeholder="e.g. 9:00 AM daily" />
            </Field>
            <Field label="Time zone">
              <Select value={form.timeZone} onChange={(v) => set('timeZone', v)} options={['WAT', 'GMT', 'UTC', 'CAT', 'EAT'].map((z) => ({ value: z, label: z }))} />
            </Field>
          </Row>

          {/* ── Format & venue ── */}
          <SectionTitle>Format &amp; venue</SectionTitle>
          <Field label="Event format">
            <SegToggle
              value={form.venueType}
              onChange={(v) => set('venueType', v)}
              options={[{ v: 'In-Person', l: 'In-Person' }, { v: 'Virtual', l: 'Virtual' }, { v: 'Hybrid', l: 'Hybrid' }]}
            />
          </Field>
          {showVenue && (
            <Row>
              <Field label="Venue name">
                <Input value={form.venuePhysical} onChange={(v) => set('venuePhysical', v)} placeholder="e.g. Eko Hotel & Suites" />
              </Field>
              <Field label="City">
                <Input value={form.venueCity} onChange={(v) => set('venueCity', v)} placeholder="e.g. Lagos" />
              </Field>
            </Row>
          )}
          {showPlatform && (
            <Row>
              <Field label="Platform">
                <Select value={form.platform} onChange={(v) => set('platform', v)} options={PLATFORMS.map((p) => ({ value: p.v, label: p.l }))} />
              </Field>
              <Field label="Platform note">
                <Input value={form.platformNote} onChange={(v) => set('platformNote', v)} placeholder="e.g. Link via email" />
              </Field>
            </Row>
          )}

          {/* ── People (speakers / delegation / honorees …) ── */}
          <SectionTitle>{cfg.isCpd ? 'Speakers / facilitators' : `${cfg.peopleNoun}s`} <Muted>(optional, up to 5)</Muted></SectionTitle>
          {speakers.map((s, i) => (
            <div key={i} style={{ border: '1.5px solid #DDE3F0', borderRadius: 10, padding: 14, marginBottom: 10, background: '#FAFBFF' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: NAVY, letterSpacing: '0.06em' }}>{cfg.peopleNoun.toUpperCase()} {i + 1}</span>
                <button type="button" onClick={() => removeSpeaker(i)} style={{ background: 'none', border: 'none', color: '#C9302C', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Remove</button>
              </div>
              <Row>
                <Field label="Full name">
                  <Input value={s.name} onChange={(v) => setSpeaker(i, 'name', v)} placeholder="QS Dr John Doe" />
                </Field>
                <Field label="Role">
                  <Select value={s.role} onChange={(v) => setSpeaker(i, 'role', v)} options={cfg.peopleRoles.map((r) => ({ value: r, label: r }))} />
                </Field>
              </Row>
              <Field label={cfg.isCpd ? 'Talk / module topic' : 'Note (optional)'}>
                <Input value={s.topic} onChange={(v) => setSpeaker(i, 'topic', v)} placeholder={cfg.isCpd ? 'What will they speak on?' : 'e.g. role, title or short note'} />
              </Field>
            </div>
          ))}
          {speakers.length < 5 && (
            <button type="button" onClick={addSpeaker} style={dashBtn}>+ Add {cfg.peopleNoun.toLowerCase()}</button>
          )}

          {/* ── Registration & enquiries ── */}
          <SectionTitle>{cfg.showRegistration ? <>Registration &amp; contact</> : 'Contact'}</SectionTitle>
          {cfg.showRegistration && (
            <>
              <Field label="Registration link" hint="If you already have one">
                <Input value={form.registrationUrl} onChange={(v) => set('registrationUrl', v)} placeholder="niqs.org.ng/register" />
              </Field>
              <Field label="Registration note">
                <Input value={form.registrationExtra} onChange={(v) => set('registrationExtra', v)} placeholder="e.g. Discounts for students" />
              </Field>
            </>
          )}
          <Field label="Enquiry phone numbers">
            {enquiries.map((n, i) => (
              <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                <Input value={n} onChange={(v) => setEnquiry(i, v)} placeholder="Phone number" />
                {enquiries.length > 1 && (
                  <button type="button" onClick={() => removeEnquiry(i)} style={{ background: 'none', border: 'none', color: '#C9302C', cursor: 'pointer', fontSize: 18, flexShrink: 0 }}>×</button>
                )}
              </div>
            ))}
            {enquiries.length < 5 && (
              <button type="button" onClick={addEnquiry} style={{ ...dashBtn, width: 'auto', padding: '6px 12px', fontSize: 11 }}>+ Add number</button>
            )}
          </Field>

          {/* ── Notes ── */}
          <Field label="Anything else for the design team?">
            <TextArea value={form.notes} onChange={(v) => set('notes', v)} placeholder="Colours, sponsors, special instructions…" />
          </Field>

          <button onClick={submit} disabled={submitting}
            style={{ width: '100%', marginTop: 10, padding: '14px', borderRadius: 8, border: 'none', background: NAVY, color: '#fff', fontSize: 15, fontWeight: 700, cursor: submitting ? 'wait' : 'pointer', fontFamily: FB, opacity: submitting ? 0.7 : 1 }}>
            {submitting ? 'Submitting…' : 'Submit flyer request'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── presentational helpers ── */
function SectionTitle({ children }) {
  return (
    <h3 style={{ fontFamily: FD, fontSize: 15, color: NAVY, margin: '22px 0 12px', paddingBottom: 7, borderBottom: '1.5px solid #DDE3F0' }}>
      {children}
    </h3>
  );
}
function Muted({ children }) {
  return <span style={{ fontSize: 12, fontWeight: 400, color: '#8892B0', fontFamily: FB }}>{children}</span>;
}
function Row({ children }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>{children}</div>;
}
function Field({ label, hint, required, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && (
        <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 5 }}>
          {label} {required && <span style={{ color: '#dc2626' }}>*</span>}
        </label>
      )}
      {hint && <p style={{ fontSize: 11, color: '#8892B0', margin: '-2px 0 6px' }}>{hint}</p>}
      {children}
    </div>
  );
}
const inputStyle = {
  width: '100%', padding: '10px 12px', border: '1.5px solid #DDE3F0', borderRadius: 8,
  fontSize: 14, fontFamily: FB, color: '#1a1a2e', outline: 'none', boxSizing: 'border-box', background: '#fff',
};
function Input({ value, onChange, type = 'text', placeholder }) {
  return <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} style={inputStyle} />;
}
function TextArea({ value, onChange, placeholder }) {
  return <textarea value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} style={{ ...inputStyle, minHeight: 84, resize: 'vertical', lineHeight: 1.5 }} />;
}
function Select({ value, onChange, options }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
function SegToggle({ value, onChange, options }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${options.length}, 1fr)`, gap: 8 }}>
      {options.map((o) => (
        <button key={o.v} type="button" onClick={() => onChange(o.v)}
          style={{ padding: '9px', borderRadius: 8, cursor: 'pointer', fontFamily: FB, fontSize: 13, fontWeight: 600,
            border: value === o.v ? `2px solid ${NAVY}` : '1.5px solid #DDE3F0',
            background: value === o.v ? '#F0F0FF' : '#fff', color: NAVY }}>
          {o.l}
        </button>
      ))}
    </div>
  );
}
const dashBtn = {
  width: '100%', padding: '9px', borderRadius: 8, border: '1.5px dashed #DDE3F0',
  background: '#F6F7FB', color: NAVY, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: FB,
};
