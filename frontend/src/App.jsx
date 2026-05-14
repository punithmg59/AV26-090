import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import RiskAssessment from './pages/RiskAssessment';
import Report from './pages/Report';
import './index.css';

function App() {

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <Header />
        
        <main className="flex-1 p-4 md:p-6 flex flex-col">
          <Routes>
            <Route path="/" element={<RiskAssessment />} />
            <Route path="/report" element={<Report />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
