import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Calendar, Shield, Edit2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import useStore from '../store/useStore';

const Profile = () => {
  const { user, profile } = useAuth();
  const { theme } = useStore();
  const isLight = theme === 'light';

  const card = isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-slate-900 border-slate-800 shadow-xl';
  const textMain = isLight ? 'text-gray-800' : 'text-white';
  const textMuted = isLight ? 'text-gray-500' : 'text-slate-400';

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <h1 className={`text-3xl font-bold ${textMain}`}>My Profile</h1>
          <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium">
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
                <p className={textMuted}>{user?.email}</p>
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
                    <p className={`text-sm font-medium ${textMain}`}>Two-factor Enabled</p>
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
    </div>
  );
};

export default Profile;
