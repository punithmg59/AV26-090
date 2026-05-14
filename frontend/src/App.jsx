import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import useStore from './store/useStore';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';
import './index.css';

import Dashboard from './pages/Dashboard';
import Predictor from './pages/Predictor';
import BrainTumor from './pages/BrainTumor';
import HistoryPage from './pages/HistoryPage';
import AnalyticsPage from './pages/AnalyticsPage';
import HealthTips from './pages/HealthTips';
import SettingsPage from './pages/SettingsPage';
import Report from './pages/Report';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';


function AppContent() {
  const { theme } = useStore();
  const isLight = theme === 'light';

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      <Route
        path="*"
        element={
          <ProtectedRoute>
            <div className={`flex h-screen overflow-hidden font-sans ${
              isLight ? 'bg-gray-50 text-gray-900' : 'bg-slate-950 text-slate-200'
            }`}>
              <Sidebar />
              <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                <Header />
                <main className={`flex-1 overflow-y-auto p-6 ${
                  isLight ? 'bg-gray-50' : 'bg-slate-950'
                }`}>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/predictor" element={<Predictor />} />
                    <Route path="/brain-tumor" element={<BrainTumor />} />
                    <Route path="/history" element={<HistoryPage />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                    <Route path="/health-tips" element={<HealthTips />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/report" element={<Report />} />
                    <Route path="/profile" element={<Profile />} />
                  </Routes>
                </main>
              </div>
            </div>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <AppContent />
    </AuthProvider>
  );
}

export default App;

