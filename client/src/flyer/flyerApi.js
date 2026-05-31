import API from '../api/axios'

/**
 * Flyer Studio data access — replaces the standalone engine's localStorage store.
 * Flyer events are regular website Events that carry a `flyer` design subdocument,
 * so the institutional calendar + date guardrail cover them automatically.
 */

/** Upload an image via the shared /api/upload endpoint; returns the stored URL. */
export async function uploadImage(file) {
  const fd = new FormData()
  fd.append('file', file)
  const { data } = await API.post('/upload', fd)
  return data.url
}

/** List events that carry a flyer design (scoped server-side by role). */
export async function listFlyerEvents() {
  const { data } = await API.get('/events/admin/all')
  const events = Array.isArray(data) ? data : (data.events || [])
  return events.filter((e) => e.hasFlyer && e.flyer)
}

/**
 * Create or update a flyer event.
 * @returns {Promise<{event, warnings, overridden}>}
 * @throws axios error on 409 conflict — inspect err.response.data.conflicts
 */
export async function saveFlyerEvent({ id, flyer, scope, chapter, force }) {
  const payload = {
    flyer,
    scope,
    chapter: scope === 'chapter' ? (chapter || null) : null,
    force: !!force,
  }
  const { data } = id
    ? await API.put(`/events/${id}`, payload)
    : await API.post('/events', payload)
  return data
}

export async function deleteFlyerEvent(id) {
  await API.delete(`/events/${id}`)
}

/** Live availability check for a date range — { ok, canOverride, hard:[], warnings:[] }. */
export async function checkDate({ start, end, scope, chapter, excludeId }) {
  const { data } = await API.get('/events/check-date', {
    params: { start, end, scope, chapter, excludeId },
  })
  return data
}

/** Lightweight calendar projection over an optional [from, to] window. */
export async function getCalendarEvents({ from, to } = {}) {
  const { data } = await API.get('/events/calendar', { params: { from, to } })
  return data.events || []
}
