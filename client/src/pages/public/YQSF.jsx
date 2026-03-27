import React from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../../components/common/PageHero';

export default function YQSF() {
  return (
    <>
      <PageHero
        title="Young Quantity Surveyors Forum"
        subtitle="Empowering the next generation of QS professionals"
        breadcrumbs={[{ label: 'Young QS Forum' }]}
      />

      <section className="section">
        <div className="ct">
          <div className="two-col">
            <div>
              <h2 className="sh">About the Forum</h2>
              <p>
                The Young Quantity Surveyors Forum (YQSF) is a dedicated platform within NIQS
                for quantity surveyors under the age of 40 or those within their first ten years
                of professional practice. The forum was established to address the unique needs,
                challenges, and aspirations of young professionals entering the field.
              </p>
              <p>
                YQSF serves as a bridge between academic training and professional practice,
                providing mentorship, networking opportunities, and career development resources
                for its members. The forum organizes workshops, hackathons, and seminars on
                emerging trends in the built environment, including BIM, sustainability, and
                digital transformation.
              </p>
              <p>
                Through the YQSF, NIQS ensures that the profession remains vibrant, innovative,
                and attractive to young Nigerians, while preparing the next generation of leaders
                for the Institute.
              </p>
            </div>
            <div>
              <img
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&h=400&fit=crop"
                alt="Young professionals"
                className="rounded-img"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="ct">
          <h2 className="sh" style={{ textAlign: 'center', marginBottom: '2rem' }}>What We Offer</h2>
          <div className="grid-3">
            <div className="card">
              <div className="card-icon">🧑‍🏫</div>
              <h3>Mentorship Programme</h3>
              <p>Pairing young QS professionals with experienced Fellows for career guidance, knowledge transfer, and professional development.</p>
            </div>
            <div className="card">
              <div className="card-icon">💻</div>
              <h3>Tech & Innovation</h3>
              <p>Workshops on BIM, cost estimation software, AI in construction, and digital tools transforming the QS profession.</p>
            </div>
            <div className="card">
              <div className="card-icon">🏆</div>
              <h3>Young QS Awards</h3>
              <p>Annual awards recognizing outstanding contributions by young quantity surveyors to the profession and community.</p>
            </div>
            <div className="card">
              <div className="card-icon">🌐</div>
              <h3>Networking Events</h3>
              <p>Regular meetups, social events, and conferences designed to build connections among young professionals nationwide.</p>
            </div>
            <div className="card">
              <div className="card-icon">📖</div>
              <h3>Exam Preparation</h3>
              <p>Study groups, mock exams, and revision workshops to help aspiring QS professionals pass the TPC and professional exams.</p>
            </div>
            <div className="card">
              <div className="card-icon">✈️</div>
              <h3>International Exposure</h3>
              <p>Opportunities to participate in international QS conferences, exchange programmes, and collaborative projects.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section cta-section">
        <div className="ct" style={{ textAlign: 'center' }}>
          <h2 className="sh">Join the Young QS Forum</h2>
          <p className="sd" style={{ maxWidth: 600, margin: '0 auto 2rem' }}>
            Are you a young quantity surveyor looking to accelerate your career? Join the YQSF
            community and connect with peers and mentors across Nigeria.
          </p>
          <Link to="/membership" className="btn btn-gold">Get Started</Link>
        </div>
      </section>
    </>
  );
}
