import { useState, useEffect } from 'react';
import PageHero from '../../components/common/PageHero';
import LeaderCard from '../../components/common/LeaderCard';
import API from '../../api/axios';

export default function Trustees() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/exco?scope=bot')
      .then(res => {
        const data = res.data?.exco || res.data?.data || res.data;
        if (Array.isArray(data) && data.length > 0) {
          setMembers(data.filter(m => m.isActive !== false));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
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

          {loading && members.length === 0 ? (
            <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--color-txt-3)', fontSize: '.85rem' }}>
              Loading board of trustees…
            </div>
          ) : (
            <div className="leader-grid">
              {members.map(m => <LeaderCard key={m._id} member={m} />)}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
