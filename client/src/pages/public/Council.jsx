import { useState, useEffect } from 'react';
import PageHero from '../../components/common/PageHero';
import LeaderCard from '../../components/common/LeaderCard';
import API from '../../api/axios';

export default function Council() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/exco?scope=national')
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
        title="National Executive Council"
        titleHighlight="Council"
        backgroundImage="https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1400&q=80&fit=crop"
      />

      <section style={{ background: '#fff' }}>
        <div className="ct" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
          <div className="ey">2025–2027 Administration</div>
          <h2 className="sh">Council <em>Members</em></h2>
          <p className="sd" style={{ marginBottom: '2rem' }}>
            The National Executive Council oversees the strategic direction and governance of NIQS,
            elected at the Annual General Meeting.
          </p>

          {loading && members.length === 0 ? (
            <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--color-txt-3)', fontSize: '.85rem' }}>
              Loading council members…
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
