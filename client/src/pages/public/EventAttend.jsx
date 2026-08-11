import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { recordAttendance } from '../../api/registrationApi';
import Icon from '../../components/common/Icon';

const NAVY = '#000066';
const GOLD = '#D9B650';
const FD = "'Bricolage Grotesque', sans-serif";
const FB = "'Sora', sans-serif";

function fmtDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

export default function EventAttend() {
  const { token } = useParams();
  const [data, setData] = useState({ loading: true });

  useEffect(() => {
    let alive = true;
    recordAttendance(token)
      .then((d) => { if (alive) setData({ loading: false, ...d }); })
      .catch((e) => { if (alive) setData({ loading: false, status: e.response?.status === 404 ? 'invalid' : 'error' }); });
    return () => { alive = false; };
  }, [token]);

  let icon = 'clock', color = '#5A6485', title = 'Checking…', body = '';

  if (!data.loading) {
    switch (data.status) {
      case 'recorded':
        icon = 'check'; color = '#166534';
        title = data.alreadyRecorded ? 'Already recorded' : 'Attendance recorded!';
        body = data.cpdPoints > 0
          ? `${data.cpdPoints} CPD point${data.cpdPoints === 1 ? '' : 's'} ${data.alreadyRecorded ? 'are' : 'have been'} banked to your record for "${data.eventTitle}".`
          : `Your attendance for "${data.eventTitle}" is confirmed.`;
        break;
      case 'too-early':
        icon = 'calendar'; color = NAVY;
        title = "Event hasn't started yet";
        body = `Come back from ${fmtDate(data.startsOn)} and open this link to claim your ${data.cpdPoints || ''} CPD point${data.cpdPoints === 1 ? '' : 's'} for "${data.eventTitle}".`;
        break;
      case 'closed':
        icon = 'clock'; color = '#92600F';
        title = 'Attendance window closed';
        body = `The attendance window for "${data.eventTitle}" has closed. Please contact the organisers if you attended.`;
        break;
      case 'invalid':
        icon = 'close'; color = '#991B1B';
        title = 'Invalid link';
        body = 'This attendance link is invalid or has expired.';
        break;
      default:
        icon = 'warning'; color = '#991B1B';
        title = 'Something went wrong';
        body = 'We could not record your attendance. Please try again later.';
    }
  }

  return (
    <div style={{ background: '#ECEEF5', minHeight: '70vh', padding: '48px 16px', fontFamily: FB }}>
      <div style={{ maxWidth: 480, margin: '0 auto', background: '#fff', borderRadius: 16, boxShadow: '0 10px 40px rgba(0, 0, 102,0.14)', padding: '36px 30px', textAlign: 'center' }}>
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#F6F7FB', display: 'flex', alignItems: 'center', justifyContent: 'center', color, margin: '0 auto 16px' }}>
          <Icon name={data.loading ? 'clock' : icon} size={30} />
        </div>
        <h1 style={{ fontFamily: FD, fontSize: 22, color: NAVY, margin: '0 0 10px' }}>
          {data.loading ? 'Recording attendance…' : title}
        </h1>
        {!data.loading && <p style={{ fontSize: 14, color: '#5A6485', lineHeight: 1.55, margin: 0 }}>{body}</p>}
        {data.status === 'recorded' && data.fullName && (
          <p style={{ fontSize: 12.5, color: '#8892B0', margin: '14px 0 0' }}>Recorded for {data.fullName}</p>
        )}
        <a href="/" style={{ display: 'inline-block', marginTop: 22, fontSize: 13, color: NAVY, fontWeight: 600 }}>← Back to niqs.org.ng</a>
      </div>
    </div>
  );
}
