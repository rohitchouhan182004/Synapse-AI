import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';

// Pages
import { LandingPage } from './features/landing/LandingPage';
import { LoginPage, RegisterPage, OnboardingPage } from './features/auth/AuthPages';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { DigitalTwinPage } from './features/twin/DigitalTwinPage';
import { SkillsPage } from './features/skills/SkillsPage';
import { CodingLabPage } from './features/coding/CodingLabPage';
import { InterviewStudioPage } from './features/interviews/InterviewStudioPage';
import { CareerExplorerPage } from './features/careers/CareerExplorerPage';
import { RoadmapPage } from './features/roadmaps/RoadmapPage';
import { SimulatorPage } from './features/simulator/SimulatorPage';
import { AnalyticsPage } from './features/analytics/AnalyticsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 2, // 2 mins
    },
  },
});

const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-synapse-bg flex items-center justify-center font-mono text-xs text-synapse-lime">
        Authenticating subject...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && !user.has_profile && window.location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div className="min-h-screen bg-synapse-bg flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />

            {/* Protected Laboratory Rail */}
            <Route
              path="/dashboard"
              element={
                <ProtectedLayout>
                  <DashboardPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/twin"
              element={
                <ProtectedLayout>
                  <DigitalTwinPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/skills"
              element={
                <ProtectedLayout>
                  <SkillsPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/coding"
              element={
                <ProtectedLayout>
                  <CodingLabPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/interviews"
              element={
                <ProtectedLayout>
                  <InterviewStudioPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/careers"
              element={
                <ProtectedLayout>
                  <CareerExplorerPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/roadmap"
              element={
                <ProtectedLayout>
                  <RoadmapPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/simulator"
              element={
                <ProtectedLayout>
                  <SimulatorPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedLayout>
                  <AnalyticsPage />
                </ProtectedLayout>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
