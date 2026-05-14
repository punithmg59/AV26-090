import React from 'react';
import { Activity } from 'lucide-react';
import clsx from 'clsx';

export default function MedicalForm({ formData, setFormData, onSubmit, loading }) {
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleToggle = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const increment = (name, max = 999) => {
    const val = Number(formData[name]) || 0;
    if (val < max) setFormData({ ...formData, [name]: val + 1 });
  };

  const decrement = (name, min = 0) => {
    const val = Number(formData[name]) || 0;
    if (val > min) setFormData({ ...formData, [name]: val - 1 });
  };

  return (
    <div className="bg-surface rounded-3xl border border-border p-5 flex flex-col shadow-sm">
      <div className="mb-4 shrink-0">
        <h2 className="text-lg font-bold text-textMain mb-0.5">Your Health Information</h2>
        <p className="text-xs text-textMuted">Please provide the following details</p>
      </div>

      <div className="flex-1 pr-2">
        <form onSubmit={onSubmit} className="space-y-3">
          
          {/* 1. Age */}
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-2.5">
            <label className="text-xs font-medium text-textMain flex items-center gap-2">
              <span className="text-primary bg-indigo-50 w-5 h-5 rounded flex items-center justify-center text-[10px]">1</span>
              Age (years)
            </label>
            <div className="flex items-center border border-border rounded-lg overflow-hidden h-8 w-36">
              <input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full h-full text-center outline-none text-xs font-medium" required />
              <button type="button" onClick={() => decrement('age', 1)} className="px-2.5 bg-gray-50 border-l border-border hover:bg-gray-100 transition text-textMuted">-</button>
              <button type="button" onClick={() => increment('age', 120)} className="px-2.5 bg-gray-50 border-l border-border hover:bg-gray-100 transition text-textMuted">+</button>
            </div>
          </div>

          {/* 2. Sex */}
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-2.5">
            <label className="text-xs font-medium text-textMain flex items-center gap-2">
              <span className="text-primary bg-indigo-50 w-5 h-5 rounded flex items-center justify-center text-[10px]">2</span>
              Sex
            </label>
            <div className="flex items-center bg-gray-100 p-0.5 rounded-lg w-36">
              <button type="button" onClick={() => handleToggle('sex', 1)} className={clsx("flex-1 text-xs py-1 rounded-md font-medium transition", formData.sex === 1 ? "bg-primary text-white shadow-sm" : "text-textMuted")}>Male</button>
              <button type="button" onClick={() => handleToggle('sex', 0)} className={clsx("flex-1 text-xs py-1 rounded-md font-medium transition", formData.sex === 0 ? "bg-primary text-white shadow-sm" : "text-textMuted")}>Female</button>
            </div>
          </div>

          {/* 3. Chest Pain Type */}
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-2.5">
            <label className="text-xs font-medium text-textMain flex items-center gap-2">
              <span className="text-primary bg-indigo-50 w-5 h-5 rounded flex items-center justify-center text-[10px]">3</span>
              Chest Pain Type (cp)
            </label>
            <select name="cp" value={formData.cp} onChange={handleChange} required className="w-36 h-8 border border-border rounded-lg px-2 text-xs outline-none focus:border-primary bg-white text-textMain">
              <option value="" disabled>Select...</option>
              <option value="0">0. Typical</option>
              <option value="1">1. Atypical</option>
              <option value="2">2. Non-anginal</option>
              <option value="3">3. Asymptomatic</option>
            </select>
          </div>

          {/* 4. Resting Blood Pressure */}
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-2.5">
            <label className="text-xs font-medium text-textMain flex items-center gap-2">
              <span className="text-primary bg-indigo-50 w-5 h-5 rounded flex items-center justify-center text-[10px]">4</span>
              Resting Blood Pressure
            </label>
            <div className="flex items-center border border-border rounded-lg overflow-hidden h-8 w-36">
              <input type="number" name="trestbps" value={formData.trestbps} onChange={handleChange} className="w-full h-full text-center outline-none text-xs font-medium" required />
              <button type="button" onClick={() => decrement('trestbps', 50)} className="px-2.5 bg-gray-50 border-l border-border hover:bg-gray-100 transition text-textMuted">-</button>
              <button type="button" onClick={() => increment('trestbps', 300)} className="px-2.5 bg-gray-50 border-l border-border hover:bg-gray-100 transition text-textMuted">+</button>
            </div>
          </div>

          {/* 5. Cholesterol */}
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-2.5">
            <label className="text-xs font-medium text-textMain flex items-center gap-2">
              <span className="text-primary bg-indigo-50 w-5 h-5 rounded flex items-center justify-center text-[10px]">5</span>
              Serum Cholesterol
            </label>
            <div className="flex items-center border border-border rounded-lg overflow-hidden h-8 w-36">
              <input type="number" name="chol" value={formData.chol} onChange={handleChange} className="w-full h-full text-center outline-none text-xs font-medium" required />
              <button type="button" onClick={() => decrement('chol', 100)} className="px-2.5 bg-gray-50 border-l border-border hover:bg-gray-100 transition text-textMuted">-</button>
              <button type="button" onClick={() => increment('chol', 600)} className="px-2.5 bg-gray-50 border-l border-border hover:bg-gray-100 transition text-textMuted">+</button>
            </div>
          </div>

          {/* 6. FBS */}
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-2.5">
            <label className="text-xs font-medium text-textMain flex items-center gap-2">
              <span className="text-primary bg-indigo-50 w-5 h-5 rounded flex items-center justify-center text-[10px]">6</span>
              Fasting Blood Sugar {'>'} 120
            </label>
            <div className="flex items-center gap-1.5 w-36">
              <button type="button" onClick={() => handleToggle('fbs', 0)} className={clsx("flex-1 h-8 text-xs rounded-lg border transition", formData.fbs === 0 ? "border-primary bg-indigo-50 text-primary font-medium" : "border-border text-textMuted hover:bg-gray-50")}>No (0)</button>
              <button type="button" onClick={() => handleToggle('fbs', 1)} className={clsx("flex-1 h-8 text-xs rounded-lg border transition", formData.fbs === 1 ? "border-primary bg-primary text-white font-medium shadow-sm" : "border-border text-textMuted hover:bg-gray-50")}>Yes (1)</button>
            </div>
          </div>

          {/* 7. Max Heart Rate */}
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-2.5">
            <label className="text-xs font-medium text-textMain flex items-center gap-2">
              <span className="text-primary bg-indigo-50 w-5 h-5 rounded flex items-center justify-center text-[10px]">7</span>
              Max Heart Rate Achieved
            </label>
            <div className="flex items-center border border-border rounded-lg overflow-hidden h-8 w-36">
              <input type="number" name="thalach" value={formData.thalach} onChange={handleChange} className="w-full h-full text-center outline-none text-xs font-medium" required />
              <button type="button" onClick={() => decrement('thalach', 60)} className="px-2.5 bg-gray-50 border-l border-border hover:bg-gray-100 transition text-textMuted">-</button>
              <button type="button" onClick={() => increment('thalach', 220)} className="px-2.5 bg-gray-50 border-l border-border hover:bg-gray-100 transition text-textMuted">+</button>
            </div>
          </div>

          {/* 8. Exang */}
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-2.5">
            <label className="text-xs font-medium text-textMain flex items-center gap-2">
              <span className="text-primary bg-indigo-50 w-5 h-5 rounded flex items-center justify-center text-[10px]">8</span>
              Exercise Induced Angina
            </label>
            <div className="flex items-center gap-1.5 w-36">
              <button type="button" onClick={() => handleToggle('exang', 0)} className={clsx("flex-1 h-8 text-xs rounded-lg border transition", formData.exang === 0 ? "border-primary bg-indigo-50 text-primary font-medium" : "border-border text-textMuted hover:bg-gray-50")}>No (0)</button>
              <button type="button" onClick={() => handleToggle('exang', 1)} className={clsx("flex-1 h-8 text-xs rounded-lg border transition", formData.exang === 1 ? "border-primary bg-primary text-white font-medium shadow-sm" : "border-border text-textMuted hover:bg-gray-50")}>Yes (1)</button>
            </div>
          </div>

          {/* 9. Smoking */}
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-2.5">
            <label className="text-xs font-medium text-textMain flex items-center gap-2">
              <span className="text-primary bg-indigo-50 w-5 h-5 rounded flex items-center justify-center text-[10px]">9</span>
              Smoking
            </label>
            <div className="flex items-center gap-1.5 w-36">
              <button type="button" onClick={() => handleToggle('smoking', 0)} className={clsx("flex-1 h-8 text-xs rounded-lg border transition", formData.smoking === 0 ? "border-primary bg-indigo-50 text-primary font-medium" : "border-border text-textMuted hover:bg-gray-50")}>No (0)</button>
              <button type="button" onClick={() => handleToggle('smoking', 1)} className={clsx("flex-1 h-8 text-xs rounded-lg border transition", formData.smoking === 1 ? "border-primary bg-primary text-white font-medium shadow-sm" : "border-border text-textMuted hover:bg-gray-50")}>Yes (1)</button>
            </div>
          </div>

          {/* 10. Stress Level */}
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-2.5">
            <label className="text-xs font-medium text-textMain flex items-center gap-2 min-w-[120px]">
              <span className="text-primary bg-indigo-50 w-5 h-5 rounded flex items-center justify-center text-[10px]">10</span>
              Stress Level
            </label>
            <div className="flex-1 flex items-center gap-3 w-36">
              <input type="range" name="stress_level" min="1" max="10" value={formData.stress_level || 1} onChange={handleChange} className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary" />
              <span className="w-4 text-right font-semibold text-textMain text-xs">{formData.stress_level || 1}</span>
            </div>
          </div>

          {/* 11. Short Breath */}
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-2.5">
            <label className="text-xs font-medium text-textMain flex items-center gap-2">
              <span className="text-primary bg-indigo-50 w-5 h-5 rounded flex items-center justify-center text-[10px]">11</span>
              Shortness of Breath
            </label>
            <div className="flex items-center gap-1.5 w-36">
              <button type="button" onClick={() => handleToggle('short_breath', 0)} className={clsx("flex-1 h-8 text-xs rounded-lg border transition", formData.short_breath === 0 ? "border-primary bg-indigo-50 text-primary font-medium" : "border-border text-textMuted hover:bg-gray-50")}>No (0)</button>
              <button type="button" onClick={() => handleToggle('short_breath', 1)} className={clsx("flex-1 h-8 text-xs rounded-lg border transition", formData.short_breath === 1 ? "border-primary bg-primary text-white font-medium shadow-sm" : "border-border text-textMuted hover:bg-gray-50")}>Yes (1)</button>
            </div>
          </div>

          {/* 12. Fatigue */}
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-2.5">
            <label className="text-xs font-medium text-textMain flex items-center gap-2">
              <span className="text-primary bg-indigo-50 w-5 h-5 rounded flex items-center justify-center text-[10px]">12</span>
              Fatigue
            </label>
            <div className="flex items-center gap-1.5 w-36">
              <button type="button" onClick={() => handleToggle('fatigue', 0)} className={clsx("flex-1 h-8 text-xs rounded-lg border transition", formData.fatigue === 0 ? "border-primary bg-indigo-50 text-primary font-medium" : "border-border text-textMuted hover:bg-gray-50")}>No (0)</button>
              <button type="button" onClick={() => handleToggle('fatigue', 1)} className={clsx("flex-1 h-8 text-xs rounded-lg border transition", formData.fatigue === 1 ? "border-primary bg-primary text-white font-medium shadow-sm" : "border-border text-textMuted hover:bg-gray-50")}>Yes (1)</button>
            </div>
          </div>

          {/* 13. Chest Location */}
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-2.5">
            <label className="text-xs font-medium text-textMain flex items-center gap-2">
              <span className="text-primary bg-indigo-50 w-5 h-5 rounded flex items-center justify-center text-[10px]">13</span>
              Chest Pain Location
            </label>
            <select name="chest_location" value={formData.chest_location} onChange={handleChange} required className="w-36 h-8 border border-border rounded-lg px-2 text-xs outline-none focus:border-primary bg-white">
              <option value="" disabled>Select...</option>
              <option value="1">1. Center</option>
              <option value="0">0. Left/Right</option>
            </select>
          </div>

          {/* 14. Left Arm Pain */}
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-2.5">
            <label className="text-xs font-medium text-textMain flex items-center gap-2">
              <span className="text-primary bg-indigo-50 w-5 h-5 rounded flex items-center justify-center text-[10px]">14</span>
              Left Arm Pain
            </label>
            <div className="flex items-center gap-1.5 w-36">
              <button type="button" onClick={() => handleToggle('left_arm_pain', 0)} className={clsx("flex-1 h-8 text-xs rounded-lg border transition", formData.left_arm_pain === 0 ? "border-primary bg-indigo-50 text-primary font-medium" : "border-border text-textMuted hover:bg-gray-50")}>No (0)</button>
              <button type="button" onClick={() => handleToggle('left_arm_pain', 1)} className={clsx("flex-1 h-8 text-xs rounded-lg border transition", formData.left_arm_pain === 1 ? "border-primary bg-primary text-white font-medium shadow-sm" : "border-border text-textMuted hover:bg-gray-50")}>Yes (1)</button>
            </div>
          </div>

          {/* 15. Pain Severity */}
          <div className="flex items-center justify-between gap-3 pb-1">
            <label className="text-xs font-medium text-textMain flex items-center gap-2">
              <span className="text-primary bg-indigo-50 w-5 h-5 rounded flex items-center justify-center text-[10px]">15</span>
              Pain Severity
            </label>
            <div className="flex items-center bg-gray-100 p-0.5 rounded-lg">
              {[1, 2, 3, 4].map((level) => (
                <button 
                  key={level} 
                  type="button" 
                  onClick={() => handleToggle('pain_severity', level)} 
                  className={clsx(
                    "w-12 text-[10px] py-1.5 rounded-md font-medium transition", 
                    formData.pain_severity === level ? "bg-primary text-white shadow-sm" : "text-textMuted"
                  )}
                >
                  {level === 1 ? '1 Mild' : level === 2 ? '2 Mod' : level === 3 ? '3 Sev' : '4 V.Sev'}
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>

      <div className="pt-4 mt-auto border-t border-gray-100 shrink-0">
        <button 
          onClick={onSubmit}
          disabled={loading}
          className="w-full bg-primary hover:bg-indigo-700 text-white font-medium h-12 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md shadow-indigo-200/50 disabled:opacity-70 text-sm"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Activity size={18} />
              <span>Predict Heart Disease Risk</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
