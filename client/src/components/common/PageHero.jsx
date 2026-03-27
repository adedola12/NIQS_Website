import React from 'react';

export default function PageHero({ label, title, titleHighlight, subtitle, backgroundImage }) {
  const renderTitle = () => {
    if (!titleHighlight || !title?.includes(titleHighlight)) {
      return title;
    }
    const parts = title.split(titleHighlight);
    return (
      <>
        {parts[0]}<em>{titleHighlight}</em>{parts[1]}
      </>
    );
  };

  return (
    <div className="ph">
      <div className="ph-bg"></div>
      {backgroundImage && (
        <img className="phimg" src={backgroundImage} alt="" />
      )}
      {backgroundImage && <div className="phov"></div>}
      <div className="phcnt ct">
        {label && <span className="phlbl">{label}</span>}
        <h1 className="pht">{renderTitle()}</h1>
        {subtitle && (
          <p style={{ color: 'rgba(255,255,255,.6)', fontSize: '.9rem', maxWidth: 500, lineHeight: 1.7, marginTop: '.6rem' }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
