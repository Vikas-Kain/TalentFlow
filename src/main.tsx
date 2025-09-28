import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Initialize MSW and seed database
async function enableMocking() {
  const { worker } = await import('./api/msw-browser');
  const { seedDatabase } = await import('./api/db');

  // Start MSW worker with explicit scope for production
  await worker.start({
    onUnhandledRequest: 'bypass',
    // This is the CRUCIAL part for deployed environments.
    // It tells the worker exactly where to find its script file.
    serviceWorker: {
      url: '/mockServiceWorker.js',
    },
  });

  // Seed the database
  await seedDatabase();
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
