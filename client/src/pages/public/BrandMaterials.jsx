import React, { useState, useEffect } from 'react';
import PageHero from '../../components/common/PageHero';
import API from '../../api/axios';

/* ── Preview block renderer ── */
function BCardPreview({ item }) {
  const bgStyle = item.previewBackground
    ? { background: item.previewBackground }
    : {};

  if (item.previewType === 'gradient') {
    return <div className="bcard-preview" style={bgStyle} />;
  }

  if (item.previewType === 'image_contained') {
    return (
      <div className="bcard-preview" style={bgStyle}>
        <img
          src={item.previewImage}
          alt={item.title}
          style={{ width: 160, height: 60, objectFit: 'contain', filter: item.imageFilter || 'none' }}
        />
      </div>
    );
  }

  // previewType === 'image' — full cover
  return (
    <div className="bcard-preview" style={{ padding: 0, ...bgStyle }}>
      <img
        src={item.previewImage}
        alt={item.title}
        style={{ width: '100%', height: 150, objectFit: 'cover', display: 'block' }}
      />
    </div>
  );
}

export default function BrandMaterials() {
  const [materials, setMaterials] = useState([]);
  const [status, setStatus]       = useState('loading');

  useEffect(() => {
    API.get('/brand-materials')
      .then(res => {
        const data = res.data;
        setMaterials(Array.isArray(data) ? data : []);
        setStatus('ready');
      })
      .catch(() => {
        setMaterials([]);
        setStatus('error');
      });
  }, []);

  const handleDownload = (item) => {
    if (item.fileUrl) {
      window.open(item.fileUrl, '_blank');
    }
  };

  return (
    <>
      {/* ── PAGE HERO ── */}
      <PageHero
        label="Design Resources"
        title="Brand Materials"
        titleHighlight="Materials"
        backgroundImage="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=80&fit=crop"
      />

      {/* ── BRAND KIT GRID ── */}
      <section style={{ background: '#fff' }}>
        <div className="ct">
          <div className="ey">Official Assets</div>
          <h2 className="sh">Download NIQS <em>Brand Kit</em></h2>
          <p className="sd" style={{ marginBottom: '3rem' }}>
            Official NIQS logos, colour palettes, typography, and usage guidelines for members and approved partners.
          </p>

          <div className="brand-grid">
            {materials.map((item) => (
              <div className="bcard" key={item._id}>
                <BCardPreview item={item} />
                <div className="bcard-body">
                  <h4>{item.title}</h4>
                  <p>{item.description}</p>
                  <button
                    className="btn bp"
                    style={{ padding: '.48rem .9rem', fontSize: '.74rem' }}
                    onClick={() => handleDownload(item)}
                    disabled={!item.fileUrl}
                    title={!item.fileUrl ? 'File not yet available' : ''}
                  >
                    {item.buttonLabel || 'Download'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {materials.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--color-txt-3)', marginTop: '1rem' }}>
              {status === 'loading'
                ? 'Loading brand materials…'
                : status === 'error'
                  ? 'We could not load the brand materials just now. Please try again shortly.'
                  : 'No brand materials have been published yet.'}
            </p>
          )}
        </div>
      </section>
    </>
  );
}
