import React from 'react';

/**
 * Full-page loading spinner with NIQS branding.
 *
 * Props:
 *  - message: string — optional message below the brand (default: none)
 */
const LoadingSpinner = ({ message }) => {
  return (
    <div className="loading-overlay">
      <div className="spinner" />
      <span className="loading-brand">NIQS</span>
      <span className="loading-sub">
        {message || 'Nigerian Institute of Quantity Surveyors'}
      </span>
    </div>
  );
};

export default LoadingSpinner;
