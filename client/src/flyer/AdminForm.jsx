import React, { useRef } from 'react'
import BackgroundPicker from './BackgroundPicker.jsx'
import { uploadImage } from './flyerApi'

// ─── Shared form primitives ──────────────────────────────────────────────────

const inputStyle = {
  width: '100%', padding: '7px 10px',
  border: '1.5px solid #DDE3F0', borderRadius: 6,
  fontSize: 13, fontFamily: "'Sora', sans-serif",
  color: '#1a1a2e', background: '#fff',
  outline: 'none', transition: 'border-color 0.15s',
}

const labelStyle = {
  display: 'block', fontSize: 11, fontWeight: 700,
  color: '#374151', letterSpacing: '0.06em',
  textTransform: 'uppercase', marginBottom: 5,
}

function Field({ label, hint, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={labelStyle}>{label}</label>}
      {hint && <p style={{ fontSize: 10.5, color: '#5A6485', margin: '-3px 0 6px' }}>{hint}</p>}
      {children}
    </div>
  )
}

function Input({ value, onChange, ...props }) {
  return (
    <input
      style={inputStyle}
      value={value}
      onChange={e => onChange(e.target.value)}
      {...props}
    />
  )
}

function Select({ value, onChange, options, ...props }) {
  return (
    <select
      style={{ ...inputStyle, cursor: 'pointer' }}
      value={value}
      onChange={e => onChange(e.target.value)}
      {...props}
    >
      {options.map(o => (
        <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
      ))}
    </select>
  )
}

