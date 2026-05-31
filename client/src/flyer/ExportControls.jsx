import React, { useState } from 'react'
import { flushSync } from 'react-dom'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import JSZip from 'jszip'

const EXPORT_W = 1080
const EXPORT_H = 1350

async function ensureFontsLoaded() {
  await document.fonts.ready
  const bgWeights = [300, 400, 500, 600, 700]
  const dsWeights = [600, 700, 800]
  await Promise.allSettled([
    ...bgWeights.map(w => document.fonts.load(`${w} 16px Sora`)),
    ...dsWeights.map(w => document.fonts.load(`${w} 16px Bricolage Grotesque`)),
  ])
}

// Cross-origin <img> (uploaded speaker / hero photos on Cloudinary, R2 or the
// API host) are the #1 cause of blank html2canvas output. Fetch each one and
// swap in a same-origin data URL before capture. Same-origin assets (backgrounds,
// logos, seals from /public) are left untouched.
async function inlineImages(root) {
  if (!root) return
  const imgs = Array.from(root.querySelectorAll('img'))
  await Promise.all(imgs.map(async (img) => {
    const src = img.getAttribute('src')
    if (!src || src.startsWith('data:')) return
    let absolute
    try { absolute = new URL(src, window.location.href) } catch { return }
    if (absolute.origin === window.location.origin) return
    try {
      const res = await fetch(absolute.href, { mode: 'cors' })
      const blob = await res.blob()
      const dataUrl = await new Promise((resolve, reject) => {
        const r = new FileReader()
        r.onload = () => resolve(r.result)
        r.onerror = reject
        r.readAsDataURL(blob)
      })
      img.removeAttribute('crossorigin')
      img.src = dataUrl
      if (img.decode) { try { await img.decode() } catch { /* ignore */ } }
    } catch {
      // Leave the original src — html2canvas useCORS may still capture it.
    }
  }))
}

async function captureCanvas(flyerRef) {
  const el = flyerRef.current
  if (!el) throw new Error('Flyer element not found')
  await ensureFontsLoaded()
  await inlineImages(el)
  return html2canvas(el, {
    scale: 2,
    useCORS: true,
    allowTaint: false,
    backgroundColor: null,
    width: EXPORT_W,
    height: EXPORT_H,
    logging: false,
    imageTimeout: 8000,
    onclone: async (doc) => {
      const link = doc.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;400;500;600;700;800&family=Sora:wght@300;400;500;600;700&display=swap'
      doc.head.appendChild(link)
      await doc.fonts.ready
    },
  })
}

const PACK_SUBS = [
  { value: 'noSpeakers', label: 'Main_No_Speakers' },
  { value: 'main',       label: 'Main_Speakers'    },
  { value: 'countdown',  label: 'Countdown'        },
  { value: 'thankYou',   label: 'Thank_You'        },
]

export default function ExportControls({ flyerRef, eventTitle, onSave, subDeliverable, onSubDeliverableChange, event, onEventChange }) {
  const [busy, setBusy] = useState(null)

  async function handlePNG() {
    setBusy('png')
    try {
      const canvas = await captureCanvas(flyerRef)
      const link = document.createElement('a')
      link.download = `NIQS_Flyer_${Date.now()}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (e) {
      alert('Export failed: ' + e.message)
    } finally {
      setBusy(null)
    }
  }

  async function handlePDF() {
    setBusy('pdf')
    try {
      const canvas = await captureCanvas(flyerRef)
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [EXPORT_W, EXPORT_H] })
      pdf.addImage(imgData, 'PNG', 0, 0, EXPORT_W, EXPORT_H)
      pdf.save(`NIQS_Flyer_${Date.now()}.pdf`)
    } catch (e) {
      alert('Export failed: ' + e.message)
    } finally {
      setBusy(null)
    }
  }

  async function handleExportPack() {
    setBusy('pack')
    const zip = new JSZip()
    const originalSub = subDeliverable
    const originalSpeakerIdx = event.selectedSpeakerIndex ?? 0
    const speakers = (event.speakers || []).filter(sp => sp.name?.trim())
    let packError = null

    // Non-faculty sub-deliverables
    for (const { value, label } of PACK_SUBS) {
      try {
        flushSync(() => onSubDeliverableChange(value))
        await new Promise(r => setTimeout(r, 120))
        const canvas = await captureCanvas(flyerRef)
        const blob = await new Promise(r => canvas.toBlob(r, 'image/png'))
        zip.file(`NIQS_${label}.png`, blob)
      } catch (e) { packError = e; break }
    }

    // Faculty Spotlight — one PNG per named speaker
    if (!packError && speakers.length > 0) {
      for (let i = 0; i < speakers.length; i++) {
        try {
          flushSync(() => {
            onSubDeliverableChange('speakerCitation')
            onEventChange({ ...event, selectedSpeakerIndex: i })
          })
          await new Promise(r => setTimeout(r, 120))
          const canvas = await captureCanvas(flyerRef)
          const blob = await new Promise(r => canvas.toBlob(r, 'image/png'))
          const safeName = speakers[i].name.replace(/[^a-zA-Z0-9]/g, '_')
          zip.file(`NIQS_Faculty_${safeName}.png`, blob)
        } catch (e) { packError = e; break }
      }
    }

    // Restore original state
    flushSync(() => {
      onSubDeliverableChange(originalSub)
      onEventChange({ ...event, selectedSpeakerIndex: originalSpeakerIdx })
    })
    setBusy(null)

    if (packError) { alert('Pack export failed: ' + packError.message); return }

    try {
      const content = await zip.generateAsync({ type: 'blob' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(content)
      link.download = `NIQS_Flyer_Pack_${Date.now()}.zip`
      link.click()
      URL.revokeObjectURL(link.href)
    } catch (e) {
      alert('Pack export failed: ' + e.message)
    }
  }

  const btnBase = {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '8px 16px', borderRadius: 6,
    fontSize: 12, fontWeight: 600, cursor: 'pointer',
    border: 'none', transition: 'opacity 0.15s',
    fontFamily: "'Sora', sans-serif",
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={onSave} style={{ ...btnBase, background: '#F0F0FF', color: '#000066', border: '1.5px solid #000066' }}>
          <SaveIcon /> Save event
        </button>
        <button onClick={handlePNG} disabled={!!busy} style={{ ...btnBase, background: '#000066', color: '#fff', opacity: busy ? 0.6 : 1 }}>
          <DownloadIcon /> {busy === 'png' ? 'Generating…' : 'Export PNG'}
        </button>
        <button onClick={handlePDF} disabled={!!busy} style={{ ...btnBase, background: '#D9B650', color: '#000066', opacity: busy ? 0.6 : 1 }}>
          <DownloadIcon /> {busy === 'pdf' ? 'Generating…' : 'Export PDF'}
        </button>
      </div>
      <button
        onClick={handleExportPack}
        disabled={!!busy}
        style={{ ...btnBase, background: busy === 'pack' ? '#5A6485' : '#1a1a2e', color: '#D9B650', border: '1.5px solid #D9B650', opacity: busy && busy !== 'pack' ? 0.6 : 1, paddingLeft: 20, paddingRight: 20 }}
      >
        <PackIcon />
        {busy === 'pack' ? 'Exporting pack…' : 'Export full pack (.zip)'}
      </button>
    </div>
  )
}

function DownloadIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
}
function PackIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>
}
function SaveIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
}
