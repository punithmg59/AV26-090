import React, { useEffect, useState } from 'react';
import { 
  Activity, AlertTriangle, CheckCircle, Info, HeartPulse, ArrowLeft, 
  ArrowRight, ShieldAlert, FileText, Zap, BarChart3, Heart, 
  Stethoscope, Thermometer, Brain, TrendingDown, ClipboardCheck,
  AlertCircle, Sparkles, Map, Leaf, Scale, Download, Share2, 
  PhoneCall, Clock, Moon, Droplets, Cigarette, Wind, MoreHorizontal,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function PredictionReport({ result, onBack }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    window.scrollTo(0, 0);
  }, [result]);

  // Unified Data Mapping
  const isXray = result?.type === 'xray';
  const riskScore = isXray ? (result?.confidence || 0) : (result?.risk_score || 0);
  const riskLevel = isXray ? (result?.prediction || 'Unknown') : (result?.risk_level || 'Unknown');
  
  const isEmergency = result?.emergency || riskScore >= 85 || result?.risk_level?.includes('HIGH') || result?.prediction === 'PNEUMONIA';
  const isHighRisk = riskLevel.includes('HIGH') || riskLevel === 'PNEUMONIA' || riskScore >= 65;
  const isModerateRisk = riskLevel.includes('MODERATE') || (riskScore >= 35 && riskScore < 65);
  
  const llm = isXray ? (result?.report || {}) : (result?.llm_report || {});
  const ocr = result?.ocr_findings || {};
  const symptoms = result?.symptoms || [];
  const painAreas = result?.selected_pain_areas || [];

  // API base for images
  const API_URL = 'http://127.0.0.1:8000';

  const getRiskTheme = () => {
    if (isHighRisk) return {
      text: 'text-red-400',
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      shadow: 'shadow-[0_0_30px_rgba(239,68,68,0.2)]',
      accent: 'bg-red-500',
      label: 'Critical Detection',
      icon: <AlertCircle className="text-red-400" size={32} />
    };
    if (isModerateRisk) return {
      text: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      shadow: 'shadow-[0_0_30px_rgba(245,158,11,0.2)]',
      accent: 'bg-amber-500',
      label: 'Moderate Monitoring',
      icon: <AlertTriangle className="text-amber-400" size={32} />
    };
    return {
      text: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      shadow: 'shadow-[0_0_30px_rgba(16,185,129,0.2)]',
      accent: 'bg-emerald-500',
      label: 'Optimal Scan',
      icon: <CheckCircle className="text-emerald-400" size={32} />
    };
  };

  const theme = getRiskTheme();

  return (
    <div className="space-y-8 pb-20">
      {/* ─── 1. TOP RESULT CARDS ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Risk Card */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={cn(
            "lg:col-span-7 glass-card rounded-[2.5rem] p-10 border relative overflow-hidden",
            theme.bg, theme.border, theme.shadow
          )}
        >
          <div className={cn("absolute top-0 right-0 w-64 h-64 opacity-20 rounded-full blur-[100px] -mr-32 -mt-32", theme.accent)} />
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                {theme.icon}
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Diagnostic Outcome</span>
                <h2 className={cn("text-4xl font-black tracking-tight mt-1", theme.text)}>
                  {riskLevel}
                </h2>
              </div>
            </div>

            <div className="space-y-6 mb-10">
              <div className="flex items-end justify-between">
                <span className="text-sm font-bold text-slate-300">Cardiac Risk Intensity</span>
                <span className="text-2xl font-black text-white">{riskScore}%</span>
              </div>
              <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${riskScore}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className={cn("h-full rounded-full shadow-[0_0_15px_rgba(255,255,255,0.2)]", theme.accent)} 
                />
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
              <p className="text-slate-200 text-lg leading-relaxed font-medium italic">
                "{llm.how_serious || 'Assessment complete. Analyzing clinical markers...'}"
              </p>
            </div>
          </div>
        </motion.div>

        {/* Biometric Markers Panel / X-ray Visualization */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-5 glass-card rounded-[2.5rem] p-10 border border-white/5 flex flex-col"
        >
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
            {isXray ? <Zap size={14} className="text-primary" /> : <Activity size={14} className="text-primary" />}
            {isXray ? 'AI Visualization Core' : 'Biometric Link Analysis'}
          </h3>
          
          {isXray ? (
            <div className="space-y-6 flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Original Scan</p>
                  <div className="rounded-2xl border border-white/10 overflow-hidden bg-black/40 aspect-square flex items-center justify-center">
                    <img 
                      src={`${API_URL}/${result.image_path}`} 
                      alt="Original X-ray" 
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/400?text=Scan+Not+Found'; }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">AI Heatmap</p>
                  <div className="rounded-2xl border border-white/10 overflow-hidden bg-black/40 aspect-square flex items-center justify-center">
                    <img 
                      src={`${API_URL}/${result.heatmap_path}`} 
                      alt="AI Heatmap" 
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/400?text=Analysis+In+Progress'; }}
                    />
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20">
                <p className="text-[11px] text-primary font-bold leading-relaxed text-center">
                  Grad-CAM analysis highlights areas used by the neural network for prediction.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 flex-1">
              <MarkerCard label="Resting BP" value={ocr.blood_pressure || '120/80'} icon={<Droplets size={18} className="text-blue-400" />} />
              <MarkerCard label="Cholesterol" value={ocr.cholesterol ? `${ocr.cholesterol} mg/dL` : 'Normal'} icon={<Activity size={18} className="text-emerald-400" />} />
              <MarkerCard label="Heart Rate" value={ocr.heart_rate ? `${ocr.heart_rate} bpm` : '72 bpm'} icon={<HeartPulse size={18} className="text-red-400" />} />
              <MarkerCard label="Glucose" value={ocr.glucose ? `${ocr.glucose} mg/dL` : 'Optimal'} icon={<Zap size={18} className="text-amber-400" />} />
            </div>
          )}

          <div className="mt-8 pt-8 border-t border-white/5">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                <Brain size={16} className="text-primary" />
              </div>
              <p className="text-sm text-slate-400 leading-relaxed italic">
                {llm.why_happened || "Analyzing systemic correlations between clinical markers."}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ─── 2. WHAT'S HAPPENING? ─── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-[2.5rem] p-10 border border-white/5 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary/5 via-transparent to-indigo-500/5" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="w-48 h-48 shrink-0 relative group">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <div className="relative w-full h-full bg-slate-900/80 rounded-[3.5rem] border border-white/10 flex items-center justify-center p-10 shadow-2xl">
              <Heart className="w-full h-full text-red-500 animate-pulse" />
            </div>
          </div>
          <div className="flex-1 space-y-6 text-center md:text-left">
            <h3 className="text-3xl font-black text-white tracking-tight flex items-center justify-center md:justify-start gap-4">
              <Sparkles className="text-primary" />
              Physiological Insights
            </h3>
            <p className="text-xl text-slate-300 leading-relaxed font-medium max-w-3xl">
              {llm.what_happened || "Processing medical report insights..."}
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              {(isXray ? llm.recommendations : llm.ai_insights)?.map((insight, idx) => (
                <div key={idx} className="px-5 py-2.5 rounded-2xl bg-white/5 text-slate-300 text-xs font-bold border border-white/5 flex items-center gap-2 hover:bg-white/10 transition-colors">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" /> {insight}
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─── 3. ACTION PLAN & EMERGENCY ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-7 glass-card rounded-[2.5rem] p-10 border border-white/5"
        >
          <h3 className="text-2xl font-black text-white mb-10 flex items-center gap-4">
            <ClipboardCheck className="text-emerald-400" />
            Clinical Action Protocol
          </h3>
          <div className="space-y-4">
            {(isXray ? llm.recommendations : llm.next_steps)?.map((step, idx) => (
              <div key={idx} className="flex items-center justify-between p-6 bg-white/5 border border-white/5 rounded-[2rem] group hover:bg-white/10 hover:border-emerald-500/30 transition-all duration-300">
                <div className="flex items-center gap-5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-sm">
                    0{idx + 1}
                  </div>
                  <span className="font-bold text-slate-200 text-lg">{step}</span>
                </div>
                <ChevronRight size={20} className="text-slate-600 group-hover:text-emerald-400 transition-colors" />
              </div>
            ))}
          </div>
          <div className="mt-10 p-8 rounded-[2rem] bg-emerald-500/10 border border-emerald-500/20 text-center">
             <p className="text-emerald-400 font-bold italic text-lg">
               "{isXray ? `Urgency Level: ${llm.urgency_level || 'Routine'}` : (llm.improvement_potential || 'Your proactive engagement is the key to recovery.')}"
             </p>
          </div>
        </motion.div>

        {/* Emergency / Critical Panel */}
        { (isHighRisk || isModerateRisk || isEmergency) && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "lg:col-span-5 rounded-[2.5rem] p-10 flex flex-col justify-between border relative overflow-hidden",
              isHighRisk ? "bg-red-500/10 border-red-500/30" : "bg-amber-500/10 border-amber-500/30"
            )}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/20 blur-[60px] -mr-16 -mt-16" />
            
            <div className="space-y-8 relative z-10">
              <div className="flex items-center gap-5">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl animate-pulse",
                  isHighRisk ? "bg-red-500 text-white shadow-red-500/20" : "bg-amber-500 text-white shadow-amber-500/20"
                )}>
                  <AlertCircle size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight uppercase">Critical Alert</h3>
                  <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">Immediate Attention Required</p>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-black/20 border border-white/5">
                <p className="text-white font-bold leading-relaxed">
                  {llm.emergency_warning || "System has detected high-intensity risk vectors."}
                </p>
              </div>

              <div className="space-y-4">
                 <EmergencySymptom label="Active Chest Pain" active={symptoms.some(s => s.toLowerCase().includes('chest'))} />
                 <EmergencySymptom label="Acute Breathlessness" active={symptoms.some(s => s.toLowerCase().includes('breath'))} />
                 <EmergencySymptom label="Syncopal Episodes" active={true} />
              </div>
            </div>

            <button className={cn(
              "w-full py-6 mt-10 rounded-2xl text-white font-black text-xl shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4 group",
              isHighRisk ? "bg-red-600 hover:bg-red-700 shadow-red-900/20" : "bg-amber-600 hover:bg-amber-700 shadow-amber-900/20"
            )}>
              <PhoneCall size={28} className="group-hover:animate-bounce" />
              CONTACT EMERGENCY
            </button>
          </motion.div>
        )}
      </div>

      {/* ─── 4. RECORDED DATA ─── */}
      <div className="glass-card rounded-[2.5rem] p-10 border border-white/5">
        <div className="flex items-center justify-between mb-10">
           <h3 className="text-xl font-bold text-white flex items-center gap-3">
             <ClipboardCheck className="text-primary" />
             Diagnostic Data Registry
           </h3>
           <div className="px-4 py-1.5 rounded-full bg-white/5 text-slate-400 text-xs font-black uppercase tracking-widest border border-white/5">
             {symptoms.length + painAreas.length} Total Indicators
           </div>
        </div>
        <div className="flex flex-wrap gap-4">
           {symptoms.map((s, idx) => (
              <div key={idx} className="flex items-center gap-4 px-6 py-4 bg-slate-900/60 border border-white/5 rounded-[1.5rem] hover:border-primary/50 transition-all group">
                 <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                    <Stethoscope size={20} />
                 </div>
                 <span className="font-bold text-slate-200">{s.replace('(form)', '').replace('(OCR)', '').trim()}</span>
              </div>
           ))}
           {painAreas.map((area, idx) => (
              <div key={idx} className="flex items-center gap-4 px-6 py-4 bg-primary/10 border border-primary/20 rounded-[1.5rem] hover:bg-primary/20 transition-all">
                 <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
                    <Map size={20} />
                 </div>
                 <span className="font-bold text-primary uppercase tracking-widest text-sm">{area.replace(/_/g, ' ')}</span>
              </div>
           ))}
        </div>
      </div>

      <div className="text-center pt-10">
        <div className="inline-flex items-center gap-4 px-8 py-4 rounded-full bg-white/5 border border-white/5 text-slate-500 font-bold text-xs uppercase tracking-[0.2em]">
          <ShieldAlert size={16} />
          Verified AI Diagnostic Simulation
        </div>
      </div>
    </div>
  );
}

function MarkerCard({ label, value, icon }) {
  return (
    <div className="bg-white/5 border border-white/5 p-6 rounded-[2rem] flex flex-col gap-4 hover:bg-white/10 hover:border-white/20 transition-all group">
      <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{label}</p>
        <p className="text-xl font-black text-white">{value}</p>
      </div>
    </div>
  );
}

function EmergencySymptom({ label, active }) {
  return (
    <div className={cn(
      "flex items-center gap-4 p-4 rounded-2xl transition-all border",
      active ? "bg-white/10 border-white/20 shadow-xl" : "bg-black/20 border-transparent opacity-30"
    )}>
       <div className={cn("w-3 h-3 rounded-full shadow-[0_0_10px_currentColor]", active ? "text-red-500 bg-red-500 animate-pulse" : "text-slate-600 bg-slate-600")} />
       <span className={cn("text-sm font-bold uppercase tracking-widest", active ? "text-white" : "text-slate-500")}>{label}</span>
    </div>
  );
}
