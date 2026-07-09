import { useState, useEffect } from 'react';
import PageHero from '../../components/common/PageHero';
import API from '../../api/axios';

const FALLBACK = [
  {
    _id: '1',
    name: 'QS [Chairman Name], FNIQS',
    title: 'Chairman, Fellows Forum',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80&fit=crop&crop=face',
    order: 0,
  },
  {
    _id: '2',
    name: 'QS [Chairman Name], FNIQS',
    title: 'DG, NIQS Foundation',
    image: 'https://images.unsplash.com/photo-1480429370139-e0132c086e2a?w=400&q=80&fit=crop&crop=face',
    order: 1,
  },
  {
    _id: '3',
    name: 'QS [Chairman Name], FNIQS',
    title: 'Chairman, Examination Board',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80&fit=crop&crop=face',
    order: 2,
  },
];

export default function NationalBodies() {
  const [members, setMembers] = useState(FALLBACK);

  useEffect(() => {
    API.get('/exco?scope=body-heads')
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

          <div className="leader-grid">
            {members.map(m => (
              <div className="lcard" key={m._id}>
                <div className="lcard-img-wrap">
                  <img
                    className="lcard-img"
                    src={m.image || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80&fit=crop&crop=face'}
                    alt={m.name}
                  />
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
