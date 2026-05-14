import React, { useEffect, useState } from 'react';
import { BarChart3, Loader2, TrendingUp, Activity, Heart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from 'recharts';
import useStore from '../store/useStore';
import { getAnalyticsSummary, getPredictionTrends } from '../services/api';

const COLORS = ['#ef4444', '#f59e0b', '#10b981'];

export default function AnalyticsPage() {
  const { theme } = useStore();
  const isLight = theme === 'light';
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  const card = isLight ? 'bg-white border border-gray-200 shadow-sm' : 'bg-slate-900 border border-slate-800';
  const muted = isLight ? 'text-gray-500' : 'text-slate-400';

  useEffect(() => {
    const load = async () => {
      try {
        const [sRes, tRes] = await Promise.all([getAnalyticsSummary(), getPredictionTrends()]);
        setSummary(sRes.data);
        setTrends(tRes.data.trends || []);
      } catch (e) {
        console.error('Analytics error:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  const riskData = summary ? [
    { name: 'High', value: summary.risk_distribution.high },
    { name: 'Moderate', value: summary.risk_distribution.moderate },
    { name: 'Low', value: summary.risk_distribution.low },
  ] : [];

  const avgData = summary ? [
    { name: 'BP', value: summary.averages.blood_pressure },
    { name: 'Chol', value: summary.averages.cholesterol },
    { name: 'HR', value: summary.averages.heart_rate },
    { name: 'Risk %', value: summary.averages.risk_score },
  ] : [];

  const textColor = isLight ? '#374151' : '#94a3b8';
  const gridColor = isLight ? '#e5e7eb' : '#1e293b';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className={`text-2xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>Analytics</h1>
        <p className={`text-sm mt-1 ${muted}`}>Insights from your prediction data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution */}
        <div className={`${card} rounded-xl p-6`}>
          <h2 className={`text-sm font-semibold mb-4 ${isLight ? 'text-gray-800' : 'text-white'}`}>Risk Distribution</h2>
          {riskData.every(d => d.value === 0) ? (
            <div className="flex items-center justify-center py-12">
              <p className={`text-sm ${muted}`}>No data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={riskData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {riskData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="flex justify-center gap-6 mt-2">
            {riskData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                <span className={muted}>{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Average Metrics */}
        <div className={`${card} rounded-xl p-6`}>
          <h2 className={`text-sm font-semibold mb-4 ${isLight ? 'text-gray-800' : 'text-white'}`}>Average Metrics</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={avgData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="name" tick={{ fill: textColor, fontSize: 12 }} />
              <YAxis tick={{ fill: textColor, fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: isLight ? '#fff' : '#1e293b', border: 'none', borderRadius: 8 }} />
              <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Prediction Trends */}
        <div className={`${card} rounded-xl p-6 lg:col-span-2`}>
          <h2 className={`text-sm font-semibold mb-4 ${isLight ? 'text-gray-800' : 'text-white'}`}>Prediction Trends (Last 30 Days)</h2>
          {trends.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className={`text-sm ${muted}`}>Not enough data for trends yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="date" tick={{ fill: textColor, fontSize: 11 }} />
                <YAxis tick={{ fill: textColor, fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: isLight ? '#fff' : '#1e293b', border: 'none', borderRadius: 8 }} />
                <Line type="monotone" dataKey="avg_risk" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} name="Avg Risk %" />
                <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name="Predictions" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
