import API from './axios';
import { DEFAULT_EVENT } from '../flyer/defaultEvent.js';

/**
 * Flyer Request (intake) data access.
 * A FlyerRequest is a *pending* event brief submitted via the public form. It does
 * not book a calendar date — an admin turns it into a real flyer/event in the Studio.
 */

/* ── Public ── */

/** Resolve a shared-link token → { valid, scope, chapterName }. */
export async function getLinkContext(token) {
  const { data } = await API.get(`/flyer-requests/context/${token}`);
  return data;
}

/** Submit an intake request. `payload` may include a `token` from the shared link. */
export async function submitFlyerRequest(payload) {
  const { data } = await API.post('/flyer-requests', payload);
  return data;
}

/* ── Admin ── */

/** Generate a shareable intake link; returns the signed token. */
export async function generateFlyerLink({ scope, chapter } = {}) {
  const { data } = await API.post('/flyer-requests/link', { scope, chapter });
  return data.token;
}

/** List requests visible to the current admin (role-scoped server-side). */
export async function listFlyerRequests(status) {
  const { data } = await API.get('/flyer-requests', { params: status ? { status } : {} });
  return data.requests || [];
}

/** Fetch a single request (for auto-fill via the Flyer Studio deep link). */
export async function getFlyerRequest(id) {
  const { data } = await API.get(`/flyer-requests/${id}`);
  return data.request;
}

/** Update a request's status (in_progress | completed | archived) and optionally link the created event. */
export async function setFlyerRequestStatus(id, body) {
  const { data } = await API.patch(`/flyer-requests/${id}/status`, body);
  return data.request;
}

export async function deleteFlyerRequest(id) {
  await API.delete(`/flyer-requests/${id}`);
}

/* ── Mapping ── */

/**
 * Map a saved FlyerRequest → the Flyer Studio `event` shape, so the admin's form
 * auto-fills. Design choices (theme, layout, background, CPD seal style) keep the
 * Studio defaults; the requester's content overrides the demo content.
 */
export function requestToEvent(r) {
  return {
    ...DEFAULT_EVENT,
    id: null,
    category: r.category || 'Training',
    title: r.title || '',
    subtitle: r.subtitle || '',
    host: r.host || '',           // Courtesy Visit — who/where is being visited
    message: r.message || '',     // Appreciation / Congratulations / Condolence body
    goldWordIndex: null, // let the form default to the last word
    dateStart: r.dateStart || '',
    dateEnd: r.dateEnd || '',
    time: r.time || '',
    timeZone: r.timeZone || 'WAT',
    cpdPoints: r.cpdPoints || 0,
    venueType: r.venueType || 'Hybrid',
    venuePhysical: r.venuePhysical || '',
    venueCity: r.venueCity || '',
    platform: r.platform || 'Zoom',
    platformNote: r.platformNote || '',
    schedule: r.schedule || '',
    registrationUrl: r.registrationUrl || '',
    registrationExtra: r.registrationExtra || '',
    enquiries: (r.enquiries && r.enquiries.length) ? [...r.enquiries] : [''],
    speakers: (r.speakers || []).map((s, i) => ({
      id: `req-${i + 1}`,
      name: s.name || '',
      credentials: s.credentials || '',
      photo: null,
      role: s.role || 'Faculty',
      topic: s.topic || '',
    })),
  };
}
