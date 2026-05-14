import React, { useEffect, useState } from 'react';
import { FileText, Trash2, Eye, Clock, AlertTriangle, Heart, Loader2, Inbox } from 'lucide-react';
import useStore from '../store/useStore';
import { getHistory, deleteHistory, clearHistory } from '../services/api';

export default function HistoryPage() {
  const { theme } = useStore();
  const isLight = theme === 'light';
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const card = isLight ? 'bg-white border border-gray-200 shadow-sm' : 'bg-slate-900 border border-slate-800';
  const muted = isLight ? 'text-gray-500' : 'text-slate-400';

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter !== 'all') params.disease_type = filter;
      const res = await getHistory(params);
      setRecords(res.data.history || []);
      setTotal(res.data.total || 0);
    } catch (e) {
      console.error('History fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, [filter]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      await deleteHistory(id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
      setTotal((t) => t - 1);
    } catch (e) {
      alert('Failed to delete');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Delete ALL prediction history? This cannot be undone.')) return;
    try {
      await clearHistory();
      setRecords([]);
      setTotal(0);
    } catch (e) {
      alert('Failed to clear history');
    }
  };

  const riskBadge = (level) => {
    if (level === 'HIGH RISK') return isLight ? 'bg-red-50 text-red-600 border-red-200' : 'bg-red-500/10 text-red-400 border-red-500/20';
    if (level === 'MODERATE RISK') return isLight ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    return isLight ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>Reports History</h1>
          <p className={`text-sm mt-1 ${muted}`}>{total} total prediction records</p>
        </div>
        {records.length > 0 && (
          <button onClick={handleClearAll} className="text-xs font-semibold text-red-500 hover:underline flex items-center gap-1">
            <Trash2 size={12} /> Clear All
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'heart'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
              filter === f
                ? 'bg-indigo-600 text-white border-indigo-600'
                : `${isLight ? 'border-gray-200 text-gray-600 hover:bg-gray-50' : 'border-slate-700 text-slate-400 hover:bg-slate-800'}`
            }`}
          >
            {f === 'all' ? 'All' : 'Heart Disease'}
          </button>
        ))}
      </div>

      {/* Records */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-indigo-500" />
        </div>
      ) : records.length === 0 ? (
        <div className={`${card} rounded-xl p-12 text-center`}>
          <Inbox size={48} className={`mx-auto mb-4 ${muted}`} />
          <p className={`text-sm font-medium ${muted}`}>No prediction records found</p>
          <p className={`text-xs mt-1 ${muted}`}>Start an assessment to see history here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((r) => (
            <div key={r.id} className={`${card} rounded-xl p-5 flex items-center justify-between`}>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  isLight ? 'bg-gray-100' : 'bg-slate-800'
                }`}>
                  <Heart size={20} className="text-red-500" />
                </div>
                <div>
                  <p className={`text-sm font-semibold ${isLight ? 'text-gray-800' : 'text-white'}`}>
                    Heart Disease Assessment #{r.id}
                  </p>
                  <div className={`flex items-center gap-3 text-xs mt-1 ${muted}`}>
                    <span className="flex items-center gap-1"><Clock size={10} />{r.created_at ? new Date(r.created_at).toLocaleString() : 'N/A'}</span>
                    <span>Confidence: {r.confidence}%</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${riskBadge(r.risk_level)}`}>
                  {r.risk_level}
                </span>
                <button onClick={() => handleDelete(r.id)} className={`p-2 rounded-lg ${isLight ? 'hover:bg-gray-100' : 'hover:bg-slate-800'} text-red-400 transition-colors`}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
