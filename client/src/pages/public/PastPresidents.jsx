import React from 'react';
import PageHero from '../../components/common/PageHero';

const pastPresidents = [
  { name: 'QS. (Alhaji) Kabiru Ibrahim, FNIQS', term: '2020 — 2024', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=350&fit=crop' },
  { name: 'QS. (Chief) Obafemi Onashile, FNIQS', term: '2016 — 2020', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=350&fit=crop' },
  { name: 'QS. (Dr.) Joseph Olusola, FNIQS', term: '2012 — 2016', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=350&fit=crop' },
  { name: 'QS. (Mrs.) Mercy Iyortyer, FNIQS', term: '2008 — 2012', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=350&fit=crop' },
  { name: 'QS. (Alhaji) Garba Abubakar, FNIQS', term: '2004 — 2008', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=350&fit=crop' },
  { name: 'QS. (Chief) Emmanuel Adedipe, FNIQS', term: '2000 — 2004', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=350&fit=crop' },
  { name: 'QS. (Prof.) Danjuma Musa, FNIQS', term: '1996 — 2000', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=350&fit=crop' },
  { name: 'QS. Samuel Okoye, FNIQS', term: '1992 — 1996', image: 'https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?w=300&h=350&fit=crop' },
  { name: 'QS. (Alhaji) Aliyu Ndagi, FNIQS', term: '1988 — 1992', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=350&fit=crop' },
  { name: 'QS. (Chief) Adebayo Aderibigbe, FNIQS', term: '1984 — 1988', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=350&fit=crop' },
  { name: 'QS. Ikechukwu Onuigbo, FNIQS', term: '1980 — 1984', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=350&fit=crop' },
  { name: 'QS. Olufemi Bankole, FNIQS', term: '1976 — 1980', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=350&fit=crop' },
];

export default function PastPresidents() {
  return (
    <>
      <PageHero
        title="Past Presidents"
        subtitle="Honoring the leaders who have shaped the Institute since 1969"
        breadcrumbs={[{ label: 'Leadership', to: '/leadership/council' }, { label: 'Past Presidents' }]}
      />

      <section className="section">
        <div className="ct">
          <p className="sd" style={{ textAlign: 'center', maxWidth: 800, margin: '0 auto 2.5rem' }}>
            The growth and prominence of NIQS today is a testament to the visionary leadership of
            its past presidents. Each leader has contributed uniquely to the development of the
            quantity surveying profession in Nigeria.
          </p>

          <div className="grid-4">
            {pastPresidents.map((p, i) => (
              <div className="ppcard" key={i}>
                <div className="ppcard-img" style={{ backgroundImage: `url(${p.image})` }} />
                <div className="ppcard-body">
                  <h3>{p.name}</h3>
                  <p className="ppcard-term">{p.term}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
