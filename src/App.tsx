import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';

// Pages
import JobsPage from './pages/JobsPage';
import JobDetailPage from './pages/JobDetailPage';
import CandidatesPage from './pages/CandidatesPage';
import CandidateDetailPage from './pages/CandidateDetailPage';
import AssessmentPage from './pages/AssessmentPage';

// Components
import Layout from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Layout>
              <ErrorBoundary>
                <Routes>
                  <Route path="/" element={<Navigate to="/jobs" replace />} />
                  <Route path="jobs" element={<JobsPage />} />
                  <Route path="jobs/:jobId" element={<JobDetailPage />} />
                  <Route path="jobs/:jobId/assessment" element={<AssessmentPage />} />
                  <Route path="candidates" element={<CandidatesPage />} />
                  <Route path="candidates/:candidateId" element={<CandidateDetailPage />} />
                </Routes>
              </ErrorBoundary>
            </Layout>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  style: {
                    background: '#10B981',
                  },
                },
                error: {
                  style: {
                    background: '#EF4444',
                  },
                },
              }}
            />
          </div>
          <ReactQueryDevtools initialIsOpen={false} />
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
