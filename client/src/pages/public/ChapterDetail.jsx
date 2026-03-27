import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../api/axios';
import PageHero from '../../components/common/PageHero';

export default function ChapterDetail() {
  const { slug } = useParams();
  const [chapter, setChapter] = useState(null);
  const [exco, setExco] = useState([]);
  const [events, setEvents] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    API.get(`/chapters/${slug}`)
      .then(res => {
        const data = res.data?.data || res.data;
        setChapter(data);
        if (data?._id) {
          API.get(`/exco?chapter=${data._id}`).then(r => {
            const d = r.data?.data || r.data;
            if (Array.isArray(d)) setExco(d);
          }).catch(() => {});
          API.get(`/events?chapter=${data._id}&limit=3`).then(r => {
            const d = r.data?.data || r.data;
            if (Array.isArray(d)) setEvents(d);
          }).catch(() => {});
          API.get(`/news?chapter=${data._id}&limit=3`).then(r => {
            const d = r.data?.data || r.data;
            if (Array.isArray(d)) setNews(d);
          }).catch(() => {});
        }
      })
      .catch(() => {
        // Fallback
        const stateName = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        setChapter({
          name: `${stateName} State Chapter`,
          state: stateName,
          address: `NIQS ${stateName} Chapter Secretariat`,
          description: `The ${stateName} State Chapter of the Nigerian Institute of Quantity Surveyors is one of 37 chapters across Nigeria. The chapter coordinates professional activities, organizes CPD events, and supports member welfare within the state.`,
          email: `${slug}@niqs.org.ng`,
          phone: '+234 800 000 0000',
        });
        setExco([
          { _id: '1', name: 'QS. Chairman Example, MNIQS', position: 'Chairman' },
          { _id: '2', name: 'QS. Vice Chair Example, MNIQS', position: 'Vice Chairman' },
          { _id: '3', name: 'QS. Secretary Example, MNIQS', position: 'Secretary' },
          { _id: '4', name: 'QS. Treasurer Example, MNIQS', position: 'Treasurer' },
        ]);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <>
        <PageHero title="Loading..." breadcrumbs={[{ label: 'Chapters', to: '/chapters' }, { label: '...' }]} />
        <section className="section"><div className="ct"><p>Loading chapter information...</p></div></section>
      </>
    );
  }

  if (!chapter) {
    return (
      <>
        <PageHero title="Chapter Not Found" breadcrumbs={[{ label: 'Chapters', to: '/chapters' }]} />
        <section className="section"><div className="ct"><p>The requested chapter could not be found. <Link to="/chapters">View all chapters</Link></p></div></section>
      </>
    );
  }

  return (
    <>
      <PageHero
        title={chapter.name}
        breadcrumbs={[{ label: 'Chapters', to: '/chapters' }, { label: chapter.name }]}
      />

      {/* Chapter Info */}
      <section className="section">
        <div className="ct">
          <div className="two-col">
            <div>
              <h2 className="sh">About This Chapter</h2>
              <p>{chapter.description}</p>
              {chapter.address && (
                <div className="info-row">
                  <span className="info-icon">📍</span>
                  <span>{chapter.address}</span>
                </div>
              )}
              {chapter.email && (
                <div className="info-row">
                  <span className="info-icon">✉️</span>
                  <a href={`mailto:${chapter.email}`}>{chapter.email}</a>
                </div>
              )}
              {chapter.phone && (
                <div className="info-row">
                  <span className="info-icon">📞</span>
                  <a href={`tel:${chapter.phone}`}>{chapter.phone}</a>
                </div>
              )}
            </div>
            <div>
              <img
                src={chapter.image || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop'}
                alt={chapter.name}
                className="rounded-img"
                style={{ width: '100%' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Chapter Exco */}
      {exco.length > 0 && (
        <section className="section section-alt">
          <div className="ct">
            <h2 className="sh" style={{ textAlign: 'center', marginBottom: '2rem' }}>Chapter Leadership</h2>
            <div className="grid-4">
              {exco.map(m => (
                <div className="lcard" key={m._id}>
                  <div
                    className="lcard-img"
                    style={{ backgroundImage: `url(${m.image || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=350&fit=crop'})` }}
                  />
                  <div className="lcard-body">
                    <h3>{m.name}</h3>
                    <p className="lcard-position">{m.position}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Chapter Events */}
      {events.length > 0 && (
        <section className="section">
          <div className="ct">
            <h2 className="sh" style={{ marginBottom: '1.5rem' }}>Upcoming Events</h2>
            <div className="event-list">
              {events.map(e => (
                <div className="erow" key={e._id}>
                  <div className="event-date-block">
                    <span className="event-month">{new Date(e.date).toLocaleDateString('en-NG', { month: 'short' }).toUpperCase()}</span>
                    <span className="event-day">{new Date(e.date).getDate()}</span>
                  </div>
                  <div className="event-info">
                    <h3>{e.title}</h3>
                    <p>{e.location}</p>
                  </div>
                  <span className="pill pill-outline">{e.type}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Chapter News */}
      {news.length > 0 && (
        <section className="section section-alt">
          <div className="ct">
            <h2 className="sh" style={{ marginBottom: '1.5rem' }}>Latest News</h2>
            <div className="grid-3">
              {news.map(n => (
                <Link to={`/news/${n.slug}`} className="card card-hover" key={n._id}>
                  <div className="card-img" style={{ backgroundImage: `url(${n.image || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600'})` }} />
                  <div className="card-body">
                    <h3>{n.title}</h3>
                    <p>{n.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
