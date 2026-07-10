import { useState, useEffect } from 'react';
import PageHero from '../../components/common/PageHero';
import LeaderCard from '../../components/common/LeaderCard';
import API from '../../api/axios';

export default function NationalBodies() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/exco?scope=body-heads')
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
        title="National Body Chairmen"
        titleHighlight="Chairmen"
        backgroundImage="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1400&q=80&fit=crop"
      />

      <section style={{ background: '#fff' }}>
        <div className="ct" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
          <div className="ey">Specialised Bodies</div>
          <h2 className="sh">National <em>Body Chairmen</em></h2>
          <p className="sd" style={{ marginBottom: '3rem' }}>
            The chairmen and directors-general leading NIQS's national bodies — from the Fellows
            Forum and the NIQS Foundation to the QS Academy, the practice associations, the
            Examination Board and The Quantity Surveyor Journal.
          </p>

          {loading && members.length === 0 ? (
            <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--color-txt-3)', fontSize: '.85rem' }}>
              Loading national body chairmen…
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
