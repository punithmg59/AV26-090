import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Brain, Activity, FileText, TrendingUp, AlertTriangle, Clock, ChevronRight } from 'lucide-react';
import useStore from '../store/useStore';
import { getAnalyticsSummary, getRecentPredictions } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { theme } = useStore();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const isLight = theme === 'light';
  const [summary, setSummary] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sumRes, recRes] = await Promise.all([
          getAnalyticsSummary(),
          getRecentPredictions(5),
        ]);
        setSummary(sumRes.data);
        setRecent(recRes.data.recent || []);
      } catch (e) {
        console.error('Dashboard fetch error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const card = isLight
    ? 'bg-white border border-gray-200 shadow-sm'
    : 'bg-slate-900 border border-slate-800';
  const muted = isLight ? 'text-gray-500' : 'text-slate-400';

  const stats = summary ? [
    { label: 'Total Predictions', value: summary.total_predictions, icon: Activity, color: 'text-indigo-500', bg: isLight ? 'bg-indigo-50' : 'bg-indigo-500/10' },
    { label: 'High Risk Cases', value: summary.risk_distribution?.high || 0, icon: AlertTriangle, color: 'text-red-500', bg: isLight ? 'bg-red-50' : 'bg-red-500/10' },
    { label: 'Avg Risk Score', value: `${summary.averages?.risk_score || 0}%`, icon: TrendingUp, color: 'text-amber-500', bg: isLight ? 'bg-amber-50' : 'bg-amber-500/10' },
    { label: 'Emergencies', value: summary.emergencies || 0, icon: Heart, color: 'text-rose-500', bg: isLight ? 'bg-rose-50' : 'bg-rose-500/10' },
  ] : [];

  const quickActions = [
    { label: 'Predictor', desc: 'Predict cardiac risk using ML', icon: Heart, color: 'text-red-500', path: '/predictor' },
    { label: 'Brain Tumor Detection', desc: 'Upload MRI for AI analysis', icon: Brain, color: 'text-purple-500', path: '/brain-tumor' },
    { label: 'View Reports', desc: 'Browse prediction history', icon: FileText, color: 'text-blue-500', path: '/history' },
  ];

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="h-8 w-48 rounded-lg bg-gray-200 dark:bg-slate-800 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className={`${card} rounded-xl h-28 animate-pulse`} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className={`text-2xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
          Welcome, {profile?.full_name || user?.email?.split('@')[0] || 'Member'}
        </h1>
        <p className={`text-sm mt-1 ${muted}`}>
          {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening'}, here's your health overview.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className={`${card} rounded-xl p-5`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-semibold uppercase tracking-wide ${muted}`}>{s.label}</span>
              <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                <s.icon size={16} className={s.color} />
              </div>
            </div>
            <p className={`text-2xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className={`text-sm font-semibold uppercase tracking-wide ${muted}`}>Quick Actions</h2>
          {quickActions.map((a) => (
            <button
              key={a.path}
              onClick={() => navigate(a.path)}
              className={`${card} rounded-xl p-4 w-full flex items-center gap-4 text-left hover:scale-[1.02] transition-transform`}
            >
              <div className={`w-10 h-10 rounded-lg ${isLight ? 'bg-gray-100' : 'bg-slate-800'} flex items-center justify-center`}>
                <a.icon size={20} className={a.color} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${isLight ? 'text-gray-800' : 'text-white'}`}>{a.label}</p>
                <p className={`text-xs ${muted} truncate`}>{a.desc}</p>
              </div>
              <ChevronRight size={16} className={muted} />
            </button>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className={`text-sm font-semibold uppercase tracking-wide ${muted}`}>Recent Predictions</h2>
            <button onClick={() => navigate('/history')} className="text-xs text-indigo-500 font-semibold hover:underline">View All</button>
          </div>
          <div className={`${card} rounded-xl divide-y ${isLight ? 'divide-gray-100' : 'divide-slate-800'}`}>
            {recent.length === 0 ? (
              <div className="p-8 text-center">
                <Activity size={32} className={`mx-auto mb-3 ${muted}`} />
                <p className={`text-sm ${muted}`}>No predictions yet. Start your first assessment!</p>
              </div>
            ) : (
              recent.map((r) => (
                <div key={r.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      r.risk_level === 'HIGH RISK' ? 'bg-red-500' :
                      r.risk_level === 'MODERATE RISK' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`} />
                    <div>
                      <p className={`text-sm font-medium ${isLight ? 'text-gray-800' : 'text-white'}`}>
                        {r.disease_type === 'heart' ? 'Heart Disease' : 'Brain Tumor'} Assessment
                      </p>
                      <p className={`text-xs ${muted}`}>
                        <Clock size={10} className="inline mr-1" />
                        {r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                    r.risk_level === 'HIGH RISK' ? (isLight ? 'bg-red-50 text-red-600' : 'bg-red-500/10 text-red-400') :
                    r.risk_level === 'MODERATE RISK' ? (isLight ? 'bg-amber-50 text-amber-600' : 'bg-amber-500/10 text-amber-400') :
                    (isLight ? 'bg-emerald-50 text-emerald-600' : 'bg-emerald-500/10 text-emerald-400')
                  }`}>{r.risk_level}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
