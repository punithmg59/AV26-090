import React, { useEffect, useState } from 'react';
import { 
  FileText, Calendar, Clock, Activity, AlertCircle, CheckCircle, 
  ChevronRight, Stethoscope, HeartPulse, User, Image as ImageIcon,
  Shield, Brain, Zap, Download, Printer
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function PredictionReport({ result, onBack }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [result]);

  if (!result) return null;

  // Unified Data Extraction
  const type = result.type || 'unknown';
  const isImageScan = type === 'xray' || type === 'mri';
  const isHeart = type === 'heart';

  const prediction = result.prediction || result.risk_level || 'Unknown';
  const confidence = result.confidence || result.risk_score || 0;
  
  // Extract report object
  let reportObj = {};
  if (result.full_report && typeof result.full_report === 'object') {
    reportObj = result.full_report;
  } else if (result.report && typeof result.report === 'object') {
    reportObj = result.report;
  } else if (result.llm_report && typeof result.llm_report === 'object') {
    reportObj = result.llm_report;
  }

  const whatHappened = reportObj.what_happened || result.report || "Diagnostic analysis complete.";
  const whyHappened = reportObj.why_happened || result.why_happened || "Based on clinical AI pattern recognition.";
  
  // Next steps and recommendations
  const nextSteps = reportObj.next_steps || reportObj.recommendations || result.recommendations || [];
  const healthRecs = result.suggestions || reportObj.health_suggestions || [
    "Maintain a balanced diet.",
    "Stay hydrated and monitor vitals.",
    "Ensure adequate rest and sleep."
  ];

  const doctorRecs = reportObj.doctor_recommendations || [
    isHeart ? "Cardiologist - For specialized heart monitoring" :
    type === 'mri' ? "Neurologist - For brain scan evaluation" :
    "Pulmonologist - For respiratory assessment"
  ];

  const urgency = reportObj.urgency_level || result.urgency_level || result.urgency || "Routine";
  const riskLevel = result.risk_level || "Standard";

  const tumorSpot = reportObj.tumor_spot || result.tumor_spot || null;
  const tumorSize = reportObj.tumor_size || result.tumor_size || null;

  const getUrgencyColor = (urgency) => {
    const u = (urgency || '').toLowerCase();
    if (u.includes('critical') || u.includes('emergency')) return 'text-red-500 bg-red-500/10 border-red-500/20';
    if (u.includes('urgent') || u.includes('high')) return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
    if (u.includes('moderate')) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
  };

  const API_URL = 'http://127.0.0.1:8000';
  const reportDate = result.created_at ? new Date(result.created_at) : new Date();

  return (
    <div className="bg-[#0b1120] rounded-3xl overflow-hidden border border-slate-800/50 shadow-2xl font-sans text-slate-300">
      
      {/* 1. REPORT HEADER */}
      <div className="border-b border-slate-800 bg-slate-900/50 p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
            <Shield className="text-indigo-400" size={24} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Clinical Diagnostic Report</h1>
            <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
              <span className="flex items-center gap-1"><Activity size={12}/> AI Analysis Complete</span>
              <span>•</span>
              <span>ID: {result.id || `RPT-${Math.floor(Math.random()*10000)}`}</span>
            </p>
          </div>
        </div>
        <div className="text-left md:text-right text-sm text-slate-400 space-y-1">
          <p className="flex items-center justify-start md:justify-end gap-2">
            <Calendar size={14} /> Generated: {reportDate.toLocaleDateString()}
          </p>
          <p className="flex items-center justify-start md:justify-end gap-2">
            <Clock size={14} /> Time: {reportDate.toLocaleTimeString()}
          </p>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-8">
        
        {/* TOP ROW: DIAGNOSIS & DOCUMENT PREVIEW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* 3. PRIMARY DIAGNOSIS SECTION */}
          <div className="flex flex-col space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex-1">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Primary Diagnosis</h2>
              
              <div className="mb-6">
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">{prediction}</h3>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${getUrgencyColor(urgency)}`}>
                  <AlertCircle size={14} />
                  Status: {urgency}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-800/80 pt-6">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">AI Confidence</p>
                  <p className="text-2xl font-semibold text-slate-200">{typeof confidence === 'number' ? confidence.toFixed(1) : confidence}%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Risk Level</p>
                  <p className="text-2xl font-semibold text-slate-200">{riskLevel}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 2. UPLOADED DOCUMENT PREVIEW */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Document Source</h2>
            
            {isImageScan ? (
              <div className="flex-1 flex flex-col">
                <div className="flex gap-4 flex-1">
                  <div className="w-1/2 rounded-xl bg-black/40 border border-slate-800 overflow-hidden flex flex-col">
                  <div className="px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex justify-between">
                    <span>Original Scan</span>
                  </div>
                  <div className="flex-1 relative">
                    {result.image_path ? (
                      <img src={`${API_URL}${result.image_path.startsWith('/') ? '' : '/'}${result.image_path}`} alt="Scan" className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center"><ImageIcon className="text-slate-700" size={32}/></div>
                    )}
                  </div>
                </div>
                <div className="w-1/2 rounded-xl bg-black/40 border border-slate-800 overflow-hidden flex flex-col">
                  <div className="px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex justify-between">
                    <span>AI Heatmap</span>
                  </div>
                  <div className="flex-1 relative">
                    {result.heatmap_path ? (
                      <img src={`${API_URL}${result.heatmap_path.startsWith('/') ? '' : '/'}${result.heatmap_path}`} alt="Heatmap" className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-600">N/A</div>
                    )}
                  </div>
                </div>
              </div>
              {tumorSpot && tumorSpot !== 'N/A' && type === 'mri' && (
                <div className="grid grid-cols-2 gap-3 text-sm mt-4">
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-500 text-xs block">Tumor Location</span>
                    <span className="text-slate-300 font-medium">{tumorSpot}</span>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-500 text-xs block">Estimated Size</span>
                    <span className="text-slate-300 font-medium">{tumorSize}</span>
                  </div>
                </div>
              )}
            </div>
            ) : (
              <div className="flex-1 flex flex-col justify-center bg-black/20 rounded-xl border border-slate-800 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg"><FileText size={24}/></div>
                  <div>
                    <p className="text-sm font-semibold text-slate-300">Biometric Blood Report</p>
                    <p className="text-xs text-slate-500">Processed via OCR/Form input</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-500 text-xs block">Blood Pressure</span>
                    <span className="text-slate-300 font-medium">{result.blood_pressure || (result.ocr_findings && result.ocr_findings.blood_pressure) || 'N/A'}</span>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-500 text-xs block">Heart Rate</span>
                    <span className="text-slate-300 font-medium">{(result.heart_rate || (result.ocr_findings && result.ocr_findings.heart_rate)) ? `${result.heart_rate || result.ocr_findings.heart_rate} bpm` : 'N/A'}</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
              <span>Type: {type.toUpperCase()}</span>
              <span>{reportDate.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* 4. WHAT HAPPENED & 5. WHY IT HAPPENED */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6">
            <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Activity className="text-indigo-400" size={18} /> What Happened
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              {typeof whatHappened === 'string' ? whatHappened : JSON.stringify(whatHappened)}
            </p>
          </div>
          
          <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6">
            <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Brain className="text-indigo-400" size={18} /> Why It Happened
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              {typeof whyHappened === 'string' ? whyHappened : "Analysis indicates patterns aligning with the identified condition. Refer to clinical guidelines for root cause determination."}
            </p>
          </div>
        </div>

        {/* 6. WHAT TO DO NEXT */}
        <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6">
          <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <CheckCircle className="text-emerald-400" size={18} /> What To Do Next
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Array.isArray(nextSteps) && nextSteps.length > 0 ? nextSteps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                <span className="text-emerald-500 font-bold text-sm mt-0.5">{idx + 1}.</span>
                <span className="text-slate-300 text-sm">{step}</span>
              </div>
            )) : (
              <div className="text-slate-500 text-sm italic">Consult a healthcare provider for next steps.</div>
            )}
          </div>
        </div>

        {/* 7. DOCTOR RECS & 8. HEALTH RECS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6">
            <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Stethoscope className="text-blue-400" size={18} /> Specialist Recommendations
            </h2>
            <ul className="space-y-3">
              {Array.isArray(doctorRecs) ? doctorRecs.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-slate-400">
                  <ChevronRight size={16} className="text-slate-600 mt-0.5 shrink-0" />
                  <span>{rec}</span>
                </li>
              )) : (
                <li className="text-sm text-slate-400">{doctorRecs}</li>
              )}
            </ul>
          </div>
          
          <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6">
            <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <HeartPulse className="text-rose-400" size={18} /> Health Recommendations
            </h2>
            <ul className="space-y-3">
              {Array.isArray(healthRecs) ? healthRecs.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-slate-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-600 mt-1.5 shrink-0" />
                  <span>{rec}</span>
                </li>
              )) : (
                <li className="text-sm text-slate-400">{healthRecs}</li>
              )}
            </ul>
          </div>
        </div>

        {/* FOOTER */}
        <div className="pt-6 border-t border-slate-800/80 text-center">
          <p className="text-xs text-slate-600 uppercase tracking-widest font-semibold">
            This AI-generated report is for informational purposes only and does not replace professional medical advice.
          </p>
        </div>

      </div>
    </div>
  );
}
