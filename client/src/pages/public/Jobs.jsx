import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import PageHero from '../../components/common/PageHero';

const fallbackJobs = [
  { _id: '1', title: 'Senior Quantity Surveyor', company: 'Julius Berger Nigeria Plc', location: 'Abuja', type: 'Full-time', salary: 'Competitive', deadline: '2026-04-15', logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=80&h=80&fit=crop' },
  { _id: '2', title: 'Project Quantity Surveyor', company: 'Dangote Industries Limited', location: 'Lagos', type: 'Full-time', salary: '₦500,000 — ₦800,000/month', deadline: '2026-04-20', logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=80&h=80&fit=crop' },
  { _id: '3', title: 'Graduate QS Trainee', company: 'CCECC Nigeria', location: 'Port Harcourt', type: 'Graduate Trainee', salary: '₦200,000 — ₦350,000/month', deadline: '2026-04-30', logo: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=80&h=80&fit=crop' },
  { _id: '4', title: 'Cost Manager', company: 'Aecom Nigeria', location: 'Lagos', type: 'Full-time', salary: 'Competitive', deadline: '2026-05-01', logo: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=80&h=80&fit=crop' },
  { _id: '5', title: 'Quantity Surveyor (Contract)', company: 'Setraco Nigeria Limited', location: 'Abuja', type: 'Contract', salary: '₦400,000 — ₦600,000/month', deadline: '2026-05-10', logo: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=80&h=80&fit=crop' },
  { _id: '6', title: 'BIM Quantity Surveyor', company: 'Lekki Free Zone Development Company', location: 'Lagos', type: 'Full-time', salary: '₦600,000 — ₦900,000/month', deadline: '2026-05-15', logo: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=80&h=80&fit=crop' },
];

export default function Jobs() {
  const [jobs, setJobs] = useState(fallbackJobs);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/jobs')
      .then(res => {
        const data = res.data?.data || res.data;
        if (Array.isArray(data) && data.length) setJobs(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHero
        title="Career Opportunities"
        subtitle="QS and construction industry job listings"
        breadcrumbs={[{ label: 'Careers' }]}
      />

      <section className="section">
        <div className="ct">
          <p className="sd" style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 2.5rem' }}>
            Explore career opportunities in quantity surveying, cost management, and the wider
            construction industry. Listings are updated regularly by employers and NIQS partners.
          </p>

          <div className="job-list">
            {jobs.map(job => (
              <div className="erow job-row" key={job._id}>
                <div className="job-logo">
                  <img
                    src={job.logo || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=80&h=80&fit=crop'}
                    alt={job.company}
                    style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover' }}
                  />
                </div>
                <div className="job-info" style={{ flex: 1 }}>
                  <h3>{job.title}</h3>
                  <div className="job-meta" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                    <span>🏢 {job.company}</span>
                    <span>📍 {job.location}</span>
                    {job.salary && <span>💰 {job.salary}</span>}
                  </div>
                </div>
                <div className="job-actions" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                  <span className="pill pill-outline">{job.type}</span>
                  {job.deadline && (
                    <span style={{ fontSize: '0.8rem', color: '#888' }}>
                      Deadline: {new Date(job.deadline).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {jobs.length === 0 && (
            <p style={{ textAlign: 'center', color: '#888', marginTop: '2rem' }}>
              No job listings available at the moment. Check back soon.
            </p>
          )}

          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <p style={{ color: '#888', marginBottom: '1rem' }}>
              Are you an employer looking to reach qualified quantity surveyors?
            </p>
            <Link to="/contact" className="btn btn-gold">Post a Job Listing</Link>
          </div>
        </div>
      </section>
    </>
  );
}
