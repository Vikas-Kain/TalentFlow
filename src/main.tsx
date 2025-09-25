import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Initialize MSW and seed database
async function enableMocking() {
  // The conditional check has been removed.
  // The worker will now start in both development and production modes.

  const { worker } = await import('./api/msw-browser');
  const { seedDatabase } = await import('./api/db');

  // Start MSW worker
  await worker.start({
    // It's good practice to keep this option for all environments
    onUnhandledRequest: 'bypass',
  });

  // Seed the database
  await seedDatabase();
}

// This part remains the same
enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});