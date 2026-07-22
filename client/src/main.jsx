import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

/* Fade out the branded preloader from index.html once the app has mounted.
   Small delay so the animation reads as intentional rather than a flash. */
const splash = document.getElementById('niqs-splash');
if (splash) {
  setTimeout(() => {
    splash.classList.add('done');
    setTimeout(() => splash.remove(), 500);
  }, 400);
}
