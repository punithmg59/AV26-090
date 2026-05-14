import { create } from 'zustand';

const getStoredTheme = () => {
  try { return localStorage.getItem('theme') || 'dark'; } catch { return 'dark'; }
};

const getStoredLang = () => {
  try { return localStorage.getItem('language') || 'en'; } catch { return 'en'; }
};

const useStore = create((set) => ({
  // Sidebar
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  // Theme
  theme: getStoredTheme(),
  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    set({ theme });
  },
  toggleTheme: () => set((s) => {
    const next = s.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', next);
    return { theme: next };
  }),

  // Language
  language: getStoredLang(),
  setLanguage: (lang) => {
    localStorage.setItem('language', lang);
    set({ language: lang });
  },

  // Form Data
  formData: {
    age: 24, sex: 1, cp: 2, trestbps: 140, chol: 246, fbs: 0,
    thalach: 150, exang: 0, smoking: 0, stress_level: 5,
    short_breath: 0, fatigue: 0, chest_location: 1,
    left_arm_pain: 0, pain_severity: 2,
  },
  setFormData: (data) => set((s) => ({ formData: { ...s.formData, ...data } })),

  // Body Selection
  selectedAreas: [],
  toggleArea: (area) => set((s) => ({
    selectedAreas: s.selectedAreas.includes(area)
      ? s.selectedAreas.filter((a) => a !== area)
      : [...s.selectedAreas, area]
  })),

  // Uploads
  uploadedFiles: [],
  setUploadedFiles: (files) => set({ uploadedFiles: files }),

  // Notifications
  notifications: true,
  setNotifications: (val) => set({ notifications: val }),
}));

export default useStore;
