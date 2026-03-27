import React, { useState } from 'react';
import API from '../../api/axios';
import PageHero from '../../components/common/PageHero';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [status, setStatus] = useState(null); // 'success' | 'error' | null
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);

    try {
      await API.post('/contact', formData);
      setStatus('success');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch {
      setStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHero
        title="Contact Us"
        subtitle="Get in touch with the Nigerian Institute of Quantity Surveyors"
        breadcrumbs={[{ label: 'Contact' }]}
      />

      <section className="section">
        <div className="ct">
          <div className="two-col contact-layout">
            {/* Contact Info */}
            <div className="contact-info">
              <h2 className="sh">Our Office</h2>
              <div className="contact-details">
                <div className="info-row">
                  <span className="info-icon">📍</span>
                  <div>
                    <strong>National Secretariat</strong>
                    <p>NIQS House, Plot 759 Cadastral Zone,<br />
                    Central Business District,<br />
                    Abuja, FCT, Nigeria</p>
                  </div>
                </div>

                <div className="info-row">
                  <span className="info-icon">📞</span>
                  <div>
                    <strong>Phone</strong>
                    <p>
                      <a href="tel:+2349012345678">+234 901 234 5678</a><br />
                      <a href="tel:+2348012345678">+234 801 234 5678</a>
                    </p>
                  </div>
                </div>

                <div className="info-row">
                  <span className="info-icon">✉️</span>
                  <div>
                    <strong>Email</strong>
                    <p>
                      <a href="mailto:info@niqs.org.ng">info@niqs.org.ng</a><br />
                      <a href="mailto:secretary@niqs.org.ng">secretary@niqs.org.ng</a>
                    </p>
                  </div>
                </div>

                <div className="info-row">
                  <span className="info-icon">🕐</span>
                  <div>
                    <strong>Office Hours</strong>
                    <p>Monday — Friday: 8:00 AM — 5:00 PM<br />
                    Saturday — Sunday: Closed</p>
                  </div>
                </div>

                <div className="info-row">
                  <span className="info-icon">🌐</span>
                  <div>
                    <strong>Social Media</strong>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <a href="https://twitter.com/naborgs" target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">Twitter</a>
                      <a href="https://facebook.com/niaborgs" target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">Facebook</a>
                      <a href="https://linkedin.com/company/niaborgs" target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">LinkedIn</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="contact-form-wrap">
              <h2 className="sh">Send a Message</h2>

              {status === 'success' && (
                <div className="toast toast-success" style={{ marginBottom: '1rem', padding: '1rem', borderRadius: 8, background: '#e8f5e9', color: '#2e7d32' }}>
                  Your message has been sent successfully. We will get back to you shortly.
                </div>
              )}
              {status === 'error' && (
                <div className="toast toast-error" style={{ marginBottom: '1rem', padding: '1rem', borderRadius: 8, background: '#fce4ec', color: '#c62828' }}>
                  Failed to send your message. Please try again or contact us directly.
                </div>
              )}

              <form className="form" onSubmit={handleSubmit}>
                <div className="form-row" style={{ display: 'flex', gap: '1rem' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Full Name *</label>
                    <input type="text" name="name" className="input" placeholder="Your full name" value={formData.name} onChange={handleChange} required />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Email Address *</label>
                    <input type="email" name="email" className="input" placeholder="your.email@example.com" value={formData.email} onChange={handleChange} required />
                  </div>
                </div>

                <div className="form-row" style={{ display: 'flex', gap: '1rem' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Phone Number</label>
                    <input type="tel" name="phone" className="input" placeholder="+234..." value={formData.phone} onChange={handleChange} />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Subject *</label>
                    <select name="subject" className="input" value={formData.subject} onChange={handleChange} required>
                      <option value="" disabled>Select subject</option>
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Membership">Membership</option>
                      <option value="Examinations">Examinations</option>
                      <option value="Events">Events</option>
                      <option value="Chapters">Chapters</option>
                      <option value="Partnership">Partnership</option>
                      <option value="Complaint">Complaint</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Message *</label>
                  <textarea
                    name="message"
                    className="input"
                    placeholder="How can we help you?"
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-gold" style={{ width: '100%' }} disabled={submitting}>
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
