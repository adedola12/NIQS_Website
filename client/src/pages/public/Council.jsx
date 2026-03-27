import { useState, useEffect } from 'react';
import PageHero from '../../components/common/PageHero';
import API from '../../api/axios';

const FALLBACK = [
  {
    _id: '1',
    name: 'Arc. Dr. [President]',
    title: 'President',
    state: 'Federal Capital Territory',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80&fit=crop&crop=face',
    order: 0,
  },
  {
    _id: '2',
    name: 'Surv. [VP North]',
    title: 'Vice President (North)',
    state: 'Kano State',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80&fit=crop&crop=face',
    order: 1,
  },
  {
    _id: '3',
    name: 'Surv. [VP South]',
    title: 'Vice President (South)',
    state: 'Lagos State',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80&fit=crop&crop=face',
    order: 2,
  },
  {
    _id: '4',
    name: 'Surv. [Secretary]',
    title: 'Honorary Secretary',
    state: 'Rivers State',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80&fit=crop&crop=face',
    order: 3,
  },
  {
    _id: '5',
    name: 'Surv. [Treasurer]',
    title: 'Honorary Treasurer',
    state: 'Ogun State',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80&fit=crop&crop=face',
    order: 4,
  },
  {
    _id: '6',
    name: 'Surv. [PRO Name]',
    title: 'Public Relations Officer',
    state: 'Delta State',
    image: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&q=80&fit=crop&crop=face',
    order: 5,
  },
];

export default function Council() {
  const [members, setMembers] = useState(FALLBACK);

  useEffect(() => {
    API.get('/exco?scope=national')
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
        title="National Executive Council"
        titleHighlight="Council"
        backgroundImage="https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1400&q=80&fit=crop"
      />

      <section style={{ background: '#fff' }}>
        <div className="ct" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
          <div className="ey">2023–2025 Administration</div>
          <h2 className="sh">Council <em>Members</em></h2>
          <p className="sd" style={{ marginBottom: '2rem' }}>
            The National Executive Council oversees the strategic direction and governance of NIQS,
            elected at the Annual General Meeting.
          </p>

          <div className="leader-grid">
            {members.map(m => (
              <div className="lcard" key={m._id}>
                <div className="lcard-img-wrap">
                  <img
                    className="lcard-img"
                    src={m.image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80&fit=crop&crop=face'}
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
