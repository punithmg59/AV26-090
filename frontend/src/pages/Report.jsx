import React, { useEffect } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import PredictionReport from '../components/PredictionReport';

export default function Report() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const result = location.state?.result;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!result) {
    return <Navigate to="/" replace />;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-[1400px] mx-auto pb-12"
    >
      <button 
        onClick={() => navigate('/')}
        className="mb-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
      >
        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-all">
          <ChevronLeft size={18} />
        </div>
        <span className="text-sm font-bold uppercase tracking-widest">Back to Assessment</span>
      </button>

      <PredictionReport 
        result={result} 
        onBack={() => navigate('/')} 
      />
    </motion.div>
  );
}
