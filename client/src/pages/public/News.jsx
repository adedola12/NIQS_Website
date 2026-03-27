import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import PageHero from '../../components/common/PageHero';

const fallbackNews = [
  { _id: '1', slug: 'niqs-annual-conference-2026', title: 'NIQS Annual Conference 2026 Announced', excerpt: 'The Nigerian Institute of Quantity Surveyors has announced plans for its 2026 Annual Conference to be held in Abuja.', image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600', date: '2026-03-15', category: 'Conference' },
  { _id: '2', slug: 'new-qs-bill-passes-senate', title: 'New QS Bill Passes Second Reading in Senate', excerpt: 'A bill seeking to update the Quantity Surveyors Registration Act has passed its second reading at the Nigerian Senate.', image: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600', date: '2026-03-10', category: 'Legislation' },
  { _id: '3', slug: 'niqs-signs-mou-with-rics', title: 'NIQS Signs MoU with RICS for Reciprocity', excerpt: 'NIQS has signed a Memorandum of Understanding with the Royal Institution of Chartered Surveyors.', image: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=600', date: '2026-03-01', category: 'International' },
  { _id: '4', slug: 'tpc-october-results-released', title: 'TPC October 2025 Results Released', excerpt: 'The National Executive Council has ratified and released the results of the October 2025 TPC examination.', image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600', date: '2026-02-20', category: 'Examinations' },
  { _id: '5', slug: 'lagos-chapter-cpd-workshop', title: 'Lagos Chapter Hosts CPD Workshop on BIM', excerpt: 'The Lagos State Chapter of NIQS organized a successful CPD workshop on Building Information Modelling.', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600', date: '2026-02-15', category: 'Chapter News' },
  { _id: '6', slug: 'fellowship-investiture-date', title: '2026 Fellowship Investiture Date Announced', excerpt: 'The 2026 Fellowship Investiture Ceremony will hold on June 16 during the Annual Conference in Abuja.', image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600', date: '2026-02-10', category: 'Events' },
];

const categories = ['All', 'Conference', 'Legislation', 'International', 'Examinations', 'Chapter News', 'Events'];

export default function News() {
  const [news, setNews] = useState(fallbackNews);
  const [activeCategory, setActiveCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
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
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, activeCategory]);

  const filtered = activeCategory === 'All' ? news : news.filter(n => n.category === activeCategory);

  return (
    <>
      <PageHero
        title="News & Announcements"
        subtitle="Stay updated with the latest from NIQS"
        breadcrumbs={[{ label: 'News' }]}
      />

      <section className="section">
        <div className="ct">
          {/* Category Tabs */}
          <div className="tabs" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            {categories.map(cat => (
              <button
                key={cat}
                className={`tab-btn ${activeCategory === cat ? 'tab-btn-active' : ''}`}
                onClick={() => { setActiveCategory(cat); setPage(1); }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* News Grid */}
          <div className="grid-3">
            {filtered.map(n => (
              <Link to={`/news/${n.slug}`} className="card card-hover" key={n._id}>
                <div className="card-img" style={{ backgroundImage: `url(${n.image || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600'})` }} />
                <div className="card-body">
                  <span className="pill">{n.category || 'News'}</span>
                  <h3>{n.title}</h3>
                  <p>{n.excerpt}</p>
                  <span className="card-date">
                    {new Date(n.date || n.createdAt).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {filtered.length === 0 && (
            <p style={{ textAlign: 'center', color: '#888', marginTop: '2rem' }}>
              No news articles found in this category.
            </p>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination" style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2.5rem' }}>
              <button
                className="btn btn-outline btn-sm"
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
              >
                Previous
              </button>
              <span style={{ display: 'flex', alignItems: 'center', padding: '0 1rem' }}>
                Page {page} of {totalPages}
              </span>
              <button
                className="btn btn-outline btn-sm"
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
