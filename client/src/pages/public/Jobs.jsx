import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import PageHero from '../../components/common/PageHero';

const FALLBACK = [
  { _id: '1', title: 'Senior Quantity Surveyor', company: 'Julius Berger Nigeria Plc', location: 'Abuja, FCT', type: 'Full-time', salary: 'Competitive', deadline: '2026-04-15', logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=80&h=80&fit=crop' },
  { _id: '2', title: 'Project Quantity Surveyor', company: 'Dangote Industries Limited', location: 'Lagos', type: 'Full-time', salary: '₦500,000 — ₦800,000/month', deadline: '2026-04-20', logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=80&h=80&fit=crop' },
  { _id: '3', title: 'Graduate QS Trainee', company: 'CCECC Nigeria', location: 'Port Harcourt', type: 'Graduate Trainee', salary: '₦200,000 — ₦350,000/month', deadline: '2026-04-30', logo: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=80&h=80&fit=crop' },
  { _id: '4', title: 'Cost Manager', company: 'Aecom Nigeria', location: 'Lagos', type: 'Full-time', salary: 'Competitive', deadline: '2026-05-01', logo: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=80&h=80&fit=crop' },
  { _id: '5', title: 'Quantity Surveyor (Contract)', company: 'Setraco Nigeria Limited', location: 'Abuja, FCT', type: 'Contract', salary: '₦400,000 — ₦600,000/month', deadline: '2026-05-10', logo: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=80&h=80&fit=crop' },
  { _id: '6', title: 'BIM Quantity Surveyor', company: 'Lekki Free Zone Development Company', location: 'Lagos', type: 'Full-time', salary: '₦600,000 — ₦900,000/month', deadline: '2026-05-15', logo: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=80&h=80&fit=crop' },
];

const TYPE_COLORS = {
  'Full-time': 'var(--color-gold)',
  'Contract': 'var(--color-navy)',
  'Graduate Trainee': '#2e7d32',
  'Part-time': '#7a3dad',
};

export default function Jobs() {
  const [jobs, setJobs] = useState(FALLBACK);

  useEffect(() => {
    API.get('/jobs')
      .then(res => {
        const data = res.data?.data || res.data;
        if (Array.isArray(data) && data.length) setJobs(data);
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <PageHero
        label="Careers"
        title="Career Opportunities"
        titleHighlight="Opportunities"
        backgroundImage="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1400&q=80&fit=crop"
      />

      <section style={{ background: '#fff' }}>
        <div className="ct" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div className="ey">Job Board</div>
              <h2 className="sh" style={{ margin: 0 }}>QS Career <em>Listings</em></h2>
            </div>
            <p style={{ fontSize: '.8rem', color: 'var(--color-txt-3)', maxWidth: 360, textAlign: 'right', lineHeight: 1.6 }}>
              Explore quantity surveying and construction industry opportunities curated for NIQS members.
            </p>
          </div>

          <div className="job-list">
            {jobs.map(job => (
              <div className="jrow" key={job._id}>
                <img
                  src={job.logo || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=80&h=80&fit=crop'}
                  alt={job.company}
                  style={{ width: 52, height: 52, borderRadius: 10, objectFit: 'cover', flexShrink: 0, border: '1px solid var(--color-bdr)' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '.97rem', color: 'var(--color-navy)', marginBottom: '.2rem', letterSpacing: '-.02em' }}>{job.title}</div>
                  <div style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap', fontSize: '.76rem', color: 'var(--color-txt-3)' }}>
                    <span>🏢 {job.company}</span>
                    <span>📍 {job.location}</span>
                    {job.salary && <span>💰 {job.salary}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '.4rem', flexShrink: 0 }}>
                  <span style={{
                    fontSize: '.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em',
                    padding: '3px 10px', borderRadius: 20,
                    background: `${TYPE_COLORS[job.type] || 'var(--color-navy)'}18`,
                    color: TYPE_COLORS[job.type] || 'var(--color-navy)',
                    border: `1px solid ${TYPE_COLORS[job.type] || 'var(--color-navy)'}40`,
                  }}>
                    {job.type}
                  </span>
                  {job.deadline && (
                    <span style={{ fontSize: '.68rem', color: 'var(--color-txt-3)' }}>
                      Closes {new Date(job.deadline).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {jobs.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--color-txt-3)', marginTop: '2rem' }}>
              No job listings available at the moment. Check back soon.
            </p>
          )}

          {/* Post a job CTA */}
          <div style={{ background: 'var(--color-off)', border: '1px solid var(--color-bdr)', borderRadius: 14, padding: '2.5rem', textAlign: 'center', marginTop: '3rem' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-navy)', marginBottom: '.5rem' }}>
              Are you an employer?
            </div>
            <p style={{ fontSize: '.82rem', color: 'var(--color-txt-2)', marginBottom: '1.5rem' }}>
              Reach over 10,000 qualified quantity surveyors across Nigeria. Post your vacancy on the NIQS job board.
            </p>
            <Link to="/contact" className="btn bg">Post a Job Listing</Link>
          </div>
        </div>
      </section>
    </>
  );
}
