import React from 'react';
import { RouterProvider, useRouter } from './context/RouterContext';
import { HomePage } from './pages/Home/HomePage';
import { LoginPage } from './pages/Login/LoginPage';
import { AdminDashboard } from './pages/Admin/AdminDashboard';
import { QuizControlPage } from './pages/Admin/QuizControlPage';
import { RoundsPage } from './pages/Admin/RoundsPage';
import { QuizDisplayPage } from './pages/QuizDisplay/QuizDisplayPage';
import { LeaderboardPage } from './pages/Leaderboard/LeaderboardPage';
import { ProtectedRoute } from './components/router/ProtectedRoute';

function AppContent() {
  const { path } = useRouter();

  // Normalize path
  const normalizedPath = path.split('?')[0].replace(/\/+$/, '') || '/';

  switch (normalizedPath) {
    case '/login':
      return <LoginPage />;
    case '/admin':
      return (
        <ProtectedRoute>
          <AdminDashboard />
        </ProtectedRoute>
      );
    case '/admin/quiz':
      return (
        <ProtectedRoute>
          <QuizControlPage />
        </ProtectedRoute>
      );
    case '/admin/rounds':
      return (
        <ProtectedRoute>
          <RoundsPage />
        </ProtectedRoute>
      );
    case '/leaderboard':
      return <LeaderboardPage />;
    case '/display':
      return <QuizDisplayPage />;
    case '/':
    default:
      return <HomePage />;
  }
}

export default function App() {
  return (
    <RouterProvider>
      <AppContent />
    </RouterProvider>
  );
}
