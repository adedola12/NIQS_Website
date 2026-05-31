import API from './axios';

/** Public: lean event info for the registration page. */
export async function getPublicEvent(id) {
  const { data } = await API.get(`/events/${id}/public`);
  return data;
}

/** Public: submit a registration. Returns { eventLink, attendanceLink, cpdPoints, emailSent }. */
export async function registerForEvent(id, payload) {
  const { data } = await API.post(`/events/${id}/register`, payload);
  return data;
}

/** Public: self-claim attendance via the emailed token. */
export async function recordAttendance(token) {
  const { data } = await API.get(`/registrations/attend/${token}`);
  return data;
}

/** Admin: registrants for an event → { event, registrations }. */
export async function listRegistrations(eventId) {
  const { data } = await API.get(`/events/${eventId}/registrations`);
  return data;
}

/** Admin: override a registrant's attendance (awards/clears CPD). */
export async function setAttendance(registrationId, attended) {
  const { data } = await API.patch(`/registrations/${registrationId}/attendance`, { attended });
  return data;
}
