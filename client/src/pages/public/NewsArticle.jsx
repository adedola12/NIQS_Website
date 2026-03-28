import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../api/axios';
import PageHero from '../../components/common/PageHero';

const FALLBACK_RELATED = [
  { _id: '1', slug: 'niqs-annual-conference-2026', title: 'NIQS Annual Conference 2026 Announced', excerpt: 'Conference details for the 34th Annual Conference in Abuja.', image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400', date: '2026-03-15', category: 'Conference' },
  { _id: '2', slug: 'new-qs-bill-passes-senate', title: 'New QS Bill Passes Second Reading', excerpt: 'Legislative update on the Quantity Surveyors Registration Act.', image: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=400', date: '2026-03-10', category: 'Legislation' },
  { _id: '3', slug: 'niqs-signs-mou-with-rics', title: 'NIQS Signs MoU with RICS', excerpt: 'International reciprocity partnership expanded.', image: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=400', date: '2026-03-01', category: 'International' },
];

export default function NewsArticle() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    API.get(`/news/${slug}`)
      .then(res => {
        const data = res.data?.data || res.data;
        setArticle(data);
        if (data?.category) {
          API.get(`/news?category=${data.category}&limit=3`)
            .then(r => {
              const d = r.data?.data || r.data;
              if (Array.isArray(d)) setRelated(d.filter(n => n.slug !== slug).slice(0, 3));
            })
            .catch(() => setRelated(FALLBACK_RELATED));
        }
      })
      .catch(() => {
        setArticle({
          title: slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          content: '<p>This article is currently unavailable. Please check back later or browse other news articles.</p>',
          excerpt: 'Article content is loading or unavailable.',
          image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1000',
          date: new Date().toISOString(),
          category: 'News',
          author: 'NIQS Communications',
        });
        setRelated(FALLBACK_RELATED);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <>
        <PageHero title="Loading…" />
        <section style={{ background: '#fff' }}>
          <div className="ct" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
            <p style={{ color: 'var(--color-txt-3)' }}>Loading article…</p>
          </div>
        </section>
      </>
    );
  }

  if (!article) {
    return (
      <>
        <PageHero title="Article Not Found" />
        <section style={{ background: '#fff' }}>
          <div className="ct" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
            <p>The requested article could not be found. <Link to="/news" style={{ color: 'var(--color-gold)', fontWeight: 600 }}>Browse all news →</Link></p>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHero
        label={article.category || 'News'}
        title={article.title}
        backgroundImage={article.image}
      />

      <section style={{ background: '#fff' }}>
        <div className="ct" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
          <div className="art-layout">
            {/* Main article */}
            <div className="art-body">
              {article.image && (
                <img
                  src={article.image}
                  alt={article.title}
                  style={{ width: '100%', maxHeight: 440, objectFit: 'cover', display: 'block' }}
                />
              )}
              <div className="art-content">
                {/* Meta */}
                <div style={{ display: 'flex', gap: '.8rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1.2rem', borderBottom: '1px solid var(--color-bdr)' }}>
                  <span className="card-tag">{article.category || 'News'}</span>
                  <span style={{ fontSize: '.76rem', color: 'var(--color-txt-3)' }}>
                    {new Date(article.date || article.createdAt).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                  {article.author && (
                    <span style={{ fontSize: '.76rem', color: 'var(--color-txt-3)' }}>By {article.author}</span>
                  )}
                </div>

                {/* Content */}
                {article.content ? (
                  <div dangerouslySetInnerHTML={{ __html: article.content }} />
                ) : (
                  <p>{article.excerpt || article.description}</p>
                )}

                {/* Share */}
                <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-bdr)' }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '.82rem', color: 'var(--color-navy)', marginBottom: '.8rem', letterSpacing: '-.02em' }}>Share this article</div>
                  <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                      target="_blank" rel="noopener noreferrer" className="btn bo" style={{ padding: '6px 16px', fontSize: '.72rem' }}
                    >Twitter / X</a>
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                      target="_blank" rel="noopener noreferrer" className="btn bo" style={{ padding: '6px 16px', fontSize: '.72rem' }}
                    >Facebook</a>
                    <a
                      href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&title=${encodeURIComponent(article.title)}`}
                      target="_blank" rel="noopener noreferrer" className="btn bo" style={{ padding: '6px 16px', fontSize: '.72rem' }}
                    >LinkedIn</a>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <aside>
              <div className="aside-box">
                <h4>Related Articles</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {related.map(n => (
                    <Link to={`/news/${n.slug}`} key={n._id} style={{ display: 'flex', gap: '.8rem', alignItems: 'flex-start', textDecoration: 'none' }}>
                      <img
                        src={n.image || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=120'}
                        alt={n.title}
                        style={{ width: 72, height: 52, objectFit: 'cover', borderRadius: 8, flexShrink: 0, border: '1px solid var(--color-bdr)' }}
                      />
                      <div>
                        <span className="card-tag" style={{ fontSize: '.54rem', marginBottom: '.25rem' }}>{n.category || 'News'}</span>
                        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '.82rem', color: 'var(--color-navy)', lineHeight: 1.3, letterSpacing: '-.02em' }}>{n.title}</div>
                        <div style={{ fontSize: '.68rem', color: 'var(--color-txt-3)', marginTop: '.2rem' }}>
                          {new Date(n.date || n.createdAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="aside-box">
                <h4>Categories</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
                  {['Conference', 'Legislation', 'International', 'Examinations', 'Chapter News', 'Events'].map(cat => (
                    <Link key={cat} to={`/news?category=${cat}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.5rem .6rem', borderRadius: 8, fontSize: '.8rem', color: 'var(--color-txt-2)', transition: 'background .15s' }}
                      onMouseOver={e => e.currentTarget.style.background = 'var(--color-off)'}
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {cat} <span style={{ fontSize: '.6rem', color: 'var(--color-txt-3)' }}>→</span>
                    </Link>
                  ))}
                </div>
              </div>

              <Link to="/news" className="btn bo" style={{ display: 'block', textAlign: 'center', width: '100%' }}>
                ← All News
              </Link>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
