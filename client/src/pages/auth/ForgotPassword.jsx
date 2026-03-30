import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../../api/axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      await API.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Reset link sent! Check your email.');
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Something went wrong. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrap">
      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <img
            src="/NIQS-LOGO-PNG-NAV.png"
            alt="NIQS Logo"
            style={{ height: 64, width: 'auto', objectFit: 'contain', display: 'block', margin: '0 auto 0.5rem' }}
          />
          <span className="login-logo-sub">Nigerian Institute of Quantity Surveyors</span>
        </div>

        <h1 className="login-heading">Forgot Password</h1>
        <p className="login-subtitle">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {sent ? (
          <div className="fp-success">
            <div className="fp-success-icon">&#10003;</div>
            <h3>Check Your Email</h3>
            <p>
              We've sent a password reset link to <strong>{email}</strong>.
              Please check your inbox and follow the instructions.
            </p>
            <Link to="/login" className="bsub" style={{ display: 'block', textAlign: 'center', marginTop: '1.2rem' }}>
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="login-form">
            <div className="fg">
              <label className="flbl" htmlFor="email">Email Address</label>
              <input
                id="email"
                className="fi"
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <button type="submit" className="bsub" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <div className="login-footer" style={{ marginTop: '1.5rem' }}>
          <Link to="/login" className="login-back">
            &larr; Back to Login
          </Link>
        </div>
      </div>

      <style>{`
        .login-wrap {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--navy) 0%, var(--navy2) 60%, var(--navy3) 100%);
          padding: 2rem;
          position: relative;
          overflow: hidden;
        }
        .login-wrap::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }
        .login-card {
          position: relative;
          z-index: 2;
          background: var(--white);
          border-radius: var(--radius-lg);
          padding: 2.5rem 2.2rem;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
        }
        .login-logo {
          text-align: center;
          margin-bottom: 1.5rem;
        }
        .login-logo-text {
          display: block;
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 2rem;
          font-weight: 800;
          color: var(--navy);
          letter-spacing: 0.04em;
        }
        .login-logo-sub {
          display: block;
          font-size: 0.68rem;
          color: var(--gold);
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-top: 0.1rem;
        }
        .login-heading {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--navy);
          margin-bottom: 0.3rem;
          text-align: center;
        }
        .login-subtitle {
          font-size: 0.82rem;
          color: var(--text3);
          text-align: center;
          margin-bottom: 1.5rem;
        }
        .login-form {
          margin-bottom: 1.5rem;
        }
        .login-footer {
          text-align: center;
        }
        .login-back {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.78rem;
          color: var(--text3);
          font-weight: 600;
          transition: color 0.2s var(--ez);
        }
        .login-back:hover {
          color: var(--navy);
        }
        .fp-success {
          text-align: center;
          padding: 1rem 0;
        }
        .fp-success-icon {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #dcfce7;
          color: #22c55e;
          font-size: 1.5rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
        }
        .fp-success h3 {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--navy);
          margin-bottom: 0.5rem;
        }
        .fp-success p {
          font-size: 0.82rem;
          color: var(--text2);
          line-height: 1.6;
        }
        @media (max-width: 480px) {
          .login-card {
            padding: 1.8rem 1.4rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ForgotPassword;
