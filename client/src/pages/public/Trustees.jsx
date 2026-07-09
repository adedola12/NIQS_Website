import { useState, useEffect } from 'react';
import PageHero from '../../components/common/PageHero';
import API from '../../api/axios';

const FALLBACK = [
  { _id: '1', name: 'QS [Trustee Name], FNIQS, PPNIQS', title: 'Chairman', order: 0 },
  { _id: '2', name: 'QS [Trustee Name], FNIQS', title: 'Member', order: 1 },
  { _id: '3', name: 'QS [Trustee Name], FNIQS', title: 'Member', order: 2 },
];

function initials(name) {
  return name
    .replace(/^QS\s+/i, '')
    .replace(/,.*$/, '')
    .split(/\s+/)
    .filter(w => /^[A-Za-z]/.test(w))
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');
}

export default function Trustees() {
  const [members, setMembers] = useState(FALLBACK);

  useEffect(() => {
    API.get('/exco?scope=bot')
      .then(res => {
        const data = res.data?.exco || res.data?.data || res.data;
        if (Array.isArray(data) && data.length > 0) {
          setMembers(data.filter(m => m.isActive !== false));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <PageHero
        label="Governance"
        title="Incorporated Board of Trustees"
        titleHighlight="Trustees"
        backgroundImage="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1400&q=80&fit=crop"
      />

      <section style={{ background: '#fff' }}>
        <div className="ct" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
          <div className="ey">Custodians of the Institute</div>
          <h2 className="sh">The <em>Board of Trustees</em></h2>
          <p className="sd" style={{ marginBottom: '3rem' }}>
            The Incorporated Board of Trustees holds the Institute's assets in trust and safeguards
            its long-term interests, drawn from NIQS's most distinguished Fellows and Past Presidents.
          </p>

          <div className="leader-grid">
            {members.map(m => (
              <div className="lcard" key={m._id}>
                <div className="lcard-img-wrap">
                  {m.image ? (
                    <img className="lcard-img" src={m.image} alt={m.name} />
                  ) : (
                    <div
                      className="lcard-img"
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'linear-gradient(135deg, #0B1F4B 0%, #16306e 100%)',
                        color: 'var(--color-gold)', fontFamily: 'var(--font-heading)',
                        fontSize: '2.6rem', fontWeight: 700, letterSpacing: '.04em',
                      }}
                    >
                      {initials(m.name)}
                    </div>
                  )}
                </div>
                <div className="lcard-body">
                  <div className="lcard-name">{m.name}</div>
                  <div className="lcard-role">{m.title}</div>
                  {m.state && <div className="lcard-state">{m.state}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
