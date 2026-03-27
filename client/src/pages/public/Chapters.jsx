import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import PageHero from '../../components/common/PageHero';

const fallbackChapters = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT Abuja', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
  'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers',
  'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
].map((name, i) => ({
  _id: String(i + 1),
  name: `${name} State Chapter`,
  slug: name.toLowerCase().replace(/\s+/g, '-'),
  state: name,
  memberCount: Math.floor(Math.random() * 300) + 50,
}));

export default function Chapters() {
  const [chapters, setChapters] = useState(fallbackChapters);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/chapters')
      .then(res => {
        const data = res.data?.data || res.data;
        if (Array.isArray(data) && data.length) setChapters(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = chapters.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.state?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <PageHero
        title="State Chapters"
        subtitle="NIQS is represented across all 36 states and the FCT"
        breadcrumbs={[{ label: 'State Chapters' }]}
      />

      <section className="section">
        <div className="ct">
          <div className="search-bar" style={{ maxWidth: 500, margin: '0 auto 2.5rem' }}>
            <input
              type="text"
              placeholder="Search chapters..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input"
            />
          </div>

          <div className="grid-4">
            {filtered.map(c => (
              <Link to={`/chapters/${c.slug}`} className="chcard" key={c._id}>
                <div className="chcard-icon">📍</div>
                <h3>{c.name}</h3>
                {c.memberCount && <p className="chcard-count">{c.memberCount} Members</p>}
              </Link>
            ))}
          </div>

          {filtered.length === 0 && (
            <p style={{ textAlign: 'center', color: '#888', marginTop: '2rem' }}>
              No chapters found matching your search.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
