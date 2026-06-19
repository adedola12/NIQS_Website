/**
 * Email sender — graceful by design (mirrors the optional-dependency pattern in
 * routes/upload.js). Uses nodemailer + generic SMTP when SMTP_HOST + creds are set;
 * otherwise it no-ops and returns { sent:false } so callers can fall back to
 * showing links on-screen. Configure later with:
 *   SMTP_HOST  SMTP_PORT  SMTP_USER  SMTP_PASS  SMTP_FROM  [SMTP_SECURE=true]
 */

let nodemailer = null;
try { nodemailer = require('nodemailer'); } catch (_) { /* optional */ }

let _transporter = null; // null = not built yet, false = unavailable
function getTransporter() {
  if (_transporter !== null) return _transporter;
  if (nodemailer && process.env.SMTP_HOST) {
    const port = Number(process.env.SMTP_PORT) || 587;
    _transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: String(process.env.SMTP_SECURE) === 'true' || port === 465,
      auth: (process.env.SMTP_USER || process.env.SMTP_PASS)
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    });
  } else {
    _transporter = false;
  }
  return _transporter;
}

async function sendMail({ to, subject, html, text }) {
  const tx = getTransporter();
  if (!tx) {
    console.warn(`[email] SMTP not configured — skipped "${subject}" to ${to}`);
    return { sent: false };
  }
  try {
    const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'NIQS <no-reply@niqs.org.ng>';
    const info = await tx.sendMail({ from, to, subject, html, text });
    return { sent: true, id: info.messageId };
  } catch (err) {
    console.error('[email] send failed:', err.message);
    return { sent: false, error: err.message };
  }
}

/** Preferred public base URL for links inside emails. Reuses CLIENT_URL. */
function publicBase() {
  return (process.env.PUBLIC_URL || (process.env.CLIENT_URL || '').split(',')[0] || '')
    .trim()
    .replace(/\/$/, '');
}

function fmtDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

/** Branded (navy/gold) confirmation email for a registration. */
function registrationEmailHtml(reg, event, links) {
  const NAVY = '#000066', GOLD = '#D9B650';
  const cpd = (event.flyer && event.flyer.cpdPoints) || 0;
  const when = event.endDate && String(event.endDate) !== String(event.date)
    ? `${fmtDate(event.date)} – ${fmtDate(event.endDate)}`
    : fmtDate(event.date);
  const venue = event.location || (event.flyer && (event.flyer.venueCity || event.flyer.venuePhysical)) || '';
  const modeLabel = reg.participationMode === 'virtual' ? 'Online' : 'In person';

  return `
  <div style="margin:0;padding:24px;background:#ECEEF5;font-family:'Segoe UI',Arial,sans-serif;color:#1a1a2e;">
    <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,102,.12);">
      <div style="background:${NAVY};padding:20px 28px;color:#fff;">
        <p style="margin:0;font-size:12px;letter-spacing:.16em;color:${GOLD};font-weight:700;text-transform:uppercase;">Nigerian Institute of Quantity Surveyors</p>
        <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,.75);">Registration confirmed</p>
      </div>
      <div style="padding:28px;">
        <p style="margin:0 0 4px;font-size:14px;color:#5A6485;">Hi ${reg.fullName},</p>
        <h1 style="margin:0 0 16px;font-size:22px;line-height:1.25;color:${NAVY};">You're registered for<br><span style="color:${NAVY};">${event.title}</span></h1>

        <table style="width:100%;border-collapse:collapse;font-size:14px;margin:0 0 20px;">
          <tr><td style="padding:6px 0;color:#5A6485;width:120px;">Date</td><td style="padding:6px 0;font-weight:600;">${when}</td></tr>
          ${venue ? `<tr><td style="padding:6px 0;color:#5A6485;">Venue</td><td style="padding:6px 0;font-weight:600;">${venue}</td></tr>` : ''}
          <tr><td style="padding:6px 0;color:#5A6485;">Attending</td><td style="padding:6px 0;font-weight:600;">${modeLabel}</td></tr>
          ${cpd ? `<tr><td style="padding:6px 0;color:#5A6485;">CPD points</td><td style="padding:6px 0;font-weight:600;">${cpd}</td></tr>` : ''}
        </table>

        ${cpd ? `<div style="background:#F6F7FB;border:1px solid #DDE3F0;border-radius:10px;padding:16px 18px;margin:0 0 20px;">
          <p style="margin:0 0 12px;font-size:13.5px;color:#1a1a2e;line-height:1.5;">Attend the event, then tap the button below to record your attendance and bank your <strong>${cpd} CPD point${cpd === 1 ? '' : 's'}</strong>.</p>
          <a href="${links.attendanceLink}" style="display:inline-block;background:${GOLD};color:${NAVY};text-decoration:none;font-weight:700;font-size:14px;padding:11px 22px;border-radius:8px;">I attended — claim my CPD</a>
          <p style="margin:12px 0 0;font-size:11px;color:#8892B0;word-break:break-all;">${links.attendanceLink}</p>
        </div>` : `<p style="margin:0 0 20px;font-size:13.5px;color:#5A6485;">Keep this email for your records.</p>`}

        <a href="${links.eventLink}" style="font-size:13px;color:${NAVY};font-weight:600;">View event details ↗</a>
      </div>
      <div style="background:#F6F7FB;padding:16px 28px;border-top:1px solid #DDE3F0;">
        <p style="margin:0;font-size:11px;color:#8892B0;">You're receiving this because you registered for an NIQS event. niqs.org.ng</p>
      </div>
    </div>
  </div>`;
}

