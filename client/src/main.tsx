import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import App from './App.js';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, refetchOnWindowFocus: false },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || '/'}>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);

// pwa: register the service worker under the app's base path (e.g. /ll/) so the
// board is installable + works offline. scoped to BASE_URL.
if ('serviceWorker' in navigator) {
  const base = import.meta.env.BASE_URL; // "/ll/" or "/"
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${base}sw.js`, { scope: base }).catch(() => {});
  });
}
