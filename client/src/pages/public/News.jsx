import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import PageHero from '../../components/common/PageHero';

const FALLBACK = [
  { _id: '1', slug: 'niqs-annual-conference-2026', title: 'NIQS Annual Conference 2026 Announced', excerpt: 'The Nigerian Institute of Quantity Surveyors has announced plans for its 2026 Annual Conference to be held in Abuja.', image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600', date: '2026-03-15', category: 'Conference' },
  { _id: '2', slug: 'new-qs-bill-passes-senate', title: 'New QS Bill Passes Second Reading in Senate', excerpt: 'A bill seeking to update the Quantity Surveyors Registration Act has passed its second reading at the Nigerian Senate.', image: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600', date: '2026-03-10', category: 'Legislation' },
  { _id: '3', slug: 'niqs-signs-mou-with-rics', title: 'NIQS Signs MoU with RICS for Reciprocity', excerpt: 'NIQS has signed a Memorandum of Understanding with the Royal Institution of Chartered Surveyors to strengthen reciprocity arrangements.', image: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=600', date: '2026-03-01', category: 'International' },
  { _id: '4', slug: 'tpc-october-results-released', title: 'TPC October 2025 Results Released', excerpt: 'The National Executive Council has ratified and released the results of the October 2025 TPC examination.', image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600', date: '2026-02-20', category: 'Examinations' },
  { _id: '5', slug: 'lagos-chapter-cpd-workshop', title: 'Lagos Chapter Hosts CPD Workshop on BIM', excerpt: 'The Lagos State Chapter of NIQS organised a successful CPD workshop on Building Information Modelling attended by over 200 members.', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600', date: '2026-02-15', category: 'Chapter News' },
  { _id: '6', slug: 'fellowship-investiture-date', title: '2026 Fellowship Investiture Date Announced', excerpt: 'The 2026 Fellowship Investiture Ceremony will hold on June 16 during the Annual Conference in Abuja.', image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600', date: '2026-02-10', category: 'Events' },
];

const CATEGORIES = ['All', 'Conference', 'Legislation', 'International', 'Examinations', 'Chapter News', 'Events'];

export default function News() {
  const [news, setNews] = useState(FALLBACK);
  const [activeCategory, setActiveCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const params = new URLSearchParams({ page, limit: 9 });
    if (activeCategory !== 'All') params.append('category', activeCategory);
    API.get(`/news?${params}`)
      .then(res => {
        const data = res.data?.data || res.data;
        if (Array.isArray(data) && data.length) {
          setNews(data);
          if (res.data?.totalPages) setTotalPages(res.data.totalPages);
          if (res.data?.pages) setTotalPages(res.data.pages);
        }
      })
      .catch(() => {});
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

          {filtered.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--color-txt-3)', marginTop: '2rem' }}>
              No news articles found in this category.
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
