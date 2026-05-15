import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, Calendar, Shield, Edit2, X, Loader2, AtSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import useStore from '../store/useStore';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, profile, updateProfile } = useAuth();
  const { theme } = useStore();
  const isLight = theme === 'light';
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    phone: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        username: profile.username || '',
        phone: profile.phone || ''
      });
    }
  }, [profile]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (err) {
      // Error handled in AuthContext
    } finally {
      setLoading(false);
    }
  };

  const card = isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-slate-900 border-slate-800 shadow-xl';
  const textMain = isLight ? 'text-gray-800' : 'text-white';
  const textMuted = isLight ? 'text-gray-500' : 'text-slate-400';
  const inputBg = isLight ? 'bg-gray-50 border-gray-200' : 'bg-slate-800 border-slate-700';

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold ${textMain}`}>My Profile</h1>
            <p className={textMuted}>Manage your personal information and health account</p>
          </div>
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium shadow-lg shadow-indigo-500/20"
          >
            <Edit2 size={16} />
            Edit Profile
          </button>
        </div>

        <div className={`${card} border rounded-2xl overflow-hidden`}>
          <div className="h-32 bg-gradient-to-r from-indigo-600 to-purple-600"></div>
          <div className="px-8 pb-8 relative">
            <div className="absolute -top-12 left-8">
              <div className={`w-24 h-24 rounded-2xl ${isLight ? 'bg-white' : 'bg-slate-800'} p-1 shadow-xl`}>
                <div className="w-full h-full rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 text-3xl font-bold">
                  {profile?.full_name?.[0] || user?.email?.[0]?.toUpperCase()}
                </div>
              </div>
            </div>

            <div className="mt-16 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className={`text-2xl font-bold ${textMain}`}>{profile?.full_name || 'Healthcare User'}</h2>
                <div className="flex items-center gap-2">
                  <AtSign size={14} className={textMuted} />
                  <p className={textMuted}>{profile?.username || user?.email?.split('@')[0]}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold uppercase tracking-wider border border-emerald-500/20">
                  Verified Patient
                </span>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isLight ? 'bg-gray-100' : 'bg-slate-800'}`}>
                    <Mail size={18} className="text-indigo-500" />
                  </div>
                  <div>
                    <p className={`text-xs ${textMuted} uppercase font-bold tracking-tight`}>Email Address</p>
                    <p className={`text-sm font-medium ${textMain}`}>{user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isLight ? 'bg-gray-100' : 'bg-slate-800'}`}>
                    <Phone size={18} className="text-indigo-500" />
                  </div>
                  <div>
                    <p className={`text-xs ${textMuted} uppercase font-bold tracking-tight`}>Phone Number</p>
                    <p className={`text-sm font-medium ${textMain}`}>{profile?.phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isLight ? 'bg-gray-100' : 'bg-slate-800'}`}>
                    <Calendar size={18} className="text-indigo-500" />
                  </div>
                  <div>
                    <p className={`text-xs ${textMuted} uppercase font-bold tracking-tight`}>Joined Since</p>
                    <p className={`text-sm font-medium ${textMain}`}>
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Recent'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isLight ? 'bg-gray-100' : 'bg-slate-800'}`}>
                    <Shield size={18} className="text-indigo-500" />
                  </div>
                  <div>
                    <p className={`text-xs ${textMuted} uppercase font-bold tracking-tight`}>Account Security</p>
                    <p className={`text-sm font-medium ${textMain}`}>Active Session</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Total Assessments', value: '12', color: 'bg-indigo-500' },
            { label: 'Completed Reports', value: '12', color: 'bg-emerald-500' },
            { label: 'Health Goals Met', value: '85%', color: 'bg-purple-500' },
          ].map((stat) => (
            <div key={stat.label} className={`${card} border rounded-2xl p-6 flex flex-col items-center text-center`}>
              <div className={`w-1 h-8 ${stat.color} rounded-full mb-4 opacity-50`}></div>
              <p className={`text-sm ${textMuted} mb-1`}>{stat.label}</p>
              <p className={`text-2xl font-bold ${textMain}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditing(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative w-full max-w-lg ${card} border rounded-3xl p-8 shadow-2xl`}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className={`text-2xl font-bold ${textMain}`}>Edit Profile</h2>
                <button 
                  onClick={() => setIsEditing(false)}
                  className={`p-2 rounded-lg hover:bg-white/5 transition-colors ${textMuted}`}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="space-y-5">
                <div className="space-y-2">
                  <label className={`text-sm font-medium ${textMuted} ml-1`}>Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className={`block w-full pl-10 pr-4 py-3 ${inputBg} border rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none ${textMain}`}
                      placeholder="Your full name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={`text-sm font-medium ${textMuted} ml-1`}>Username</label>
                  <div className="relative group">
                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className={`block w-full pl-10 pr-4 py-3 ${inputBg} border rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none ${textMain}`}
                      placeholder="Username"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={`text-sm font-medium ${textMuted} ml-1`}>Phone Number</label>
                  <div className="relative group">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={`block w-full pl-10 pr-4 py-3 ${inputBg} border rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none ${textMain}`}
                      placeholder="Phone number"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;

