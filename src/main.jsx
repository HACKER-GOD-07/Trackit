import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import './index.css';

// Force wipe everything once to ensure a completely clean slate
if (localStorage.getItem('nuked_data_v1') !== 'true') {
  localStorage.clear();
  localStorage.setItem('nuked_data_v1', 'true');
  
  if ('caches' in window) {
    caches.keys().then((names) => {
      names.forEach(name => caches.delete(name));
    });
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach(registration => registration.unregister());
    });
  }

  indexedDB.deleteDatabase('TrackitDB');
  
  // Small delay to ensure deletions complete before reloading
  setTimeout(() => {
    window.location.reload();
  }, 100);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
