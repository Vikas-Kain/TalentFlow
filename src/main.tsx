import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Initialize MSW and seed database
async function enableMocking() {
  if (import.meta.env.MODE !== 'development') {
    return;
  }

  const { worker } = await import('./api/msw-browser');
  const { seedDatabase } = await import('./api/db');

  // Start MSW worker
  await worker.start({
    onUnhandledRequest: 'bypass',
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
