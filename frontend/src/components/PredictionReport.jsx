import React, { useEffect, useState } from 'react';
import { 
  Activity, AlertTriangle, CheckCircle, Info, HeartPulse, ArrowLeft, 
  ArrowRight, ShieldAlert, FileText, Zap, BarChart3, Heart, 
  Stethoscope, Thermometer, Brain, TrendingDown, ClipboardCheck,
  AlertCircle, Sparkles, Map, Leaf, Scale, Download, Share2, 
  PhoneCall, Clock, Moon, Droplets, Cigarette, Wind, MoreHorizontal
} from 'lucide-react';
import clsx from 'clsx';

export default function PredictionReport({ result, onBack }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    console.log("Full Backend Response Received:", result);
    setIsVisible(true);
    window.scrollTo(0, 0);
  }, [result]);

  // ─── Dynamic Data Extraction ───
  // Use keys provided by backend: risk_level, risk_score, symptoms, selected_pain_areas, llm_report
  const riskScore = result?.risk_score || 0;
  const riskLevel = result?.risk_level || 'Unknown';
  const isEmergency = result?.emergency || riskScore >= 85;
  const isHighRisk = riskLevel.includes('HIGH') || riskScore >= 65;
  const isModerateRisk = riskLevel.includes('MODERATE') || (riskScore >= 35 && riskScore < 65);
  
  const llm = result?.llm_report || {};
  const ocr = result?.ocr_findings || {};
  const symptoms = result?.symptoms || [];
  const painAreas = result?.selected_pain_areas || [];

  // ─── Theme Mapping ───
  const getRiskTheme = () => {
    if (isHighRisk) return {
      text: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-100',
      accent: 'bg-red-600',
      lightAccent: 'bg-red-100',
      label: 'High Risk',
      icon: <AlertCircle className="text-red-600" size={28} />
    };
    if (isModerateRisk) return {
      text: 'text-orange-600',
      bg: 'bg-orange-50',
      border: 'border-orange-100',
      accent: 'bg-orange-500',
      lightAccent: 'bg-orange-100',
      label: 'Moderate Risk',
      icon: <AlertTriangle className="text-orange-600" size={28} />
    };
    return {
      text: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      accent: 'bg-emerald-500',
      lightAccent: 'bg-emerald-100',
      label: 'Low Risk',
      icon: <CheckCircle className="text-emerald-600" size={28} />
    };
  };

  const theme = getRiskTheme();

  return (
    <div className={clsx(
      "min-h-screen bg-white pb-20 transition-all duration-700 font-sans text-slate-800",
      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
    )}>
      {/* ─── Navigation Header ─── */}
      <header className="max-w-5xl mx-auto px-6 py-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Your Health Report</h1>
            <p className="text-slate-500 text-sm mt-1 font-medium italic">
              AI Analysis • {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition shadow-sm">
            <Download size={16} /> PDF
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition shadow-md">
            <Share2 size={16} /> Share Report
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 space-y-6">
        
        {/* ─── 1. HEALTH RESULT CARD ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={clsx("border rounded-[2.5rem] p-8 shadow-sm flex flex-col", theme.bg, theme.border)}>
            <div className="flex items-start justify-between mb-8">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Calculated Risk Level</span>
                <h2 className={clsx("text-4xl font-black tracking-tight", theme.text)}>
                  {riskLevel}
                </h2>
              </div>
              <div className="w-16 h-16 rounded-3xl bg-white shadow-sm flex items-center justify-center">
                {theme.icon}
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-end justify-between text-sm">
                <span className="font-bold text-slate-700">Health Probability Score</span>
                <span className="font-bold text-slate-400">{riskScore} / 100</span>
              </div>
              <div className="w-full h-4 bg-white/50 border border-slate-100 rounded-full overflow-hidden p-1">
                <div 
                  className={clsx("h-full transition-all duration-1000 ease-out rounded-full", theme.accent)} 
                  style={{ width: `${riskScore}%` }}
                />
              </div>
            </div>

            <p className="text-slate-700 text-lg leading-relaxed font-semibold italic">
              "{llm.how_serious || 'Assessment completed successfully.'}"
            </p>
          </div>

          {/* Key Indicators Card */}
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm h-full">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Biometric Markers</h3>
            <div className="grid grid-cols-2 gap-4">
              <MarkerCard label="BP" value={ocr.blood_pressure || '120/80'} icon={<Activity size={16} />} />
              <MarkerCard label="Cholesterol" value={ocr.cholesterol ? `${ocr.cholesterol} mg/dL` : 'Normal'} icon={<Droplets size={16} />} />
              <MarkerCard label="Heart Rate" value={ocr.heart_rate ? `${ocr.heart_rate} bpm` : '72 bpm'} icon={<HeartPulse size={16} />} />
              <MarkerCard label="Glucose" value={ocr.glucose ? `${ocr.glucose} mg/dL` : 'Normal'} icon={<Zap size={16} />} />
            </div>
            <div className="mt-6 pt-6 border-t border-slate-100">
               <p className="text-sm text-slate-500 font-medium leading-relaxed">
                 {llm.why_happened || "Analyzing risk factors based on provided clinical data."}
               </p>
            </div>
          </div>
        </div>

        {/* ─── 2. WHAT'S HAPPENING? ─── */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/30 blur-3xl rounded-full -mr-20 -mt-20" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
            <div className="w-48 h-48 shrink-0 bg-slate-50 rounded-[3rem] border border-slate-100 flex items-center justify-center p-8 group">
               <img src="https://img.icons8.com/color/240/heart-with-pulse.png" alt="Heart Visualization" className="w-full h-auto group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="space-y-6">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <Brain className="text-indigo-500" />
                What's Happening Inside?
              </h3>
              <p className="text-xl text-slate-600 leading-relaxed font-medium">
                {llm.what_happened || "Analysis in progress..."}
              </p>
              <div className="flex flex-wrap gap-2">
                 {llm.ai_insights?.map((insight, idx) => (
                    <div key={idx} className="px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold border border-indigo-100 flex items-center gap-2">
                       <Sparkles size={12} /> {insight}
                    </div>
                 ))}
              </div>
            </div>
          </div>
        </div>

        {/* ─── 3. WHY THIS MAY BE HAPPENING ─── */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-slate-900 px-4">Dynamic Risk Drivers</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {llm.risk_factors?.map((factor, idx) => (
              <div key={idx} className="p-6 rounded-[2rem] bg-white border border-slate-200 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all group">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mb-4 group-hover:bg-indigo-50 transition-colors">
                  <Activity size={20} className="text-slate-400 group-hover:text-indigo-500" />
                </div>
                <h4 className="font-bold text-slate-800 text-lg mb-1">{factor}</h4>
                <p className="text-sm text-slate-500 font-medium">Contributing factor detected in analysis.</p>
              </div>
            )) || (
              <p className="col-span-4 text-slate-400 italic text-center py-8">No specific risk drivers found.</p>
            )}
          </div>
        </div>

        {/* ─── 4. WHAT SHOULD YOU DO NEXT? & 5. EMERGENCY ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
            <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
              <ClipboardCheck className="text-emerald-500" />
              Your Action Plan
            </h3>
            <div className="space-y-4">
              {llm.next_steps?.map((step, idx) => (
                <div key={idx} className="flex items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-2xl group hover:border-emerald-300 hover:bg-white transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm shrink-0">
                      {idx + 1}
                    </div>
                    <span className="font-bold text-slate-700 text-base">{step}</span>
                  </div>
                  <ArrowRight size={18} className="text-slate-200 group-hover:text-emerald-500 transition-colors" />
                </div>
              )) || (
                <p className="text-slate-400 italic">No recommendations provided.</p>
              )}
            </div>
            <div className="mt-8 p-6 rounded-3xl bg-emerald-50/50 border border-emerald-100">
               <p className="text-emerald-800 font-semibold italic text-center">
                 "{llm.improvement_potential || 'Maintaining a healthy lifestyle can improve these results.'}"
               </p>
            </div>
          </div>

          {/* 5. EMERGENCY WARNING */}
          { (isEmergency || isHighRisk || isModerateRisk) && (
            <div className={clsx(
              "lg:col-span-5 rounded-[2.5rem] p-8 shadow-lg flex flex-col justify-between",
              isHighRisk ? "bg-red-50 border border-red-100" : "bg-orange-50 border border-orange-100"
            )}>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className={clsx(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                    isHighRisk ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"
                  )}>
                    <AlertCircle size={28} />
                  </div>
                  <div className="space-y-1">
                    <h3 className={clsx("text-2xl font-black tracking-tight", isHighRisk ? "text-red-800" : "text-orange-800")}>
                      Urgent Warning
                    </h3>
                    <p className={clsx("text-sm font-bold opacity-80", isHighRisk ? "text-red-600" : "text-orange-600")}>
                      {llm.emergency_warning || "Please monitor your symptoms closely."}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                   <EmergencySymptom label="Chest Pain" active={symptoms.some(s => s.toLowerCase().includes('chest'))} />
                   <EmergencySymptom label="Shortness of Breath" active={symptoms.some(s => s.toLowerCase().includes('breath'))} />
                   <EmergencySymptom label="Fainting or Dizziness" active={true} />
                </div>
              </div>

              <button className={clsx(
                "w-full py-5 mt-8 rounded-2xl text-white font-black text-xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3",
                isHighRisk ? "bg-red-600 shadow-red-200 hover:bg-red-700" : "bg-orange-500 shadow-orange-200 hover:bg-orange-600"
              )}>
                <PhoneCall size={24} />
                Emergency Services
              </button>
            </div>
          )}
        </div>

        {/* ─── 6. YOUR SYMPTOMS & PAIN AREAS ─── */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-xl font-bold text-slate-900">Recorded Symptoms</h3>
             <div className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest">
               {symptoms.length + painAreas.length} Found
             </div>
          </div>
          <div className="flex flex-wrap gap-3">
             {symptoms.map((s, idx) => (
                <div key={idx} className="flex items-center gap-3 px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl shadow-sm group hover:border-indigo-300 transition-colors">
                   <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                      <Stethoscope size={16} />
                   </div>
                   <span className="font-bold text-slate-700 text-sm">{s.replace('(form)', '').replace('(OCR)', '').trim()}</span>
                </div>
             ))}
             {painAreas.map((area, idx) => (
                <div key={idx} className="flex items-center gap-3 px-5 py-3 bg-blue-50 border border-blue-100 rounded-2xl shadow-sm group hover:border-indigo-400 transition-colors">
                   <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-500 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                      <Map size={16} />
                   </div>
                   <span className="font-bold text-indigo-800 text-sm uppercase tracking-tight">{area.replace(/_/g, ' ')}</span>
                </div>
             ))}
          </div>
        </div>

        <div className="pt-12 pb-6 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-50 text-slate-400 font-bold text-xs uppercase tracking-widest border border-slate-100">
            <ShieldAlert size={14} className="text-slate-300" />
            AI Diagnostic Guidance • Not a Clinical Mandate
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MarkerCard({ label, value, icon }) {
  return (
    <div className="bg-slate-50 border border-slate-100 p-4 rounded-3xl flex items-center gap-4 hover:bg-white hover:shadow-md transition-all">
      <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-indigo-500 shadow-sm">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
        <p className="text-base font-black text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function EmergencySymptom({ label, active }) {
  return (
    <div className={clsx(
      "flex items-center gap-3 p-3 rounded-2xl transition-all",
      active ? "bg-white shadow-sm border border-red-100" : "opacity-50"
    )}>
       <div className={clsx("w-2 h-2 rounded-full", active ? "bg-red-500 animate-pulse" : "bg-slate-300")} />
       <span className={clsx("text-sm font-bold", active ? "text-red-700" : "text-slate-500")}>{label}</span>
    </div>
  );
}