/** Branded (navy/gold) acknowledgement for a submitted flyer request. */
function flyerRequestEmailHtml(reqDoc) {
  const NAVY = '#000066', GOLD = '#D9B650';
  const when = reqDoc.dateEnd && String(reqDoc.dateEnd) !== String(reqDoc.dateStart)
    ? `${fmtDate(reqDoc.dateStart)} – ${fmtDate(reqDoc.dateEnd)}`
    : fmtDate(reqDoc.dateStart);
  const venue = reqDoc.venueCity || reqDoc.venuePhysical || '';

  return `
  <div style="margin:0;padding:24px;background:#ECEEF5;font-family:'Segoe UI',Arial,sans-serif;color:#1a1a2e;">
    <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,102,.12);">
      <div style="background:${NAVY};padding:20px 28px;color:#fff;">
        <p style="margin:0;font-size:12px;letter-spacing:.16em;color:${GOLD};font-weight:700;text-transform:uppercase;">Nigerian Institute of Quantity Surveyors</p>
        <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,.75);">Flyer request received</p>
      </div>
      <div style="padding:28px;">
        <p style="margin:0 0 4px;font-size:14px;color:#5A6485;">Hi ${reqDoc.requesterName},</p>
        <h1 style="margin:0 0 16px;font-size:22px;line-height:1.25;color:${NAVY};">Thanks — we've got your request for<br><span style="color:${NAVY};">${reqDoc.title}</span></h1>
        <p style="margin:0 0 18px;font-size:14px;color:#5A6485;line-height:1.55;">Our team will design the flyer and follow up shortly. Here's a summary of what you sent:</p>

        <table style="width:100%;border-collapse:collapse;font-size:14px;margin:0 0 20px;">
          <tr><td style="padding:6px 0;color:#5A6485;width:120px;">Type</td><td style="padding:6px 0;font-weight:600;">${reqDoc.category}</td></tr>
          ${when ? `<tr><td style="padding:6px 0;color:#5A6485;">Date</td><td style="padding:6px 0;font-weight:600;">${when}</td></tr>` : ''}
          ${reqDoc.time ? `<tr><td style="padding:6px 0;color:#5A6485;">Time</td><td style="padding:6px 0;font-weight:600;">${reqDoc.time} ${reqDoc.timeZone || ''}</td></tr>` : ''}
          ${venue ? `<tr><td style="padding:6px 0;color:#5A6485;">Venue</td><td style="padding:6px 0;font-weight:600;">${venue}</td></tr>` : ''}
          ${reqDoc.cpdPoints ? `<tr><td style="padding:6px 0;color:#5A6485;">CPD points</td><td style="padding:6px 0;font-weight:600;">${reqDoc.cpdPoints}</td></tr>` : ''}
        </table>

        <p style="margin:0;font-size:13px;color:#8892B0;line-height:1.5;">If any details change, just reply to this email and let us know.</p>
      </div>
      <div style="background:#F6F7FB;padding:16px 28px;border-top:1px solid #DDE3F0;">
        <p style="margin:0;font-size:11px;color:#8892B0;">You're receiving this because you submitted a flyer request to NIQS. niqs.org.ng</p>
      </div>
    </div>
  </div>`;
}

/** Branded (navy/gold) admin password-reset email. */
function passwordResetEmailHtml(admin, link) {
  const NAVY = '#000066', GOLD = '#D9B650';
  return `
  <div style="margin:0;padding:24px;background:#ECEEF5;font-family:'Segoe UI',Arial,sans-serif;color:#1a1a2e;">
    <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,102,.12);">
      <div style="background:${NAVY};padding:20px 28px;color:#fff;">
        <p style="margin:0;font-size:12px;letter-spacing:.16em;color:${GOLD};font-weight:700;text-transform:uppercase;">NIQS Admin</p>
        <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,.75);">Password reset request</p>
      </div>
      <div style="padding:28px;">
        <p style="margin:0 0 4px;font-size:14px;color:#5A6485;">Hi ${admin.firstName || 'Admin'},</p>
        <h1 style="margin:0 0 14px;font-size:21px;line-height:1.25;color:${NAVY};">Reset your admin password</h1>
        <p style="margin:0 0 20px;font-size:14px;color:#5A6485;line-height:1.55;">We received a request to reset the password for your NIQS admin account (<strong>${admin.email}</strong>). This link expires in <strong>30 minutes</strong>.</p>
        <a href="${link}" style="display:inline-block;background:${GOLD};color:${NAVY};text-decoration:none;font-weight:700;font-size:14px;padding:12px 24px;border-radius:8px;">Reset password</a>
        <p style="margin:16px 0 0;font-size:11px;color:#8892B0;word-break:break-all;">${link}</p>
        <p style="margin:18px 0 0;font-size:13px;color:#8892B0;line-height:1.5;">Didn't request this? You can safely ignore this email — your password won't change.</p>
      </div>
      <div style="background:#F6F7FB;padding:16px 28px;border-top:1px solid #DDE3F0;">
        <p style="margin:0;font-size:11px;color:#8892B0;">NIQS admin security · niqs.org.ng</p>
      </div>
    </div>
  </div>`;
}

module.exports = { sendMail, registrationEmailHtml, flyerRequestEmailHtml, passwordResetEmailHtml, publicBase, fmtDate };
