import React, { forwardRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import backgrounds from './backgrounds.json'
import { getCategoryConfig } from './categories.js'

// ─── Brand tokens ──────────────────────────────────────────────────────────────
const GOLD = '#D9B650'
const NAVY = '#000066'
const WHITE = '#FFFFFF'
const FD = "'Bricolage Grotesque', sans-serif"
const FB = "'Sora', sans-serif"

// ─── Canvas (fixed) ────────────────────────────────────────────────────────────
const CW = 1080
const CH = 1350

// ─── Grid zone heights (all in canvas px) ─────────────────────────────────────
const PAD       = 60    // side + top padding
const ROW_GAP   = 24    // gap between rows
const HEADER_H  = 130   // logo + badge zone
const SPEAKER_H = 480   // speaker band (never changes)
const META_H    = 200   // meta block
const BAR_H     = 80    // contact bar (absolute at bottom)
const PAD_BOT   = BAR_H + ROW_GAP  // 104 — bottom padding reserves space for bar

// 1fr title zone resolves to:
// CH - PAD - PAD_BOT - HEADER_H - 3*ROW_GAP - SPEAKER_H - META_H
// = 1350 - 60 - 104 - 130 - 72 - 480 - 200 = 304px
const TITLE_H = CH - PAD - PAD_BOT - HEADER_H - 3 * ROW_GAP - SPEAKER_H - META_H

// Content width (inside horizontal padding)
const CONTENT_W = CW - 2 * PAD   // 960px

// ─── Speaker card sizing ──────────────────────────────────────────────────────
// Gap between cards by display count
const CARD_GAP = { 1: 24, 2: 24, 3: 20, 4: 18, 5: 16 }

function getCardW(displayCount, gapOverride) {
  const gap = gapOverride ?? CARD_GAP[displayCount] ?? 18
  return Math.floor((CONTENT_W - (displayCount - 1) * gap) / displayCount)
}

// 5th speaker (title zone) card dimensions
const TITLE_CARD_W = 180
const TITLE_CARD_GAP = 24

// ─── Typography ───────────────────────────────────────────────────────────────
// Title font size by speaker count (canvas px)
const TITLE_FS = { 0: 66, 1: 66, 2: 66, 3: 62, 4: 56, 5: 52 }

// ─── Background resolver ──────────────────────────────────────────────────────
function resolveBg(backgroundId, theme) {
  const themeKey = (theme || 'Dark').toLowerCase()
  return (
    backgrounds.find(b => b.id === backgroundId) ??
    backgrounds.find(b => b.theme === themeKey) ??
    backgrounds[0]
  )
}
function bgStyle(entry) {
  if (!entry) return { background: NAVY }
  if (entry.type === 'image')    return { backgroundImage: `url("${entry.path}")`, backgroundSize: 'cover', backgroundPosition: 'center' }
  if (entry.type === 'solid')    return { background: entry.color }
  if (entry.type === 'gradient') return { backgroundImage: entry.value }
  return { background: NAVY }
}

// ─── Date helpers ─────────────────────────────────────────────────────────────
const MO = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
function formatDateRange(start, end) {
  if (!start) return ''
  const a = new Date(start + 'T00:00:00')
  if (!end || end === start) return `${a.getDate()} ${MO[a.getMonth()]} ${a.getFullYear()}`
  const b = new Date(end + 'T00:00:00')
  if (a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear())
    return `${a.getDate()}–${b.getDate()} ${MO[a.getMonth()]} ${a.getFullYear()}`
  return `${a.getDate()} ${MO[a.getMonth()]} – ${b.getDate()} ${MO[b.getMonth()]} ${b.getFullYear()}`
}
function daysUntil(dateStart) {
  if (!dateStart) return 0
  const today = new Date(); today.setHours(0,0,0,0)
  return Math.max(0, Math.ceil((new Date(dateStart + 'T00:00:00') - today) / 86400000))
}

// ─── Section defaults ─────────────────────────────────────────────────────────
const SEC_DEF = {
  cpdSeal: true, subtitle: true, themedEyebrow: true,
  speakers: true, presentersEyebrow: true,
  metaDate: true, metaVenue: true, metaPlatform: true,
  registration: true, contactBar: true,
}
function getSec(ev) { return { ...SEC_DEF, ...(ev.sections || {}) } }

// ─── Primitives ───────────────────────────────────────────────────────────────

function Eyebrow({ label, center = false, mb = 10 }) {
  const rule = (
    <span style={{ display: 'inline-block', width: 20, height: 2, background: GOLD, borderRadius: 2, flexShrink: 0 }} />
  )
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: mb, justifyContent: center ? 'center' : 'flex-start' }}>
      {center && rule}{rule}
      <span style={{ fontFamily: FB, fontSize: 14, fontWeight: 700, color: GOLD, letterSpacing: '0.22em', textTransform: 'uppercase', lineHeight: 1 }}>
        {label}
      </span>
      {center && rule}
    </div>
  )
}

