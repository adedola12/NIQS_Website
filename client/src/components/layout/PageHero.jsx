import React from 'react';

/**
 * Reusable page hero banner.
 *
 * Props:
 *  - label: string         — eyebrow text above the title
 *  - title: string         — main heading text
 *  - titleHighlight: string — portion of the title rendered in gold (wrapped in <em>)
 *  - backgroundImage: string — optional URL for a background photo
 */
const PageHero = ({ label, title, titleHighlight, backgroundImage }) => {
  // Build the title with an optional highlighted portion
  const renderTitle = () => {
    if (!titleHighlight || !title.includes(titleHighlight)) {
      return title;
    }
    const parts = title.split(titleHighlight);
    return (
      <>
        {parts[0]}
        <em>{titleHighlight}</em>
        {parts[1]}
      </>
    );
  };

  return (
    <section className="ph">
      {backgroundImage && (
        <img src={backgroundImage} alt="" className="ph-bg" aria-hidden="true" />
      )}
      <div className="ct">
        {label && <div className="ey">{label}</div>}
        <h1 className="sh">{renderTitle()}</h1>
      </div>
    </section>
  );
};

export default PageHero;
