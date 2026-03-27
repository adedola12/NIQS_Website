import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../api/axios';
import PageHero from '../../components/common/PageHero';

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
        // Fetch related articles
        if (data?.category) {
          API.get(`/news?category=${data.category}&limit=3`)
            .then(r => {
              const d = r.data?.data || r.data;
              if (Array.isArray(d)) setRelated(d.filter(n => n.slug !== slug).slice(0, 3));
            })
            .catch(() => {});
        }
      })
      .catch(() => {
        // Fallback article
        setArticle({
          title: slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          content: '<p>This article is currently unavailable. Please check back later or browse other news articles.</p>',
          excerpt: 'Article content is loading or unavailable.',
          image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
          date: new Date().toISOString(),
          category: 'News',
          author: 'NIQS Communications',
        });
        setRelated([
          { _id: '1', slug: 'niqs-annual-conference-2026', title: 'NIQS Annual Conference 2026 Announced', excerpt: 'Conference details for 2026.', image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400', date: '2026-03-15', category: 'Conference' },
          { _id: '2', slug: 'new-qs-bill-passes-senate', title: 'New QS Bill Passes Second Reading', excerpt: 'Legislative update.', image: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=400', date: '2026-03-10', category: 'Legislation' },
          { _id: '3', slug: 'niqs-signs-mou-with-rics', title: 'NIQS Signs MoU with RICS', excerpt: 'International partnership.', image: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=400', date: '2026-03-01', category: 'International' },
        ]);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <>
        <PageHero title="Loading..." breadcrumbs={[{ label: 'News', to: '/news' }, { label: '...' }]} />
        <section className="section"><div className="ct"><p>Loading article...</p></div></section>
      </>
    );
  }

  if (!article) {
    return (
      <>
        <PageHero title="Article Not Found" breadcrumbs={[{ label: 'News', to: '/news' }]} />
        <section className="section">
          <div className="ct">
            <p>The requested article could not be found. <Link to="/news">Browse all news</Link></p>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHero
        title={article.title}
        breadcrumbs={[{ label: 'News', to: '/news' }, { label: article.title }]}
      />

      <section className="section">
        <div className="ct">
          <div className="article-layout">
            {/* Main Content */}
            <article className="article-main">
              <div className="article-meta" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <span className="pill">{article.category || 'News'}</span>
                <span className="article-date">
                  {new Date(article.date || article.createdAt).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
                {article.author && <span className="article-author">By {article.author}</span>}
              </div>

              {article.image && (
                <img
                  src={article.image}
                  alt={article.title}
                  className="article-hero-img"
                  style={{ width: '100%', borderRadius: 8, marginBottom: '2rem', maxHeight: 450, objectFit: 'cover' }}
                />
              )}

              {article.content ? (
                <div className="article-content" dangerouslySetInnerHTML={{ __html: article.content }} />
              ) : (
                <div className="article-content">
                  <p>{article.excerpt || article.description}</p>
                </div>
              )}

              {/* Share */}
              <div className="article-share" style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #eee' }}>
                <strong>Share this article:</strong>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">Twitter</a>
                  <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">Facebook</a>
                  <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(article.title)}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">LinkedIn</a>
                </div>
              </div>
            </article>

            {/* Sidebar */}
            <aside className="article-sidebar">
              <h3>Related Articles</h3>
              {related.map(n => (
                <Link to={`/news/${n.slug}`} className="sidebar-card" key={n._id}>
                  <div className="sidebar-card-img" style={{ backgroundImage: `url(${n.image || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=300'})` }} />
                  <div className="sidebar-card-body">
                    <span className="pill pill-sm">{n.category || 'News'}</span>
                    <h4>{n.title}</h4>
                    <span className="card-date">
                      {new Date(n.date || n.createdAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </Link>
              ))}
              <Link to="/news" className="btn btn-outline btn-sm" style={{ width: '100%', textAlign: 'center', marginTop: '1rem' }}>
                View All News
              </Link>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