function Row({ children, gap = 10 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${React.Children.count(children)}, 1fr)`, gap }}>
      {children}
    </div>
  )
}

function Toggle({ on, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      style={{
        width: 36, height: 20, borderRadius: 10, border: 'none',
        background: on ? '#000066' : '#CBD2E0',
        position: 'relative', cursor: 'pointer', flexShrink: 0,
        transition: 'background 0.2s',
      }}
    >
      <span style={{
        position: 'absolute', top: 2, left: on ? 18 : 2,
        width: 16, height: 16, borderRadius: '50%', background: '#fff',
        transition: 'left 0.2s',
        boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
      }} />
    </button>
  )
}

function ToggleRow({ label, on, onChange, indent = false }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      paddingLeft: indent ? 12 : 0, marginBottom: 10,
    }}>
      <span style={{ fontSize: 12, color: indent ? '#5A6485' : '#1a1a2e', fontWeight: indent ? 400 : 500 }}>
        {label}
      </span>
      <Toggle on={on} onChange={onChange} />
    </div>
  )
}

function GroupLabel({ children }) {
  return (
    <p style={{
      fontSize: 10, fontWeight: 700, color: '#9BA3BF',
      letterSpacing: '0.1em', textTransform: 'uppercase',
      margin: '12px 0 6px',
    }}>
      {children}
    </p>
  )
}

function SectionHeader({ title, open, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '9px 0', background: 'none', border: 'none', borderBottom: '1.5px solid #DDE3F0',
        cursor: 'pointer', marginBottom: open ? 14 : 0,
      }}
    >
      <span style={{ fontSize: 12, fontWeight: 700, color: '#000066', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        {title}
      </span>
      <span style={{ fontSize: 14, color: '#5A6485', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
    </button>
  )
}

// ─── Speaker card ─────────────────────────────────────────────────────────────

function SpeakerRow({ speaker, index, onChange, onRemove }) {
  const fileRef = useRef()
  const [uploading, setUploading] = React.useState(false)

  function update(key, val) {
    onChange({ ...speaker, [key]: val })
  }

  async function handlePhoto(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadImage(file)
      update('photo', url)
    } catch (err) {
      alert('Photo upload failed: ' + (err.response?.data?.message || err.message))
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div style={{
      border: '1.5px solid #DDE3F0', borderRadius: 8, padding: 12,
      marginBottom: 10, background: '#FAFBFF',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#000066', letterSpacing: '0.06em' }}>
          SPEAKER {index + 1}
        </span>
        <button
          type="button"
          onClick={onRemove}
          style={{ fontSize: 11, color: '#C9302C', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
        >
          Remove
        </button>
      </div>

      {/* Photo upload */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
        <button
          type="button"
          onClick={() => fileRef.current.click()}
          disabled={uploading}
          style={{
            width: 52, height: 52, borderRadius: 6, flexShrink: 0,
            border: '1.5px dashed #DDE3F0', background: '#F6F7FB',
            cursor: uploading ? 'wait' : 'pointer', overflow: 'hidden', padding: 0,
          }}
        >
          {uploading
            ? <span style={{ fontSize: 9, color: '#5A6485', display: 'block', textAlign: 'center', padding: 4, lineHeight: 1.3 }}>Uploading…</span>
            : speaker.photo
              ? <img src={speaker.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
              : <span style={{ fontSize: 10, color: '#5A6485', display: 'block', textAlign: 'center', padding: 4, lineHeight: 1.3 }}>Upload photo</span>}
        </button>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
        <div style={{ flex: 1 }}>
          <Input
            placeholder="Full name (e.g. QS Dr John Doe)"
            value={speaker.name}
            onChange={v => update('name', v)}
          />
        </div>
      </div>

      <Row>
        <Select
          value={speaker.role}
          onChange={v => update('role', v)}
          options={['Faculty', 'Presenter', 'Keynote', 'Host', 'Panelist']}
        />
        <Input
          placeholder="Credentials prefix (e.g. Prof)"
          value={speaker.credentials}
          onChange={v => update('credentials', v)}
        />
      </Row>
      <div style={{ marginTop: 8 }}>
        <Input
          placeholder="Talk / module topic (max 80 chars)"
          value={speaker.topic}
          onChange={v => update('topic', v)}
          maxLength={80}
        />
      </div>
    </div>
  )
}

// ─── Hero image upload (used by the "No Speakers" deliverable) ────────────────

function HeroUpload({ value, onChange }) {
  const fileRef = useRef()
  const [uploading, setUploading] = React.useState(false)

  async function handle(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      onChange(await uploadImage(file))
    } catch (err) {
      alert('Upload failed: ' + (err.response?.data?.message || err.message))
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
      <button
        type="button"
        onClick={() => fileRef.current.click()}
        disabled={uploading}
        style={{
          width: 72, height: 48, borderRadius: 6, flexShrink: 0,
          border: '1.5px dashed #DDE3F0', background: '#F6F7FB',
          cursor: uploading ? 'wait' : 'pointer', overflow: 'hidden', padding: 0,
        }}
      >
        {uploading
          ? <span style={{ fontSize: 9, color: '#5A6485' }}>Uploading…</span>
          : value
            ? <img src={value} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ fontSize: 10, color: '#5A6485' }}>Upload</span>}
      </button>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handle} />
      {value && (
        <button
          type="button"
          onClick={() => onChange(null)}
          style={{ fontSize: 11, color: '#C9302C', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
        >
          Remove
        </button>
      )}
    </div>
  )
}

// ─── Main AdminForm ────────────────────────────────────────────────────────────

const ALL_TABS = [
  { value: 'noSpeakers',      label: 'No Speakers'  },
  { value: 'main',            label: 'Speakers'     },
  { value: 'countdown',       label: 'Countdown'    },
  { value: 'speakerCitation', label: 'Citation'     },
  { value: 'thankYou',        label: 'Thank You'    },
]

export default function AdminForm({ event, onChange, subDeliverable, onSubDeliverableChange, publishing }) {
  const [open, setOpen] = React.useState({
    publishing: true,
    template: true,
    eventInfo: true,
    schedule: true,
    venueplatform: true,
    speakers: true,
    registration: false,
    enquiries: false,
    sections: false,
    background: false,
  })

  function toggle(key) {
    setOpen(o => ({ ...o, [key]: !o[key] }))
  }

  function set(key, val) {
    onChange({ ...event, [key]: val })
  }

  function setSpeaker(index, updated) {
    const next = event.speakers.map((s, i) => i === index ? updated : s)
    set('speakers', next)
  }

  function addSpeaker() {
    if (event.speakers.length >= 5) return
    set('speakers', [
      ...event.speakers,
      { id: Date.now().toString(), name: '', credentials: '', photo: null, role: 'Faculty', topic: '' },
    ])
  }

  function removeSpeaker(index) {
    set('speakers', event.speakers.filter((_, i) => i !== index))
  }

  const subTabs = ALL_TABS
  const prevCategoryRef = React.useRef(event.category)
  React.useEffect(() => {
    if (event.category !== prevCategoryRef.current) {
      prevCategoryRef.current = event.category
      onSubDeliverableChange('main')
    }
  }, [event.category])

  const SEC_DEFAULTS = {
    cpdSeal: true, subtitle: true, themedEyebrow: true,
    speakers: true, presentersEyebrow: true, metaBlock: true,
    metaDate: true, metaVenue: true, metaPlatform: true,
    registration: true, contactBar: true,
  }
  const sections = { ...SEC_DEFAULTS, ...(event.sections || {}) }
  function setSection(key, val) {
    set('sections', { ...sections, [key]: val })
  }

  const titleWords = (event.title || '').split(' ')
  const goldIdx = event.goldWordIndex ?? titleWords.length - 1

  const enquiries = event.enquiries || ['']

  function setEnquiry(i, val) {
    const next = [...enquiries]
    next[i] = val
    set('enquiries', next)
  }

  function addEnquiry() {
    if (enquiries.length >= 5) return
    set('enquiries', [...enquiries, ''])
  }

  function removeEnquiry(i) {
    set('enquiries', enquiries.filter((_, idx) => idx !== i))
  }

  return (
    <div style={{ fontFamily: "'Sora', sans-serif" }}>

      {/* ── Sub-deliverable switcher ── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 3, background: '#ECEEF5', borderRadius: 8, padding: 3,
        }}>
          {subTabs.map(tab => (
            <button
              key={tab.value}
              type="button"
              onClick={() => onSubDeliverableChange(tab.value)}
              style={{
                padding: '7px 2px', borderRadius: 6, border: 'none',
                fontSize: 10, fontWeight: 700, cursor: 'pointer',
                letterSpacing: '0.03em', textAlign: 'center',
                fontFamily: "'Sora', sans-serif",
                background: subDeliverable === tab.value ? '#000066' : 'transparent',
                color: subDeliverable === tab.value ? '#fff' : '#5A6485',
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Faculty Spotlight: speaker selector */}
        {subDeliverable === 'speakerCitation' && event.speakers?.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <Field label="Featured speaker">
              <Select
                value={String(event.selectedSpeakerIndex ?? 0)}
                onChange={v => set('selectedSpeakerIndex', Number(v))}
                options={event.speakers.map((sp, i) => ({ value: String(i), label: sp.name || `Speaker ${i + 1}` }))}
              />
            </Field>
          </div>
        )}

        {/* Countdown: days to event */}
        {subDeliverable === 'countdown' && event.dateStart && (
          <div style={{ marginTop: 10, padding: '8px 10px', background: '#F6F7FB', borderRadius: 6, border: '1px solid #DDE3F0' }}>
            {(() => {
              const today = new Date(); today.setHours(0, 0, 0, 0)
              const ev = new Date(event.dateStart + 'T00:00:00')
              const days = Math.max(0, Math.ceil((ev - today) / 86400000))
              return (
                <p style={{ margin: 0, fontSize: 11, color: '#1a1a2e', fontWeight: 500 }}>
                  Days to event: <span style={{ color: '#000066', fontWeight: 800, fontSize: 13 }}>{days}</span>
                </p>
              )
            })()}
          </div>
        )}
      </div>

      {/* ── Publishing & scope (drives the calendar guardrail) ── */}
      {publishing && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Publishing" open={open.publishing} onToggle={() => toggle('publishing')} />
          {open.publishing && (
            <>
              <Field
                label="Scope"
                hint={
                  publishing.lockChapter
                    ? (publishing.chapter
                        ? 'Locked to your chapter — cannot use HQ-reserved dates'
                        : 'Subordinate to National (HQ) — cannot use HQ-reserved dates')
                    : 'National (HQ) events reserve the date for every chapter'
                }
              >
                <Select
                  value={publishing.scope}
                  onChange={publishing.onScopeChange}
                  options={[
                    { value: 'national', label: 'National (HQ)' },
                    { value: 'chapter', label: 'State Chapter' },
                  ]}
                  disabled={publishing.lockChapter}
                />
              </Field>
              {publishing.scope === 'chapter' && (!publishing.lockChapter || publishing.chapter) && (
                <Field label="Chapter">
                  <Select
                    value={publishing.chapter || ''}
                    onChange={publishing.onChapterChange}
                    options={[
                      { value: '', label: '— Select chapter —' },
                      ...(publishing.chapters || []).map((c) => ({ value: c._id, label: c.name })),
                    ]}
                    disabled={publishing.lockChapter}
                  />
                </Field>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Template selection ── */}
      <div style={{ marginBottom: 20 }}>
        <SectionHeader title="Template" open={open.template} onToggle={() => toggle('template')} />
        {open.template && (
          <>
            <Row>
              <Field label="Category">
                <Select
                  value={event.category}
                  onChange={v => set('category', v)}
                  options={['Webinar', 'Training']}
                />
              </Field>
              <Field label="Layout">
                <Select
                  value={event.layout}
                  onChange={v => set('layout', v)}
                  options={[
                    { value: 'Left', label: 'Left-aligned' },
                    { value: 'Center', label: 'Centered' },
                  ]}
                />
              </Field>
            </Row>
            <Row>
              <Field label="Theme">
                <Select
                  value={event.theme}
                  onChange={v => set('theme', v)}
                  options={['Light', 'Dark']}
                />
              </Field>
              <Field label="Pack">
                <div style={{
                  padding: '7px 10px', border: '1.5px solid #DDE3F0', borderRadius: 6,
                  fontSize: 12, color: '#000066', fontWeight: 700, background: '#F6F7FB',
                  letterSpacing: '0.06em',
                }}>
                  {event.category === 'Webinar' ? 'W' : 'T'}-{event.layout === 'Left' ? 'L' : 'C'}{event.theme === 'Light' ? 'L' : 'D'}
                </div>
              </Field>
            </Row>
          </>
        )}
      </div>

      {/* ── Event info ── */}
      <div style={{ marginBottom: 20 }}>
        <SectionHeader title="Event Info" open={open.eventInfo} onToggle={() => toggle('eventInfo')} />
        {open.eventInfo && (
          <>
            <Field label="Event title" hint="5–60 chars. One word will be rendered in gold.">
              <Input
                value={event.title}
                onChange={v => set('title', v)}
                placeholder="e.g. Advancing Digital Cost Management in Construction"
                maxLength={60}
              />
            </Field>
            <Field label="Gold word">
              <Select
                value={goldIdx}
                onChange={v => set('goldWordIndex', Number(v))}
                options={titleWords.map((w, i) => ({ value: i, label: `${i + 1}. "${w}"` }))}
              />
            </Field>
            <Field label="Subtitle" hint="Optional, max 100 chars">
              <Input
                value={event.subtitle}
                onChange={v => set('subtitle', v)}
                placeholder="Brief description of the event"
                maxLength={100}
              />
            </Field>
            {subDeliverable === 'noSpeakers' && (
              <Field label="Hero image" hint="Shown on the 'No Speakers' view">
                <HeroUpload value={event.heroImage} onChange={url => set('heroImage', url)} />
              </Field>
            )}
            {event.category === 'Training' && (
              <Field label="Module Breakdown" hint="One module per line — shown in Training Schedule view">
                <textarea
                  style={{ ...inputStyle, minHeight: 88, resize: 'vertical', lineHeight: 1.5 }}
                  value={event.schedule || ''}
                  onChange={e => set('schedule', e.target.value)}
                  placeholder={'Day 1: Introduction to Digital Workflows\nDay 2: BIM & Quantity Surveying\nDay 3: Practical Sessions'}
                />
              </Field>
            )}
            <Row>
              <Field label="CPD Points">
                <Input
                  type="number" min={1} max={99}
                  value={event.cpdPoints}
                  onChange={v => set('cpdPoints', Number(v))}
                />
              </Field>
              <Field label="CPD Seal">
                <Select
                  value={event.cpdSealVariant}
                  onChange={v => set('cpdSealVariant', v)}
                  options={[
                    { value: 'auto', label: 'Auto (by category)' },
                    { value: 'gold', label: 'Gold seal' },
                    { value: 'red', label: 'Red seal' },
                    { value: 'hybrid', label: 'Red & Gold' },
                  ]}
                />
              </Field>
            </Row>
          </>
        )}
      </div>

      {/* ── Schedule ── */}
      <div style={{ marginBottom: 20 }}>
        <SectionHeader title="Schedule" open={open.schedule} onToggle={() => toggle('schedule')} />
        {open.schedule && (
          <>
            <Row>
              <Field label="Start date">
                <Input
                  type="date"
                  value={event.dateStart}
                  onChange={v => set('dateStart', v)}
                />
              </Field>
              <Field label="End date" hint="Leave blank for single-day">
                <Input
                  type="date"
                  value={event.dateEnd}
                  onChange={v => set('dateEnd', v)}
                />
              </Field>
            </Row>
            <Row>
              <Field label="Time">
                <Input
                  value={event.time}
                  onChange={v => set('time', v)}
                  placeholder="e.g. 9:00 AM daily"
                />
              </Field>
              <Field label="Time zone">
                <Select
                  value={event.timeZone}
                  onChange={v => set('timeZone', v)}
                  options={['WAT', 'GMT', 'UTC', 'CAT', 'EAT']}
                />
              </Field>
            </Row>
          </>
        )}
      </div>

      {/* ── Venue & Platform ── */}
      <div style={{ marginBottom: 20 }}>
        <SectionHeader title="Venue & Platform" open={open.venueplatform} onToggle={() => toggle('venueplatform')} />
        {open.venueplatform && (
          <>
            <Field label="Event format">
              <Select
                value={event.venueType}
                onChange={v => set('venueType', v)}
                options={['In-Person', 'Virtual', 'Hybrid']}
              />
            </Field>
            {event.venueType !== 'Virtual' && (
              <Row>
                <Field label="Venue name">
                  <Input
                    value={event.venuePhysical}
                    onChange={v => set('venuePhysical', v)}
                    placeholder="e.g. Eko Hotel & Suites"
                  />
                </Field>
                <Field label="City">
                  <Input
                    value={event.venueCity}
                    onChange={v => set('venueCity', v)}
                    placeholder="e.g. Lagos"
                  />
                </Field>
              </Row>
            )}
            {event.venueType !== 'In-Person' && (
              <Row>
                <Field label="Platform">
                  <Select
                    value={event.platform}
                    onChange={v => set('platform', v)}
                    options={[
                      { value: 'Zoom', label: 'Zoom' },
                      { value: 'GoogleMeet', label: 'Google Meet' },
                      { value: 'Teams', label: 'Microsoft Teams' },
                      { value: 'XSpaces', label: 'X Spaces' },
                      { value: 'YouTube', label: 'YouTube Live' },
                      { value: 'WhatsApp', label: 'WhatsApp Live' },
                    ]}
                  />
                </Field>
                <Field label="Platform note" hint="Optional">
                  <Input
                    value={event.platformNote}
                    onChange={v => set('platformNote', v)}
                    placeholder="e.g. Link via email"
                  />
                </Field>
              </Row>
            )}
          </>
        )}
      </div>

      {/* ── Speakers ── */}
      <div style={{ marginBottom: 20 }}>
        <SectionHeader title={`Speakers (${event.speakers.length}/5)`} open={open.speakers} onToggle={() => toggle('speakers')} />
        {open.speakers && (
          <>
            {event.speakers.map((s, i) => (
              <SpeakerRow
                key={s.id}
                speaker={s}
                index={i}
                onChange={updated => setSpeaker(i, updated)}
                onRemove={() => removeSpeaker(i)}
              />
            ))}
            {event.speakers.length < 5 && (
              <button
                type="button"
                onClick={addSpeaker}
                style={{
                  width: '100%', padding: '8px', borderRadius: 6,
                  border: '1.5px dashed #DDE3F0', background: '#F6F7FB',
                  color: '#000066', fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', fontFamily: "'Sora', sans-serif",
                }}
              >
                + Add speaker
              </button>
            )}
          </>
        )}
      </div>

      {/* ── Registration ── */}
      <div style={{ marginBottom: 20 }}>
        <SectionHeader title="Registration" open={open.registration} onToggle={() => toggle('registration')} />
        {open.registration && (
          <>
            <Field label="Registration URL" hint="Leave blank to hide the QR block">
              <Input
                value={event.registrationUrl}
                onChange={v => set('registrationUrl', v)}
                placeholder="niqs.org.ng/register"
              />
            </Field>
            <Field label="Registration note" hint="Optional">
              <Input
                value={event.registrationExtra}
                onChange={v => set('registrationExtra', v)}
                placeholder="e.g. Special discounts for lecturers & students"
              />
            </Field>
          </>
        )}
      </div>

      {/* ── Enquiries ── */}
      <div style={{ marginBottom: 20 }}>
        <SectionHeader title="Enquiries" open={open.enquiries} onToggle={() => toggle('enquiries')} />
        {open.enquiries && (
          <>
            {enquiries.map((n, i) => (
              <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                <Input
                  value={n}
                  onChange={v => setEnquiry(i, v)}
                  placeholder="Phone number"
                />
                {enquiries.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeEnquiry(i)}
                    style={{ background: 'none', border: 'none', color: '#C9302C', cursor: 'pointer', fontSize: 16, flexShrink: 0 }}
                  >×</button>
                )}
              </div>
            ))}
            {enquiries.length < 5 && (
              <button
                type="button"
                onClick={addEnquiry}
                style={{
                  padding: '6px 12px', borderRadius: 5,
                  border: '1.5px dashed #DDE3F0', background: 'none',
                  color: '#000066', fontSize: 11, fontWeight: 600,
                  cursor: 'pointer', fontFamily: "'Sora', sans-serif",
                }}
              >
                + Add number
              </button>
            )}
          </>
        )}
      </div>

      {/* ── Layout & Sections ── */}
      <div style={{ marginBottom: 20 }}>
        <SectionHeader title="Layout & Sections" open={open.sections} onToggle={() => toggle('sections')} />
        {open.sections && (
          <div style={{ paddingTop: 2 }}>
            <GroupLabel>Header</GroupLabel>
            <ToggleRow label="CPD seal" on={sections.cpdSeal} onChange={v => setSection('cpdSeal', v)} />

            <GroupLabel>Title area</GroupLabel>
            <ToggleRow label="Subtitle" on={sections.subtitle} onChange={v => setSection('subtitle', v)} />
            <ToggleRow label="Themed eyebrow" on={sections.themedEyebrow} onChange={v => setSection('themedEyebrow', v)} />

            <GroupLabel>Speakers</GroupLabel>
            <ToggleRow label="Show speakers section" on={sections.speakers} onChange={v => setSection('speakers', v)} />
            <ToggleRow
              label={event.category === 'Training' ? 'FACULTY label' : 'PRESENTERS label'}
              on={sections.presentersEyebrow}
              onChange={v => setSection('presentersEyebrow', v)}
              indent
            />

            <GroupLabel>Meta block</GroupLabel>
            <ToggleRow label="Show meta block" on={sections.metaBlock} onChange={v => setSection('metaBlock', v)} />
            <ToggleRow label="Date" on={sections.metaDate} onChange={v => setSection('metaDate', v)} indent />
            <ToggleRow label="Venue" on={sections.metaVenue} onChange={v => setSection('metaVenue', v)} indent />
            <ToggleRow label="Platform" on={sections.metaPlatform} onChange={v => setSection('metaPlatform', v)} indent />

            <GroupLabel>Footer</GroupLabel>
            <ToggleRow label="Registration block" on={sections.registration} onChange={v => setSection('registration', v)} />
            <ToggleRow label="Contact bar" on={sections.contactBar} onChange={v => setSection('contactBar', v)} />
          </div>
        )}
      </div>

      {/* ── Background ── */}
      <div style={{ marginBottom: 20 }}>
        <SectionHeader title="Background" open={open.background} onToggle={() => toggle('background')} />
        {open.background && (
          <BackgroundPicker
            value={event.backgroundId}
            onChange={v => set('backgroundId', v)}
            theme={event.theme}
          />
        )}
      </div>

    </div>
  )
}
