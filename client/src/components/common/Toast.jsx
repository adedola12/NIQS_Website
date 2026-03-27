import React from 'react';
import { Toaster } from 'react-hot-toast';

/**
 * Pre-configured toast container using react-hot-toast.
 * Drop <Toast /> once in your App layout and use `toast()` anywhere.
 *
 * Usage:
 *   import toast from 'react-hot-toast';
 *   toast.success('Saved!');
 *   toast.error('Something went wrong');
 */
const Toast = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#FFFFFF',
          color: '#0F1D3A',
          fontSize: '0.85rem',
          fontWeight: 500,
          borderRadius: '8px',
          boxShadow: '0 12px 48px rgba(11, 31, 75, 0.14)',
          padding: '0.8rem 1.2rem',
        },
        success: {
          iconTheme: {
            primary: '#22c55e',
            secondary: '#FFFFFF',
          },
          style: {
            borderLeft: '4px solid #22c55e',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#FFFFFF',
          },
          style: {
            borderLeft: '4px solid #ef4444',
          },
        },
      }}
    />
  );
};

export default Toast;
