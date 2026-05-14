import React, { useState } from 'react';
import { Heart, Brain, Lightbulb, Apple, Dumbbell, Moon, Cigarette, Stethoscope, Wind, Droplets, Shield } from 'lucide-react';
import useStore from '../store/useStore';

const tipCategories = [
  { key: 'heart', label: 'Heart Health', icon: Heart, color: 'text-red-500' },
  { key: 'brain', label: 'Brain Health', icon: Brain, color: 'text-purple-500' },
  { key: 'general', label: 'General Wellness', icon: Shield, color: 'text-emerald-500' },
];

const tips = {
  heart: [
    { icon: Dumbbell, title: 'Exercise Regularly', desc: 'Aim for at least 30 minutes of moderate aerobic activity 5 days a week. Walking, cycling, and swimming are excellent options.' },
    { icon: Cigarette, title: 'Quit Smoking', desc: 'Smoking damages blood vessels and increases heart disease risk. Quitting at any age provides immediate and long-term benefits.' },
    { icon: Apple, title: 'Heart-Healthy Diet', desc: 'Focus on fruits, vegetables, whole grains, and lean proteins. Limit sodium, saturated fats, and processed foods.' },
    { icon: Droplets, title: 'Monitor Blood Pressure', desc: 'Keep blood pressure below 120/80 mmHg. Regular monitoring helps catch hypertension early.' },
    { icon: Moon, title: 'Manage Stress', desc: 'Chronic stress contributes to heart disease. Practice meditation, deep breathing, or yoga for stress management.' },
    { icon: Stethoscope, title: 'Regular Checkups', desc: 'Schedule annual cardiovascular screenings. Know your cholesterol, blood sugar, and blood pressure numbers.' },
  ],
  brain: [
    { icon: Stethoscope, title: 'Neurological Consultation', desc: 'Regular neurological exams help detect issues early. Report persistent headaches, vision changes, or cognitive concerns.' },
    { icon: Shield, title: 'Regular MRI Screening', desc: 'For high-risk individuals, periodic MRI scans can catch abnormalities before symptoms develop.' },
    { icon: Moon, title: 'Quality Sleep', desc: 'Get 7-9 hours of quality sleep. During sleep, your brain clears toxins and consolidates memories.' },
    { icon: Wind, title: 'Stress Management', desc: 'Chronic stress affects brain health. Practice mindfulness, meditation, or other relaxation techniques daily.' },
    { icon: Dumbbell, title: 'Mental Exercise', desc: 'Challenge your brain with puzzles, reading, learning new skills, or playing musical instruments to maintain cognitive health.' },
    { icon: Apple, title: 'Brain-Boosting Foods', desc: 'Eat omega-3 rich foods like fish, walnuts, and flaxseeds. Antioxidant-rich berries and leafy greens support brain function.' },
  ],
  general: [
    { icon: Droplets, title: 'Stay Hydrated', desc: 'Drink at least 8 glasses of water daily. Proper hydration supports every organ system in your body.' },
    { icon: Apple, title: 'Balanced Nutrition', desc: 'Follow a balanced diet with all essential nutrients. Include a variety of colorful fruits and vegetables daily.' },
    { icon: Moon, title: 'Prioritize Sleep', desc: 'Consistent sleep schedule and 7-9 hours of rest is essential for immune function and overall health.' },
    { icon: Dumbbell, title: 'Stay Active', desc: 'Mix cardio, strength training, and flexibility exercises. Even 15 minutes daily makes a significant difference.' },
    { icon: Shield, title: 'Preventive Care', desc: 'Stay up to date with vaccinations, screenings, and health checkups. Prevention is better than cure.' },
    { icon: Wind, title: 'Mental Wellness', desc: 'Maintain social connections, practice gratitude, and seek help when needed. Mental health is health.' },
  ],
};

export default function HealthTips() {
  const { theme } = useStore();
  const isLight = theme === 'light';
  const [activeCategory, setActiveCategory] = useState('heart');

  const card = isLight ? 'bg-white border border-gray-200 shadow-sm' : 'bg-slate-900 border border-slate-800';
  const muted = isLight ? 'text-gray-500' : 'text-slate-400';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className={`text-2xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>Health Tips</h1>
        <p className={`text-sm mt-1 ${muted}`}>Evidence-based recommendations for better health</p>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2">
        {tipCategories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all border ${
              activeCategory === cat.key
                ? 'bg-indigo-600 text-white border-indigo-600'
                : `${isLight ? 'border-gray-200 text-gray-600 hover:bg-gray-50' : 'border-slate-700 text-slate-400 hover:bg-slate-800'}`
            }`}
          >
            <cat.icon size={16} />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Tips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tips[activeCategory].map((tip, idx) => (
          <div key={idx} className={`${card} rounded-xl p-5 hover:scale-[1.01] transition-transform`}>
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                isLight ? 'bg-indigo-50' : 'bg-indigo-500/10'
              }`}>
                <tip.icon size={20} className="text-indigo-500" />
              </div>
              <div>
                <h3 className={`text-sm font-bold mb-1 ${isLight ? 'text-gray-800' : 'text-white'}`}>{tip.title}</h3>
                <p className={`text-xs leading-relaxed ${muted}`}>{tip.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
