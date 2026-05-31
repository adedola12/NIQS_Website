import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicEvent, registerForEvent } from '../../api/registrationApi';

const NAVY = '#0B1F4B';
const GOLD = '#C9974A';
const PORTAL_URL = 'https://portal.niqsng.org/';
const FD = "'Bricolage Grotesque', sans-serif";
const FB = "'Sora', sans-serif";

function fmtDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

export default function EventRegister() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [step, setStep] = useState('choose'); // choose | member | nonmember | success
  const [form, setForm] = useState({ membershipNumber: '', fullName: '', email: '', phone: '', address: '', participationMode: 'in-person' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    let alive = true;
    getPublicEvent(id)
      .then((e) => { if (alive) setEvent(e); })
      .catch(() => { if (alive) setNotFound(true); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [id]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const isHybrid = event?.venueType === 'Hybrid';
  const when = event && event.endDate && String(event.endDate) !== String(event.date)
    ? `${fmtDate(event.date)} – ${fmtDate(event.endDate)}`
    : fmtDate(event?.date);

  async function submit(isMember) {
    setError('');
    if (!form.fullName.trim() || !form.email.trim()) { setError('Please enter your full name and email.'); return; }
    if (isMember && !form.membershipNumber.trim()) { setError('Please enter your membership number.'); return; }
    setSubmitting(true);
    try {
      const res = await registerForEvent(id, { ...form, isMember });
      setResult(res);
      setStep('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      setError(e.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <Centered><p style={{ color: '#5A6485', fontFamily: FB }}>Loading event…</p></Centered>;
  if (notFound) return <Centered><p style={{ color: '#5A6485', fontFamily: FB }}>This event could not be found.</p></Centered>;

  return (
    <div style={{ background: '#ECEEF5', minHeight: '70vh', padding: '40px 16px', fontFamily: FB }}>
      <div style={{ maxWidth: 560, margin: '0 auto', background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 10px 40px rgba(11,31,75,0.14)' }}>

        {/* Event header */}
        <div style={{ background: NAVY, color: '#fff', padding: '24px 28px' }}>
          {event.category && (
            <span style={{ fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
              {event.category}
            </span>
          )}
          <h1 style={{ fontFamily: FD, fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.15, margin: '8px 0 14px' }}>
            {event.title}
          </h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 18px', fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>
            {when && <span>📅 {when}{event.time ? ` · ${event.time}` : ''}</span>}
            {event.location && <span>📍 {event.location}</span>}
            {event.cpdPoints > 0 && <span style={{ color: GOLD, fontWeight: 700 }}>★ {event.cpdPoints} CPD points</span>}
          </div>
        </div>

        <div style={{ padding: '26px 28px 32px' }}>
          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}

          {/* ── Step: choose ── */}
          {step === 'choose' && (
            <>
              <h2 style={{ fontFamily: FD, fontSize: 18, color: NAVY, margin: '0 0 4px' }}>Register for this event</h2>
              <p style={{ fontSize: 13.5, color: '#5A6485', margin: '0 0 20px' }}>Are you a NIQS member?</p>
              <div style={{ display: 'grid', gap: 12 }}>
                <ChoiceCard
                  title="Yes, I'm a member"
                  desc="Register with your NIQS membership details."
                  onClick={() => { setError(''); setStep('member'); }}
                />
                <ChoiceCard
                  title="No, I'm not a member"
                  desc="Register as a guest — quick details and you're in."
                  onClick={() => { setError(''); setStep('nonmember'); }}
                />
              </div>
            </>
          )}

          {/* ── Step: member ── */}
          {step === 'member' && (
            <>
              <BackLink onClick={() => setStep('choose')} />
              <h2 style={{ fontFamily: FD, fontSize: 18, color: NAVY, margin: '6px 0 14px' }}>Member registration</h2>

              <a href={PORTAL_URL} target="_blank" rel="noopener noreferrer"
                style={{ display: 'block', textAlign: 'center', background: '#F0F0FF', color: NAVY, border: `1.5px solid ${NAVY}`, borderRadius: 8, padding: '10px', fontSize: 13.5, fontWeight: 700, textDecoration: 'none', marginBottom: 8 }}>
                Sign in via NIQS Portal ↗
              </a>
              <p style={{ fontSize: 11.5, color: '#8892B0', margin: '0 0 18px', textAlign: 'center' }}>
                Auto-fill from the member portal is coming soon — for now, please enter your details below.
              </p>

              <Field label="Membership number" required>
                <Input value={form.membershipNumber} onChange={(v) => set('membershipNumber', v)} placeholder="e.g. NIQS/12345" />
              </Field>
              <Field label="Full name" required>
                <Input value={form.fullName} onChange={(v) => set('fullName', v)} placeholder="QS John Doe" />
              </Field>
              <Field label="Email" required>
                <Input type="email" value={form.email} onChange={(v) => set('email', v)} placeholder="you@email.com" />
              </Field>
              <Field label="Phone">
                <Input value={form.phone} onChange={(v) => set('phone', v)} placeholder="080…" />
              </Field>
              {isHybrid && <ModeField value={form.participationMode} onChange={(v) => set('participationMode', v)} />}

              <SubmitBtn onClick={() => submit(true)} busy={submitting}>Complete registration</SubmitBtn>
            </>
          )}

          {/* ── Step: non-member ── */}
          {step === 'nonmember' && (
            <>
              <BackLink onClick={() => setStep('choose')} />
              <h2 style={{ fontFamily: FD, fontSize: 18, color: NAVY, margin: '6px 0 14px' }}>Guest registration</h2>
              <Field label="Full name" required>
                <Input value={form.fullName} onChange={(v) => set('fullName', v)} placeholder="John Doe" />
              </Field>
              <Field label="Email" required>
                <Input type="email" value={form.email} onChange={(v) => set('email', v)} placeholder="you@email.com" />
              </Field>
              <Field label="Phone">
                <Input value={form.phone} onChange={(v) => set('phone', v)} placeholder="080…" />
              </Field>
              <Field label="Address / Organisation">
                <Input value={form.address} onChange={(v) => set('address', v)} placeholder="City / company" />
              </Field>
              {isHybrid && <ModeField value={form.participationMode} onChange={(v) => set('participationMode', v)} />}

              <SubmitBtn onClick={() => submit(false)} busy={submitting}>Complete registration</SubmitBtn>
            </>
          )}

          {/* ── Step: success ── */}
          {step === 'success' && result && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#DCFCE7', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 14px' }}>✓</div>
              <h2 style={{ fontFamily: FD, fontSize: 22, color: NAVY, margin: '0 0 8px' }}>You're registered!</h2>
              <p style={{ fontSize: 14, color: '#5A6485', margin: '0 0 18px' }}>
                {result.emailSent
                  ? `We've emailed your confirmation to ${result.registration?.email}.`
                  : 'Save the link below — you’ll need it at the event.'}
              </p>

              {event.cpdPoints > 0 && (
                <div style={{ background: '#F6F7FB', border: '1px solid #DDE3F0', borderRadius: 10, padding: '16px 18px', textAlign: 'left' }}>
                  <p style={{ fontSize: 13.5, color: '#1a1a2e', margin: '0 0 12px', lineHeight: 1.5 }}>
                    At the event, open your personal attendance link to bank your{' '}
                    <strong>{event.cpdPoints} CPD point{event.cpdPoints === 1 ? '' : 's'}</strong>.
                  </p>
                  {result.attendanceLink && (
                    <a href={result.attendanceLink}
                      style={{ display: 'inline-block', background: GOLD, color: NAVY, textDecoration: 'none', fontWeight: 700, fontSize: 13.5, padding: '10px 18px', borderRadius: 8 }}>
                      My attendance link
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── small presentational helpers ── */
function Centered({ children }) {
  return <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>{children}</div>;
}
function ChoiceCard({ title, desc, onClick }) {
  return (
    <button onClick={onClick} style={{ textAlign: 'left', background: '#FAFBFF', border: '1.5px solid #DDE3F0', borderRadius: 12, padding: '16px 18px', cursor: 'pointer', fontFamily: FB }}>
      <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: NAVY }}>{title}</p>
      <p style={{ margin: '4px 0 0', fontSize: 12.5, color: '#5A6485' }}>{desc}</p>
    </button>
  );
}
function BackLink({ onClick }) {
  return <button onClick={onClick} style={{ background: 'none', border: 'none', color: '#5A6485', cursor: 'pointer', fontSize: 13, padding: 0, fontFamily: FB }}>← Back</button>;
}
function Field({ label, required, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 5 }}>
        {label} {required && <span style={{ color: '#dc2626' }}>*</span>}
      </label>
      {children}
    </div>
  );
}
function Input({ value, onChange, type = 'text', placeholder }) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #DDE3F0', borderRadius: 8, fontSize: 14, fontFamily: FB, color: '#1a1a2e', outline: 'none', boxSizing: 'border-box' }}
    />
  );
}
function ModeField({ value, onChange }) {
  return (
    <Field label="How will you attend?">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {[{ v: 'in-person', l: 'In person' }, { v: 'virtual', l: 'Online' }].map((o) => (
          <button key={o.v} type="button" onClick={() => onChange(o.v)}
            style={{ padding: '9px', borderRadius: 8, cursor: 'pointer', fontFamily: FB, fontSize: 13, fontWeight: 600,
              border: value === o.v ? `2px solid ${NAVY}` : '1.5px solid #DDE3F0',
              background: value === o.v ? '#F0F0FF' : '#fff', color: NAVY }}>
            {o.l}
          </button>
        ))}
      </div>
    </Field>
  );
}
function SubmitBtn({ children, onClick, busy }) {
  return (
    <button onClick={onClick} disabled={busy}
      style={{ width: '100%', marginTop: 8, padding: '13px', borderRadius: 8, border: 'none', background: NAVY, color: '#fff', fontSize: 15, fontWeight: 700, cursor: busy ? 'wait' : 'pointer', fontFamily: FB, opacity: busy ? 0.7 : 1 }}>
      {busy ? 'Submitting…' : children}
    </button>
  );
}
