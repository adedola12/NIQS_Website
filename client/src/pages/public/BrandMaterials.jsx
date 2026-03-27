import React, { useState, useEffect } from 'react';
import PageHero from '../../components/common/PageHero';
import API from '../../api/axios';

/* ── Placeholder data — matches the HTML file exactly ── */
const FALLBACK = [
  {
    _id: '1',
    title: 'NIQS Logo (White)',
    description: 'Primary logo for dark backgrounds. PNG, SVG, EPS formats.',
    buttonLabel: 'Download',
    fileUrl: '',
    previewType: 'image_contained',
    previewBackground: 'var(--navy)',
    previewImage: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=80&fit=crop',
    imageFilter: 'opacity:.85',
  },
  {
    _id: '2',
    title: 'NIQS Logo (Navy)',
    description: 'Primary logo for light backgrounds. PNG, SVG, EPS formats.',
    buttonLabel: 'Download',
    fileUrl: '',
    previewType: 'image_contained',
    previewBackground: '',
    previewImage: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=80&fit=crop',
    imageFilter: 'grayscale(100%) brightness(.3)',
  },
  {
    _id: '3',
    title: 'Colour Palette',
    description: 'Official NIQS colour codes — HEX, RGB, CMYK, Pantone.',
    buttonLabel: 'Download PDF',
    fileUrl: '',
    previewType: 'gradient',
    previewBackground: 'linear-gradient(135deg,var(--navy) 50%,var(--gold) 100%)',
    previewImage: '',
    imageFilter: '',
  },
  {
    _id: '4',
    title: 'Letterhead Template',
    description: 'Official NIQS letterhead in Microsoft Word and PDF formats.',
    buttonLabel: 'Download',
    fileUrl: '',
    previewType: 'image',
    previewBackground: '',
    previewImage: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&q=80&fit=crop',
    imageFilter: '',
  },
  {
    _id: '5',
    title: 'Business Card Template',
    description: 'Standard and premium member business card templates.',
    buttonLabel: 'Download',
    fileUrl: '',
    previewType: 'image',
    previewBackground: '',
    previewImage: 'https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=400&q=80&fit=crop',
    imageFilter: '',
  },
  {
    _id: '6',
    title: 'Brand Guidelines',
    description: "Comprehensive brand usage guidelines and do's & don'ts.",
    buttonLabel: 'Download PDF',
    fileUrl: '',
    previewType: 'image',
    previewBackground: '',
    previewImage: 'https://images.unsplash.com/photo-1543286386-713bdd548da4?w=400&q=80&fit=crop',
    imageFilter: '',
  },
];

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
  const [materials, setMaterials] = useState(FALLBACK);

  useEffect(() => {
    API.get('/brand-materials')
      .then(res => {
        const data = res.data;
        if (Array.isArray(data) && data.length > 0) setMaterials(data);
      })
      .catch(() => {}); // silently keep fallback on error
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
        </div>
      </section>
    </>
  );
}
