import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { predictHeart } from '../services/api';

import BodySelector from '../components/BodySelector';
import MedicalForm from '../components/MedicalForm';
import DocumentUploader from '../components/DocumentUploader';

export default function RiskAssessment() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { theme, formData, setFormData, selectedAreas, uploadedFiles, setUploadedFiles } = useStore();
  const isLight = theme === 'light';

  const card = isLight ? 'bg-white border border-gray-200 shadow-sm' : 'bg-slate-900 border border-slate-800';

  useEffect(() => {
    const chestSelected = selectedAreas.some(a => a.includes('chest') || a === 'upper_abdomen') ? 1 : 0;
    const leftArmSelected = selectedAreas.some(a => a === 'left_arm' || a === 'left_forearm' || a === 'left_upper_arm') ? 1 : 0;
    
    // Only update if values actually changed to avoid infinite re-render loop
    if (formData.chest_location !== chestSelected || formData.left_arm_pain !== leftArmSelected) {
      setFormData({ chest_location: chestSelected, left_arm_pain: leftArmSelected });
    }
  }, [selectedAreas, formData.chest_location, formData.left_arm_pain, setFormData]);

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setError(null);

    // Validation
    if (uploadedFiles.length === 0) {
      setError("Please upload a medical document (X-Ray or Blood Report).");
      return;
    }

    if (selectedAreas.length === 0) {
      setError("Please select at least one pain area on the body model.");
      return;
    }

    if (!formData.age || !formData.trestbps || !formData.chol || !formData.thalach) {
      setError("Please fill all required clinical information (Age, BP, Cholesterol, Heart Rate).");
      return;
    }

    setLoading(true);
    try {
      const payload = new FormData();
      for (const key in formData) {
        payload.append(key, Number(formData[key]));
      }
      payload.append('pain_areas', JSON.stringify(selectedAreas));
      
      // If we are appending multiple files, we should use the actual file object
      uploadedFiles.forEach((file) => {
        // If file is an object with originalFile property (from our DocumentUploader)
        // or just a regular File object.
        const actualFile = file.originalFile ? file.originalFile : file;
        payload.append('documents', actualFile);
      });

      const response = await predictHeart(payload);
      navigate('/report', { state: { result: response.data } });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to process prediction.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      <div>
        <h1 className={`text-2xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>Disease Assessment</h1>
        <p className={`text-sm mt-1 ${isLight ? 'text-gray-500' : 'text-slate-400'}`}>Upload medical documents for AI-powered disease analysis</p>
      </div>

      {/* Upload Section */}
      <div className={`${card} rounded-xl p-6`}>
        <DocumentUploader onFilesSelected={setUploadedFiles} />
      </div>

      {/* Main Grid: Form (Left) + 3D Body (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <div className={`${card} rounded-xl p-6`}>
            <MedicalForm onSubmit={handleSubmit} loading={loading} />
          </div>
        </div>
        <div className="lg:col-span-7">
          <BodySelector />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className={`p-4 rounded-xl text-sm ${isLight ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
          {error}
        </div>
      )}
    </div>
  );
}
