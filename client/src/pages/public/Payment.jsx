import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../../components/common/PageHero';

const paymentCategories = [
  {
    title: 'Membership Dues',
    icon: '🏛️',
    description: 'Annual membership subscription for Probationers, Graduate Members (MNIQS), and Fellows (FNIQS).',
    items: [
      { label: 'Probationer Annual Dues', amount: '₦25,000' },
      { label: 'Graduate Member (MNIQS) Annual Dues', amount: '₦50,000' },
      { label: 'Fellow (FNIQS) Annual Dues', amount: '₦100,000' },
      { label: 'New Registration Fee (one-time)', amount: '₦15,000' },
    ],
  },
  {
    title: 'Examination Fees',
    icon: '📝',
    description: 'Fees for professional examinations administered by NIQS.',
    items: [
      { label: 'Test of Professional Competence (TPC)', amount: '₦75,000' },
      { label: 'General Development Exam (GDE)', amount: '₦50,000' },
      { label: 'TPC Resit Fee', amount: '₦40,000' },
      { label: 'GDE Resit Fee', amount: '₦30,000' },
    ],
  },
  {
    title: 'Event Registration',
    icon: '🎟️',
    description: 'Registration fees for NIQS conferences, workshops, and ceremonies.',
    items: [
      { label: 'Annual Conference — Member', amount: '₦50,000' },
      { label: 'Annual Conference — Non-Member', amount: '₦75,000' },
      { label: 'CPD Workshop', amount: '₦15,000' },
      { label: 'Fellowship Investiture', amount: '₦150,000' },
    ],
  },
];

export default function Payment() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedItem, setSelectedItem] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', membershipNo: '' });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <>
      <PageHero
        title="Payments"
        subtitle="Make payments for membership, examinations, and events"
        breadcrumbs={[{ label: 'Payments' }]}
      />

      {/* Payment Categories */}
      <section className="section">
        <div className="ct">
          <div className="grid-3">
            {paymentCategories.map((cat, i) => (
              <div
                className={`card card-hover ${selectedCategory === i ? 'card-selected' : ''}`}
                key={i}
                onClick={() => { setSelectedCategory(i); setSelectedItem(''); }}
                style={{ cursor: 'pointer' }}
              >
                <div className="card-icon" style={{ fontSize: '2.5rem' }}>{cat.icon}</div>
                <h3>{cat.title}</h3>
                <p>{cat.description}</p>
                <div style={{ marginTop: '1rem' }}>
                  {cat.items.map((item, j) => (
                    <div key={j} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                      <span>{item.label}</span>
                      <strong>{item.amount}</strong>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Payment Form Placeholder */}
      <section className="section section-alt">
        <div className="ct" style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 className="sh" style={{ textAlign: 'center', marginBottom: '1rem' }}>Make a Payment</h2>
          <p className="sd" style={{ textAlign: 'center', marginBottom: '2rem' }}>
            Select a payment category above, then fill in your details below to proceed.
          </p>

          <form className="form" onSubmit={e => e.preventDefault()}>
            <div className="form-group">
              <label>Payment Category</label>
              <select
                className="input"
                value={selectedCategory !== null ? selectedCategory : ''}
                onChange={e => { setSelectedCategory(Number(e.target.value)); setSelectedItem(''); }}
              >
                <option value="" disabled>Select a category</option>
                {paymentCategories.map((cat, i) => (
                  <option value={i} key={i}>{cat.title}</option>
                ))}
              </select>
            </div>

            {selectedCategory !== null && (
              <div className="form-group">
                <label>Payment Item</label>
                <select
                  className="input"
                  value={selectedItem}
                  onChange={e => setSelectedItem(e.target.value)}
                >
                  <option value="" disabled>Select item</option>
                  {paymentCategories[selectedCategory].items.map((item, j) => (
                    <option value={item.label} key={j}>{item.label} — {item.amount}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label>Full Name</label>
              <input type="text" name="name" className="input" placeholder="Enter your full name" value={formData.name} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input type="email" name="email" className="input" placeholder="Enter your email" value={formData.email} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input type="tel" name="phone" className="input" placeholder="Enter your phone number" value={formData.phone} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Membership Number (if applicable)</label>
              <input type="text" name="membershipNo" className="input" placeholder="e.g. NIQS/2024/12345" value={formData.membershipNo} onChange={handleChange} />
            </div>

            <button type="submit" className="btn btn-gold" style={{ width: '100%' }} disabled>
              Proceed to Payment (Coming Soon)
            </button>
            <p style={{ textAlign: 'center', marginTop: '1rem', color: '#888', fontSize: '0.85rem' }}>
              Online payment integration is being set up. For now, please contact the National Secretariat or visit your state chapter to make payments.
            </p>
          </form>
        </div>
      </section>
    </>
  );
}
