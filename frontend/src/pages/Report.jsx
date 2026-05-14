import React, { useEffect } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import PredictionReport from '../components/PredictionReport';

export default function Report() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const result = location.state?.result;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!result) {
    // If user accesses /report directly without submitting form, redirect to assessment
    return <Navigate to="/" replace />;
  }

  return (
    <div className="w-full bg-white min-h-screen">
      <PredictionReport 
        result={result} 
        onBack={() => navigate('/')} 
      />
    </div>
  );
}
