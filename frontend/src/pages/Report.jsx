import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Download, Loader2 } from 'lucide-react';
import PredictionReport from '../components/PredictionReport';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';

export default function Report() {
  const location = useLocation();
  const navigate = useNavigate();
  const reportRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const result = location.state?.result;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!result) {
    return <Navigate to="/" replace />;
  }

  const downloadPDF = async () => {
    if (!reportRef.current) return;
    setIsGenerating(true);
    
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#0f172a' // match slate-950/dark bg roughly
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
      pdf.save(`Medical_Report_${result.id || 'AI'}.pdf`);
      toast.success('PDF generated successfully!');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-[1400px] mx-auto pb-12"
    >
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
        >
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-all">
            <ChevronLeft size={18} />
          </div>
          <span className="text-sm font-bold uppercase tracking-widest">Back to Assessment</span>
        </button>

        <button 
          onClick={downloadPDF}
          disabled={isGenerating}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
        >
          {isGenerating ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Download size={16} />
          )}
          {isGenerating ? 'Generating...' : 'Download PDF'}
        </button>
      </div>

      <div ref={reportRef} className="p-4 bg-slate-950 rounded-[3rem] -mx-4">
        <PredictionReport 
          result={result} 
          onBack={() => navigate('/')} 
        />
      </div>
    </motion.div>
  );
}