function GoldTitle({ title, goldWordIndex, fontSize, center = false }) {
  const words = (title || '').split(' ')
  const gi = goldWordIndex ?? words.length - 1
  return (
    <h1 style={{
      fontFamily: FD, fontSize, fontWeight: 800,
      color: 'var(--fl-ink)', letterSpacing: '-0.04em', lineHeight: 0.98,
      margin: 0, textAlign: center ? 'center' : 'left',
    }}>
      {words.map((w, i) => (
        <span key={i}>
          {i === gi ? <span style={{ color: GOLD }}>{w}</span> : w}
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </h1>
  )
}

function CpdSeal({ points, variant, category }) {
  const isRed = variant === 'red' || (variant === 'auto' && category === 'Webinar')
  const src   = isRed ? '/assets/seal-red.png' : '/assets/seal-gold.png'
  const unit  = category === 'Webinar' ? 'PTS' : 'UNITS'
  const sz    = 90
  return (
    <div style={{ width: sz, height: sz, flexShrink: 0, position: 'relative' }}>
      <img src={src} alt="" crossOrigin="anonymous"
        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: FB, fontSize: 13, fontWeight: 700, color: WHITE, letterSpacing: '0.16em', lineHeight: 1, textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>CPD</span>
        <span style={{ fontFamily: FD, fontSize: 36, fontWeight: 800, color: WHITE, lineHeight: 1, margin: '2px 0', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>{points}</span>
        <span style={{ fontFamily: FB, fontSize: 12, fontWeight: 700, color: WHITE, letterSpacing: '0.16em', lineHeight: 1, textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>{unit}</span>
      </div>
    </div>
  )
}

// Height-agnostic speaker card — photo fills remaining space, text anchored below
function SpeakerCard({ speaker, cardW }) {
  return (
    <div style={{ width: cardW, flexShrink: 0, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {/* Photo — flex:1 fills all available height */}
      {speaker?.photo ? (
        <div style={{ flex: 1, minHeight: 0, borderRadius: 8, overflow: 'hidden' }}>
          <img src={speaker.photo} alt={speaker.name} crossOrigin="anonymous"
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }} />
        </div>
      ) : (
        <div style={{
          flex: 1, minHeight: 0, borderRadius: 8,
          background: 'var(--fl-surface)',
          border: '1px solid var(--fl-surface-border)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          overflow: 'hidden',
        }}>
          <div style={{ width: '52%', height: '72%', background: 'var(--fl-silhouette)', borderRadius: '50% 50% 0 0' }} />
        </div>
      )}
      {/* Text — fixed height at bottom */}
      <div style={{ flexShrink: 0, paddingTop: 10 }}>
        <p style={{ fontFamily: FB, fontSize: 17, fontWeight: 700, color: 'var(--fl-ink)', letterSpacing: '-0.01em', lineHeight: 1.2, margin: '0 0 4px' }}>
          {speaker?.name || ''}
        </p>
        <p style={{ fontFamily: FB, fontSize: 14, fontWeight: 400, color: 'var(--fl-ink-dim)', lineHeight: 1.3, margin: 0 }}>
          {speaker?.topic || ''}
        </p>
      </div>
    </div>
  )
}

// ─── Platform icon ────────────────────────────────────────────────────────────
const PLATFORM_ICONS = { Zoom: '/assets/icon-zoom.svg', GoogleMeet: '/assets/icon-meet.svg', XSpaces: '/assets/icon-x.svg' }
function PlatformIcon({ platform, size }) {
  const src = PLATFORM_ICONS[platform]
  if (!src) return <div style={{ width: size, height: size, borderRadius: 3, background: GOLD, flexShrink: 0 }} />
  return <img src={src} alt={platform} style={{ width: size, height: size, flexShrink: 0, objectFit: 'contain' }} crossOrigin="anonymous" />
}

// ─── Meta + QR block ─────────────────────────────────────────────────────────
function MetaQrBlock({ event, sec, cfg, registerUrl }) {
  const dateStr  = formatDateRange(event.dateStart, event.dateEnd)
  const timeSub  = [event.time, event.timeZone].filter(Boolean).join(' · ')
  const venueVal = event.venueCity ? `${event.venueCity} + Online` : event.venuePhysical
  const venueSub = event.venuePhysical !== venueVal ? event.venuePhysical : ''
  const platLabel = { GoogleMeet: 'Google Meet', XSpaces: 'X Spaces' }[event.platform] ?? event.platform

  const cells = []
  if (sec.metaDate && dateStr)
    cells.push({ key: 'date', icon: 'date', label: 'DATE', val: dateStr, sub: timeSub })
  if (cfg.showHost && event.host)
    cells.push({ key: 'host', icon: 'host', label: cfg.hostLabel, val: event.host, sub: '' })
  if (sec.metaVenue && event.venueType !== 'Virtual' && event.venuePhysical)
    cells.push({ key: 'venue', icon: 'venue', label: 'VENUE', val: venueVal, sub: venueSub })
  if (sec.metaPlatform && event.venueType !== 'In-Person' && event.platform)
    cells.push({ key: 'plat', icon: event.platform, label: 'PLATFORM', val: platLabel, sub: event.platformNote || 'Link Via Mail' })

  const iconSz = 22
  const url    = event.registrationUrl ? event.registrationUrl.replace(/^https?:\/\//, '') : ''
  const fullUrl = event.registrationUrl
    ? (event.registrationUrl.startsWith('http') ? event.registrationUrl : `https://${event.registrationUrl}`)
    : ''
  const qrTarget = registerUrl || fullUrl  // QR points to the live registration page once the event is saved
  const qrSz = 88
  const showQr = cfg.showRegistration && sec.registration && qrTarget

  function MetaIcon({ type }) {
    if (type === 'date') return (
      <svg width={iconSz} height={iconSz} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
        <rect x="3" y="5" width="18" height="16" rx="2" stroke={GOLD} strokeWidth="1.8"/>
        <path d="M3 9h18M8 3v4M16 3v4" stroke={GOLD} strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    )
    if (type === 'venue') return (
      <svg width={iconSz} height={iconSz} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
        <path d="M12 22s8-7.5 8-13a8 8 0 10-16 0c0 5.5 8 13 8 13z" stroke={GOLD} strokeWidth="1.8"/>
        <circle cx="12" cy="9" r="2.5" stroke={GOLD} strokeWidth="1.8"/>
      </svg>
    )
    if (type === 'host') return (
      <svg width={iconSz} height={iconSz} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
        <path d="M3 21h18M5 21V8l7-4 7 4v13M10 21v-5h4v5" stroke={GOLD} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
    return <PlatformIcon platform={type} size={iconSz} />
  }

  if (!cells.length && !showQr) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{
        background: 'rgba(0,0,20,0.72)', borderRadius: 12,
        padding: '18px 20px',
        display: 'flex', gap: 16, alignItems: 'center',
        backdropFilter: 'blur(4px)',
      }}>
        <div style={{ flex: 1, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          {cells.map((cell, i) => (
            <React.Fragment key={cell.key}>
              {i > 0 && <div style={{ width: 1, background: 'rgba(217,182,80,0.35)', alignSelf: 'stretch' }} />}
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flex: 1 }}>
                <MetaIcon type={cell.icon} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: FB, fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: '0.22em', textTransform: 'uppercase', margin: '0 0 4px', lineHeight: 1 }}>{cell.label}</p>
                  <p style={{ fontFamily: FB, fontSize: 18, fontWeight: 700, color: WHITE, letterSpacing: '-0.01em', lineHeight: 1.15, margin: 0 }}>{cell.val}</p>
                  {cell.sub && <p style={{ fontFamily: FB, fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.6)', lineHeight: 1.2, margin: '4px 0 0' }}>{cell.sub}</p>}
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
        {showQr && (
          <>
            <div style={{ width: 1, background: 'rgba(217,182,80,0.35)', alignSelf: 'stretch' }} />
            <div style={{ background: WHITE, padding: 5, borderRadius: 4, lineHeight: 0, flexShrink: 0 }}>
              <QRCodeSVG value={qrTarget} size={qrSz} level="M" fgColor={NAVY} />
            </div>
          </>
        )}
      </div>
      {cfg.showRegistration && sec.registration && (url || registerUrl) && (
        <p style={{ fontFamily: FB, fontSize: 14, fontWeight: 400, color: 'var(--fl-ink-faint)', margin: 0, textAlign: 'center' }}>
          Scan to register{url ? <> or visit <span style={{ color: GOLD, fontWeight: 600 }}>{url}</span></> : ''}
        </p>
      )}
    </div>
  )
}

// ─── Contact bar (full-width, absolute at bottom) ─────────────────────────────
function ContactBar({ enquiries, center = false }) {
  const phones = (enquiries || []).filter(Boolean).join('  ·  ')
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, height: BAR_H,
      background: 'var(--fl-bar-bg)',
      display: 'flex', alignItems: 'center',
      justifyContent: center ? 'center' : 'space-between',
      paddingLeft: PAD, paddingRight: PAD,
      gap: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ display: 'inline-block', width: 22, height: 2, background: GOLD, borderRadius: 2, flexShrink: 0 }} />
        <span style={{ fontFamily: FB, fontSize: 13, fontWeight: 700, color: 'var(--fl-bar-text)', letterSpacing: '0.22em', textTransform: 'uppercase' }}>ENQUIRIES</span>
        <span style={{ fontFamily: FB, fontSize: 17, fontWeight: 400, color: 'var(--fl-bar-text)' }}>{phones}</span>
      </div>
      {!center && (
        <span style={{ fontFamily: FB, fontSize: 15, fontStyle: 'italic', color: 'var(--fl-bar-dim)' }}>niqs.org.ng</span>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ZONE CONTENT COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Title zone — 'main' deliverable ──────────────────────────────────────────
function TitleZoneMain({ event, sec, cfg, center, speakerCount, isFive, speakers }) {
  const goldIdx   = event.goldWordIndex ?? (event.title || '').split(' ').length - 1
  const eyebrow   = cfg.eyebrow
  const titleFs   = TITLE_FS[speakerCount] ?? 66
  const showSeal  = cfg.isCpd && sec.cpdSeal
  const sealProps = { points: event.cpdPoints || 0, variant: event.cpdSealVariant || 'auto', category: event.category }

  if (isFive) {
    // 5-speaker: title left, 5th speaker card right
    const fifthSpeaker = speakers[4]
    return (
      <div style={{ display: 'flex', gap: TITLE_CARD_GAP, alignItems: 'stretch', height: '100%' }}>
        {/* Left: eyebrow + title + subtitle */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
          {sec.themedEyebrow && <Eyebrow label={eyebrow} center={center} mb={10} />}
          <GoldTitle title={event.title} goldWordIndex={goldIdx} fontSize={titleFs} center={center} />
          {sec.subtitle && event.subtitle && (
            <p style={{ fontFamily: FB, fontSize: 17, fontWeight: 400, color: 'var(--fl-ink-dim)', lineHeight: 1.45, margin: '10px 0 0' }}>
              {event.subtitle}
            </p>
          )}
        </div>
        {/* Right: 5th speaker card — fills height of title zone */}
        <SpeakerCard speaker={fifthSpeaker} cardW={TITLE_CARD_W} />
      </div>
    )
  }

  // Standard layout: full-width title + CPD seal right
  return (
    <div style={{ height: '100%', overflow: 'hidden' }}>
      {sec.themedEyebrow && <Eyebrow label={eyebrow} center={center} mb={10} />}
      {center ? (
        <div style={{ textAlign: 'center' }}>
          <GoldTitle title={event.title} goldWordIndex={goldIdx} fontSize={titleFs} center />
          {sec.subtitle && event.subtitle && (
            <p style={{ fontFamily: FB, fontSize: 18, fontWeight: 400, color: 'var(--fl-ink-dim)', lineHeight: 1.45, margin: '10px auto 0', maxWidth: '84%' }}>
              {event.subtitle}
            </p>
          )}
          {showSeal && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
              <CpdSeal {...sealProps} />
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <GoldTitle title={event.title} goldWordIndex={goldIdx} fontSize={titleFs} />
            {sec.subtitle && event.subtitle && (
              <p style={{ fontFamily: FB, fontSize: 18, fontWeight: 400, color: 'var(--fl-ink-dim)', lineHeight: 1.45, margin: '10px 0 0' }}>
                {event.subtitle}
              </p>
            )}
          </div>
          {showSeal && <CpdSeal {...sealProps} />}
        </div>
      )}
    </div>
  )
}

// ─── Title zone — 'noSpeakers' deliverable ────────────────────────────────────
function TitleZoneNoSpeakers({ event, sec, cfg, center }) {
  const goldIdx   = event.goldWordIndex ?? (event.title || '').split(' ').length - 1
  const eyebrow   = cfg.eyebrow
  const showSeal  = cfg.isCpd && sec.cpdSeal
  const sealProps = { points: event.cpdPoints || 0, variant: event.cpdSealVariant || 'auto', category: event.category }
  return (
    <div style={{ height: '100%', overflow: 'hidden' }}>
      {sec.themedEyebrow && <Eyebrow label={eyebrow} center={center} mb={10} />}
      {center ? (
        <div style={{ textAlign: 'center' }}>
          <GoldTitle title={event.title} goldWordIndex={goldIdx} fontSize={TITLE_FS[0]} center />
          {sec.subtitle && event.subtitle && (
            <p style={{ fontFamily: FB, fontSize: 18, fontWeight: 400, color: 'var(--fl-ink-dim)', lineHeight: 1.45, margin: '10px auto 0', maxWidth: '84%' }}>
              {event.subtitle}
            </p>
          )}
          {showSeal && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
              <CpdSeal {...sealProps} />
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <GoldTitle title={event.title} goldWordIndex={goldIdx} fontSize={TITLE_FS[0]} />
            {sec.subtitle && event.subtitle && (
              <p style={{ fontFamily: FB, fontSize: 18, fontWeight: 400, color: 'var(--fl-ink-dim)', lineHeight: 1.45, margin: '10px 0 0' }}>
                {event.subtitle}
              </p>
            )}
          </div>
          {showSeal && <CpdSeal {...sealProps} />}
        </div>
      )}
    </div>
  )
}

// ─── Speaker band — 'main' deliverable ───────────────────────────────────────
function SpeakerBandMain({ event, sec, cfg, center, speakerCount, isFive, speakers }) {
  const displayCount   = isFive ? 4 : speakerCount
  const gap            = CARD_GAP[isFive ? 4 : speakerCount] ?? 18
  const cardW          = displayCount > 0 ? getCardW(displayCount, gap) : 0
  const displaySpeakers = speakers.slice(0, displayCount)
  const presLabel      = cfg.peopleLabel
  const sealProps      = { points: event.cpdPoints || 0, variant: event.cpdSealVariant || 'auto', category: event.category }

  return (
    <div style={{ height: SPEAKER_H, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {sec.presentersEyebrow && sec.speakers && displaySpeakers.length > 0 && (
        <Eyebrow label={presLabel} center={center} mb={12} />
      )}
      {sec.speakers && displaySpeakers.length > 0 && (
        <div style={{
          flex: 1, minHeight: 0,
          display: 'flex', gap,
          justifyContent: center ? 'center' : 'flex-start',
          alignItems: 'stretch',
        }}>
          {displaySpeakers.map((sp, i) => (
            <SpeakerCard key={sp.id ?? i} speaker={sp} cardW={cardW} />
          ))}
          {/* For 5-speaker layout: CPD seal fills the remaining space to the right */}
          {isFive && cfg.isCpd && sec.cpdSeal && (
            <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', paddingBottom: 10 }}>
              <CpdSeal {...sealProps} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Hero image zone — 'noSpeakers' deliverable ───────────────────────────────
function HeroImageZone({ event }) {
  return (
    <div style={{
      height: SPEAKER_H, borderRadius: 10, overflow: 'hidden',
      background: 'var(--fl-surface)',
      border: '1px solid var(--fl-surface-border)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {event.heroImage
        ? <img src={event.heroImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : <span style={{ fontFamily: FB, fontSize: 18, color: 'var(--fl-ink-faint)', fontStyle: 'italic' }}>Hero image</span>}
    </div>
  )
}

// ─── Countdown (spans title + speaker zones) ──────────────────────────────────
function CountdownContent({ event, sec, cfg, center }) {
  const days      = daysUntil(event.dateStart)
  const goldIdx   = event.goldWordIndex ?? (event.title || '').split(' ').length - 1
  const eyebrow   = cfg.eyebrow
  const showSeal  = cfg.isCpd && sec.cpdSeal
  const sealProps = { points: event.cpdPoints || 0, variant: event.cpdSealVariant || 'auto', category: event.category }
  const spanH     = TITLE_H + ROW_GAP + SPEAKER_H  // 808px

  return (
    <div style={{ height: spanH, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden' }}>
      {/* Big number */}
      <div style={{ textAlign: center ? 'center' : 'left' }}>
        <span style={{ display: 'block', fontFamily: FD, fontSize: 300, fontWeight: 800, color: 'var(--fl-ink)', lineHeight: 0.85, letterSpacing: '-0.05em' }}>
          {days}
        </span>
        <p style={{ fontFamily: FB, fontSize: 28, fontWeight: 600, color: 'var(--fl-ink-dim)', margin: '10px 0 0', letterSpacing: '0.02em' }}>
          Days to go
        </p>
        <div style={{ width: 80, height: 2, background: GOLD, borderRadius: 2, margin: center ? '14px auto 0' : '14px 0 0' }} />
      </div>
      {/* Event info */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-end' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {sec.themedEyebrow && <Eyebrow label={eyebrow} center={center} mb={10} />}
          <GoldTitle title={event.title} goldWordIndex={goldIdx} fontSize={52} center={center} />
          {sec.subtitle && event.subtitle && (
            <p style={{ fontFamily: FB, fontSize: 18, fontWeight: 400, color: 'var(--fl-ink-dim)', lineHeight: 1.45, margin: '10px 0 0' }}>
              {event.subtitle}
            </p>
          )}
        </div>
        {showSeal && <CpdSeal {...sealProps} />}
      </div>
    </div>
  )
}

// ─── Speaker Citation (spans title + speaker zones) ───────────────────────────
function SpeakerCitationContent({ event, sec, cfg, center, speakers }) {
  const featured  = speakers[event.selectedSpeakerIndex ?? 0] ?? speakers[0]
  const goldIdx   = event.goldWordIndex ?? (event.title || '').split(' ').length - 1
  const showSeal  = cfg.isCpd && sec.cpdSeal
  const sealProps = { points: event.cpdPoints || 0, variant: event.cpdSealVariant || 'auto', category: event.category }
  const eyebrowTx = cfg.citationEyebrow
  // Occasion flyers carry a single body message; CPD flyers use the person's talk topic.
  const bodyText  = (cfg.showMessage && event.message) ? event.message : featured?.topic
  const spanH     = TITLE_H + ROW_GAP + SPEAKER_H  // 808px
  const portraitW = Math.round(CONTENT_W * 0.36)   // ~346px

  return (
    <div style={{ height: spanH, display: 'flex', gap: 24, overflow: 'hidden' }}>
      {center ? (
        // Center: portrait + text stacked
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <Eyebrow label={eyebrowTx} center mb={0} />
          <div style={{ width: portraitW, flex: 1, minHeight: 0, borderRadius: 10, overflow: 'hidden', background: 'var(--fl-surface)', border: '1px solid var(--fl-surface-border)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', position: 'relative' }}>
            {featured?.photo
              ? <img src={featured.photo} alt={featured.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
              : <div style={{ width: '38%', height: '82%', background: 'var(--fl-silhouette)', borderRadius: '50% 50% 0 0' }} />}
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: FD, fontSize: 28, fontWeight: 800, color: 'var(--fl-ink)', letterSpacing: '-0.02em', margin: 0 }}>{featured?.name || ''}</p>
            {featured?.role && <p style={{ fontFamily: FB, fontSize: 16, fontWeight: 400, color: GOLD, margin: '4px 0 0' }}>{featured.role}</p>}
            {featured?.credentials && <p style={{ fontFamily: FB, fontSize: 16, color: 'var(--fl-ink-dim)', margin: '8px auto 0', maxWidth: '88%' }}>{featured.credentials}</p>}
          </div>
        </div>
      ) : (
        // Left: text left, portrait right
        <>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <Eyebrow label={eyebrowTx} mb={12} />
              <p style={{ fontFamily: FD, fontSize: 30, fontWeight: 800, color: 'var(--fl-ink)', letterSpacing: '-0.02em', margin: '0 0 6px' }}>{featured?.name || ''}</p>
              {featured?.role && <p style={{ fontFamily: FB, fontSize: 16, fontWeight: 400, color: GOLD, margin: '0 0 18px' }}>{featured.role}</p>}
              {bodyText && (
                <p style={{ fontFamily: FB, fontSize: 17, color: 'var(--fl-ink-dim)', lineHeight: 1.7, margin: '0 0 20px', whiteSpace: 'pre-line' }}>
                  {bodyText}
                </p>
              )}
            </div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <GoldTitle title={event.title} goldWordIndex={goldIdx} fontSize={32} />
              {showSeal && <CpdSeal {...sealProps} />}
            </div>
          </div>
          {/* Portrait */}
          <div style={{ width: portraitW, flexShrink: 0, borderRadius: 10, overflow: 'hidden', background: 'var(--fl-surface)', border: '1px solid var(--fl-surface-border)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', position: 'relative' }}>
            {featured?.photo
              ? <img src={featured.photo} alt={featured.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
              : <div style={{ width: '38%', height: '82%', background: 'var(--fl-silhouette)', borderRadius: '50% 50% 0 0' }} />}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Thank You (spans title + speaker zones) ──────────────────────────────────
function ThankYouContent({ event, cfg, center }) {
  const goldIdx = event.goldWordIndex ?? (event.title || '').split(' ').length - 1
  const spanH   = TITLE_H + ROW_GAP + SPEAKER_H  // 808px
  // Sombre occasions (condolence) drop the celebratory gold accent for a muted ink tone.
  const accentColor = cfg.tone === 'sombre' ? 'var(--fl-ink-dim)' : GOLD
  const body  = (cfg.showMessage && event.message) ? event.message : event.subtitle

  return (
    <div style={{ height: spanH, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden' }}>
      {/* Hero text */}
      <div style={{ textAlign: center ? 'center' : 'left' }}>
        <h1 style={{ fontFamily: FD, fontSize: 110, fontWeight: 800, color: 'var(--fl-ink)', letterSpacing: '-0.04em', lineHeight: 0.92, margin: 0 }}>
          {cfg.heroLine1}
        </h1>
        <p style={{ fontFamily: FD, fontSize: 58, fontWeight: 700, color: accentColor, letterSpacing: '-0.02em', margin: '8px 0 0' }}>
          {cfg.heroLine2}
        </p>
        {body && (
          <p style={{ fontFamily: FB, fontSize: 18, fontWeight: 400, color: 'var(--fl-ink-dim)', lineHeight: 1.45, margin: '20px 0 0', whiteSpace: 'pre-line', ...(center && { maxWidth: '84%', marginLeft: 'auto', marginRight: 'auto' }) }}>
            {body}
          </p>
        )}
      </div>
      {/* Divider */}
      <div style={{ width: 80, height: 2, background: accentColor, borderRadius: 2, ...(center && { marginLeft: 'auto', marginRight: 'auto' }) }} />
      {/* Recap card */}
      <div style={{ background: 'rgba(0,0,20,0.55)', borderRadius: 12, padding: '24px 26px', border: '0.5px solid rgba(255,255,255,0.1)' }}>
        <p style={{ fontFamily: FB, fontSize: 11, fontWeight: 700, color: accentColor, letterSpacing: '0.22em', textTransform: 'uppercase', margin: '0 0 10px' }}>
          {cfg.eyebrow}
        </p>
        <GoldTitle title={event.title} goldWordIndex={goldIdx} fontSize={34} center={center} />
        <p style={{ fontFamily: FB, fontSize: 18, fontWeight: 600, color: 'rgba(255,255,255,0.8)', margin: '10px 0 0', letterSpacing: '-0.01em' }}>
          {formatDateRange(event.dateStart, event.dateEnd)}
        </p>
        {(event.host || event.venueCity) && (
          <p style={{ fontFamily: FB, fontSize: 16, color: 'rgba(255,255,255,0.55)', margin: '5px 0 0' }}>
            {cfg.showHost && event.host
              ? event.host
              : `${event.venueCity}${event.venuePhysical ? ` · ${event.venuePhysical}` : ''}`}
          </p>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT COMPONENT — CSS Grid canvas
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Background accent overlay ────────────────────────────────────────────────
// CSS-only decorative patterns that blend into the flyer background. Gold on the
// dark theme, navy on the light theme. Exported so the AdminForm picker can reuse
// them for swatch previews (single source of truth).
export function accentBackground(accent, theme) {
  const c = (theme || 'Dark') !== 'Light' ? '217,182,80' : '0,0,102' // gold / navy
  switch (accent) {
    case 'glow':     return `radial-gradient(circle at 78% 82%, rgba(${c},0.18), transparent 55%)`
    case 'grid':     return `linear-gradient(rgba(${c},0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(${c},0.07) 1px, transparent 1px)`
    case 'dots':     return `radial-gradient(rgba(${c},0.16) 1.6px, transparent 1.8px)`
    case 'diagonal': return `repeating-linear-gradient(45deg, rgba(${c},0.06) 0, rgba(${c},0.06) 2px, transparent 2px, transparent 24px)`
    case 'bubbles':  return `radial-gradient(circle at 12% 18%, rgba(${c},0.13), transparent 22%), radial-gradient(circle at 88% 26%, rgba(${c},0.09), transparent 20%), radial-gradient(circle at 72% 82%, rgba(${c},0.13), transparent 26%), radial-gradient(circle at 22% 80%, rgba(${c},0.08), transparent 18%)`
    default:         return null // 'none' / plain
  }
}
export function accentBackgroundSize(accent) {
  if (accent === 'grid') return '64px 64px'
  if (accent === 'dots') return '30px 30px'
  return undefined
}
function AccentLayer({ accent = 'glow', theme = 'Dark' }) {
  const bgi = accentBackground(accent, theme)
  if (!bgi) return null
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
      backgroundImage: bgi, backgroundSize: accentBackgroundSize(accent),
    }} />
  )
}

// ─── Title zone — 'main' deliverable with no speaker cards (full-canvas) ───────
// Used when the Speakers section is off or no speakers are added. Centers the
// title + subtitle + CPD seal across the title+speaker rows so nothing is clipped.
function TitleZoneSolo({ event, sec, cfg, center }) {
  const goldIdx   = event.goldWordIndex ?? (event.title || '').split(' ').length - 1
  const eyebrow   = cfg.eyebrow
  const showSeal  = cfg.isCpd && sec.cpdSeal
  const sealProps = { points: event.cpdPoints || 0, variant: event.cpdSealVariant || 'auto', category: event.category }
  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: center ? 'center' : 'flex-start',
      textAlign: center ? 'center' : 'left', overflow: 'hidden',
    }}>
      {sec.themedEyebrow && <Eyebrow label={eyebrow} center={center} mb={16} />}
      <GoldTitle title={event.title} goldWordIndex={goldIdx} fontSize={center ? 74 : 78} center={center} />
      {sec.subtitle && event.subtitle && (
        <p style={{ fontFamily: FB, fontSize: 20, fontWeight: 400, color: 'var(--fl-ink-dim)', lineHeight: 1.45, margin: '16px 0 0', maxWidth: center ? '82%' : '92%' }}>
          {event.subtitle}
        </p>
      )}
      {showSeal && (
        <div style={{ marginTop: 30 }}>
          <CpdSeal {...sealProps} />
        </div>
      )}
    </div>
  )
}

const MainFlyerLeftDark = forwardRef(function MainFlyerLeftDark(
  { event, subDeliverable = 'main', registerUrl }, ref
) {
  const center  = event.layout === 'Center'
  const sec     = getSec(event)
  const bg      = resolveBg(event.backgroundId, event.theme)
  const cat     = event.category || 'Training'
  const cfg     = getCategoryConfig(cat)
  const light   = (event.theme || 'Dark') === 'Light'
  const logoSrc = light ? '/assets/lockups/lockup-white-bg.svg' : '/assets/lockups/lockup-dark-bg.svg'
  // Theme-aware ink/surface tokens — cascade to every descendant via CSS vars.
  // Dark values equal the original hardcoded colours, so the dark theme is unchanged.
  const themeVars = light ? {
    '--fl-ink': '#0B1F4B', '--fl-ink-dim': 'rgba(11,31,75,0.62)', '--fl-ink-faint': 'rgba(11,31,75,0.5)',
    '--fl-surface': 'rgba(11,31,75,0.06)', '--fl-surface-border': 'rgba(11,31,75,0.14)', '--fl-silhouette': 'rgba(11,31,75,0.2)',
    '--fl-bar-bg': '#0B1F4B', '--fl-bar-text': '#FFFFFF', '--fl-bar-dim': 'rgba(255,255,255,0.55)',
  } : {
    '--fl-ink': '#FFFFFF', '--fl-ink-dim': 'rgba(255,255,255,0.62)', '--fl-ink-faint': 'rgba(255,255,255,0.5)',
    '--fl-surface': 'rgba(255,255,255,0.08)', '--fl-surface-border': 'rgba(255,255,255,0.12)', '--fl-silhouette': 'rgba(255,255,255,0.18)',
    '--fl-bar-bg': '#FFFFFF', '--fl-bar-text': '#000066', '--fl-bar-dim': 'rgba(0,0,102,0.5)',
  }

  const allSpeakers  = (event.speakers || []).filter(sp => sp.name?.trim())
  const speakerCount = subDeliverable === 'main' ? Math.min(allSpeakers.length, 5) : 0
  const isFive       = speakerCount === 5

  // Deliverables that span both title and speaker zones
  const isSpanDeliverable = ['countdown', 'speakerCitation', 'thankYou'].includes(subDeliverable)

  // 'main' with no speaker cards (section off or none added) → give the title the
  // full canvas height instead of clipping it above an empty 480px speaker band.
  const showSpeakers = subDeliverable === 'main' && sec.speakers && speakerCount > 0
  const mainSolo     = subDeliverable === 'main' && !showSpeakers
  const accent       = event.accent || 'glow'

  return (
    <div
      ref={ref}
      style={{
        width: CW, height: CH,
        display: 'grid',
        gridTemplateRows: `${HEADER_H}px 1fr ${SPEAKER_H}px ${META_H}px`,
        gridTemplateColumns: '1fr',
        padding: `${PAD}px ${PAD}px ${PAD_BOT}px ${PAD}px`,
        rowGap: ROW_GAP,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: FB,
        boxSizing: 'border-box',
        ...bgStyle(bg),
        ...themeVars,
      }}
    >
      {/* ── Absolute overlays (outside grid flow) ── */}
      {bg.type === 'image' && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,20,0.28)', pointerEvents: 'none' }} />
      )}
      <AccentLayer accent={accent} theme={event.theme} />

      {/* ── Zone 1: Header ── */}
      <div style={{
        gridRow: 1, gridColumn: 1,
        display: 'flex', alignItems: 'flex-start',
        justifyContent: center ? 'center' : 'space-between',
        gap: center ? 20 : 0,
        position: 'relative', zIndex: 1,
      }}>
        <img src={logoSrc} alt="NIQS" style={{ height: 64 }} crossOrigin="anonymous" />
        <div style={{ background: GOLD, padding: '9px 20px', borderRadius: 5, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, background: NAVY, borderRadius: '50%', display: 'inline-block', flexShrink: 0 }} />
          <span style={{ fontFamily: FB, fontSize: 13, fontWeight: 700, color: NAVY, letterSpacing: '0.18em' }}>
            {cfg.badge}
          </span>
        </div>
      </div>

      {/* ── Zone 2: Title (1fr) — main(with speakers) / noSpeakers ── */}
      {!isSpanDeliverable && !mainSolo && (
        <div style={{ gridRow: 2, gridColumn: 1, overflow: 'hidden', position: 'relative', zIndex: 1 }}>
          {subDeliverable === 'noSpeakers'
            ? <TitleZoneNoSpeakers event={event} sec={sec} cfg={cfg} center={center} />
            : <TitleZoneMain event={event} sec={sec} cfg={cfg} center={center} speakerCount={speakerCount} isFive={isFive} speakers={allSpeakers} />
          }
        </div>
      )}

      {/* ── Zone 3: Speaker band (480px) — main(with speakers) / noSpeakers ── */}
      {!isSpanDeliverable && !mainSolo && (
        <div style={{ gridRow: 3, gridColumn: 1, overflow: 'hidden', position: 'relative', zIndex: 1 }}>
          {subDeliverable === 'noSpeakers'
            ? <HeroImageZone event={event} />
            : <SpeakerBandMain event={event} sec={sec} cfg={cfg} center={center} speakerCount={speakerCount} isFive={isFive} speakers={allSpeakers} />
          }
        </div>
      )}

      {/* ── Zones 2+3 combined span — span deliverables OR main-without-speakers ── */}
      {(isSpanDeliverable || mainSolo) && (
        <div style={{ gridRow: '2 / 4', gridColumn: 1, overflow: 'hidden', position: 'relative', zIndex: 1 }}>
          {mainSolo                             && <TitleZoneSolo event={event} sec={sec} cfg={cfg} center={center} />}
          {subDeliverable === 'countdown'       && <CountdownContent event={event} sec={sec} cfg={cfg} center={center} />}
          {subDeliverable === 'speakerCitation' && <SpeakerCitationContent event={event} sec={sec} cfg={cfg} center={center} speakers={allSpeakers} />}
          {subDeliverable === 'thankYou'        && <ThankYouContent event={event} cfg={cfg} center={center} />}
        </div>
      )}

      {/* ── Zone 4: Meta block (200px) — always ── */}
      <div style={{ gridRow: 4, gridColumn: 1, overflow: 'hidden', position: 'relative', zIndex: 1 }}>
        <MetaQrBlock event={event} sec={sec} cfg={cfg} registerUrl={registerUrl} />
      </div>

      {/* ── Contact bar: absolute at bottom, full canvas width ── */}
      {sec.contactBar && <ContactBar enquiries={event.enquiries || []} center={center} />}
    </div>
  )
})

export default MainFlyerLeftDark
