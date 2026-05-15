import React, { useEffect, useState } from 'react';
import { Trash2, Eye, Clock, Heart, Loader2, Inbox } from 'lucide-react';
import useStore from '../store/useStore';
import { getHistory } from '../services/api';
import { getXrayHistory } from '../services/xrayApi';
import { useNavigate } from 'react-router-dom';

export default function HistoryPage() {
  const { theme } = useStore();
  const isLight = theme === 'light';
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  const card = isLight ? 'bg-white border border-gray-200 shadow-sm' : 'bg-slate-900 border border-slate-800';
  const muted = isLight ? 'text-gray-500' : 'text-slate-400';

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter !== 'all') params.disease_type = filter;
      
      // Fetch all history types
      const [heartRes, xrayRes, mriRes] = await Promise.all([
        getHistory(params),
        getXrayHistory(),
        getMriHistory()
      ]);

      const heartRecords = (heartRes.data.history || []).map(r => ({ ...r, type: 'heart' }));
      const xrayRecords = (xrayRes || []).map(r => ({ ...r, type: 'xray' }));
      const mriRecords = (mriRes.data || []).map(r => ({ ...r, type: 'mri' }));

      let combined = [...heartRecords, ...xrayRecords, ...mriRecords];
      
      // Filter if needed
      if (filter === 'heart') combined = combined.filter(r => r.type === 'heart');
      if (filter === 'xray') combined = combined.filter(r => r.type === 'xray');
      if (filter === 'mri') combined = combined.filter(r => r.type === 'mri');

      // Sort by date
      combined.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setRecords(combined);
      setTotal(combined.length);
    } catch (e) {
      console.error('History fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, [filter]);

  const handleViewReport = (r) => {
    if (r.type === 'mri' || r.type === 'xray') {
      // Parse report if it's a string
      let reportData = r.report;
      if (typeof reportData === 'string') {
        try {
          reportData = JSON.parse(reportData.replace(/'/g, '"'));
        } catch (e) {
          console.error("Report parse error", e);
        }
      }
      navigate('/report', { state: { result: { ...r, report: reportData, type: r.type } } });
    } else {
      // Heart report handling (if exists)
      navigate('/report', { state: { result: r } });
    }
  };

  const riskBadge = (level) => {
    const l = (level || '').toUpperCase();
    if (l.includes('HIGH') || l === 'PNEUMONIA' || l === 'TUMOR') return isLight ? 'bg-red-50 text-red-600 border-red-200' : 'bg-red-500/10 text-red-400 border-red-500/20';
    if (l.includes('MODERATE')) return isLight ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    return isLight ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  };

  const API_URL = 'http://127.0.0.1:8000';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>Reports History</h1>
          <p className={`text-sm mt-1 ${muted}`}>{total} total diagnostic records</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'heart', 'xray', 'mri'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
              filter === f
                ? 'bg-indigo-600 text-white border-indigo-600'
                : `${isLight ? 'border-gray-200 text-gray-600 hover:bg-gray-50' : 'border-slate-700 text-slate-400 hover:bg-slate-800'}`
            }`}
          >
            {f === 'all' ? 'All' : f === 'heart' ? 'Heart' : f === 'xray' ? 'X-Ray' : 'MRI'}
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
          <p className={`text-sm font-medium ${muted}`}>No diagnostic records found</p>
          <p className={`text-xs mt-1 ${muted}`}>Start an assessment to see history here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((r) => (
            <div key={`${r.type}-${r.id}`} className={`${card} rounded-xl p-5 flex items-center justify-between hover:scale-[1.01] transition-all`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden ${
                  isLight ? 'bg-gray-100' : 'bg-slate-800'
                }`}>
                  {(r.type === 'xray' || r.type === 'mri') ? (
                    <img 
                      src={`${API_URL}/${r.image_path}`} 
                      className="w-full h-full object-cover" 
                      alt="Thumbnail"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/50?text=IMG'; }}
                    />
                  ) : (
                    <Heart size={20} className="text-red-500" />
                  )}
                </div>
                <div>
                  <p className={`text-sm font-semibold ${isLight ? 'text-gray-800' : 'text-white'}`}>
                    {r.type === 'xray' ? 'Chest X-Ray Analysis' : r.type === 'mri' ? 'Brain MRI Analysis' : 'Heart Disease Assessment'} #{r.id}
                  </p>
                  <div className={`flex items-center gap-3 text-xs mt-1 ${muted}`}>
                    <span className="flex items-center gap-1"><Clock size={10} />{r.created_at ? new Date(r.created_at).toLocaleString() : 'N/A'}</span>
                    <span>Confidence: {r.confidence}%</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${riskBadge(r.risk_level || r.prediction)}`}>
                  {r.risk_level || r.prediction}
                </span>
                <button 
                  onClick={() => handleViewReport(r)}
                  className={`p-2 rounded-lg ${isLight ? 'hover:bg-gray-100' : 'hover:bg-slate-800'} text-primary transition-colors`}
                >
                  <Eye size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
