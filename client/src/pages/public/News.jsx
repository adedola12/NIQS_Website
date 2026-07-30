import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import PageHero from '../../components/common/PageHero';

const CATEGORIES = ['All', 'Conference', 'Legislation', 'International', 'Examinations', 'Chapter News', 'Events'];

const NOTE = { textAlign: 'center', color: 'var(--color-txt-3)', marginTop: '2rem' };

export default function News() {
  const [news, setNews] = useState([]);
  const [status, setStatus] = useState('loading');
  const [activeCategory, setActiveCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const params = new URLSearchParams({ page, limit: 9 });
    if (activeCategory !== 'All') params.append('category', activeCategory);
    setStatus('loading');
    API.get(`/news?${params}`)
      .then(res => {
        const data = res.data?.news || res.data?.data || res.data;
        setNews(Array.isArray(data) ? data : []);
        setTotalPages(res.data?.totalPages || res.data?.pages || 1);
        setStatus('ready');
      })
      .catch(() => {
        setNews([]);
        setStatus('error');
      });
  }, [page, activeCategory]);

  const filtered = activeCategory === 'All' ? news : news.filter(n => n.category === activeCategory);

  return (
    <>
      <PageHero
        label="Updates"
        title="News & Announcements"
        titleHighlight="Announcements"
        backgroundImage="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1400&q=80&fit=crop"
      />

      <section style={{ background: '#fff' }}>
        <div className="ct" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
          {/* Filter bar */}
          <div className="filter-bar">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`fbtn${activeCategory === cat ? ' on' : ''}`}
                onClick={() => { setActiveCategory(cat); setPage(1); }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* News grid */}
          {filtered.length > 0 && (
            <div className="grid-3">
              {filtered.map(n => (
                <Link to={`/news/${n.slug}`} key={n._id} style={{ textDecoration: 'none' }}>
                  <div className="card">
                    <div className="card-img-wrap">
                      <img
                        src={n.image || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600'}
                        alt={n.title}
                        className="card-img"
                      />
                    </div>
                    <div className="card-body">
                      <span className="card-tag">{n.category || 'News'}</span>
                      <div className="card-title">{n.title}</div>
                      <p className="card-text">{n.excerpt}</p>
                      <div className="card-date">
                        {new Date(n.date || n.createdAt).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {status === 'loading' && <p style={NOTE}>Loading news…</p>}

          {status === 'error' && (
            <p style={NOTE}>We could not load the news just now. Please try again shortly.</p>
          )}

          {status === 'ready' && filtered.length === 0 && (
            <p style={NOTE}>
              {activeCategory === 'All'
                ? 'No news articles have been published yet.'
                : 'No news articles in this category yet.'}
            </p>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '.5rem', marginTop: '2.5rem', alignItems: 'center' }}>
              <button className="btn bo" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Previous</button>
              <span style={{ fontSize: '.8rem', color: 'var(--color-txt-3)', padding: '0 1rem' }}>Page {page} of {totalPages}</span>
              <button className="btn bo" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
