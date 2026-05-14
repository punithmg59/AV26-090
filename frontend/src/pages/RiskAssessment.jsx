import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import BodySelector from '../components/BodySelector';
import MedicalForm from '../components/MedicalForm';
import DocumentUploader from '../components/DocumentUploader';

export default function RiskAssessment() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    age: 19, sex: 1, cp: 2, trestbps: 148, chol: 245,
    fbs: 1, thalach: 158, exang: 1, smoking: 1,
    stress_level: 8, short_breath: 1, fatigue: 1,
    chest_location: 1, left_arm_pain: 1, pain_severity: 3
  });

  const [selectedAreas, setSelectedAreas] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  useEffect(() => {
    // Detect chest pain from any chest-related body part key
    const chestSelected = selectedAreas.some(a =>
      a.includes('chest') || a === 'upper_abdomen'
    ) ? 1 : 0;
    // Detect left arm pain from arm-related keys
    const leftArmSelected = selectedAreas.some(a =>
      a === 'left_arm' || a === 'left_forearm' || a === 'left_upper_arm'
    ) ? 1 : 0;

    setFormData(prev => ({
      ...prev,
      chest_location: chestSelected,
      left_arm_pain: leftArmSelected
    }));
  }, [selectedAreas]);

  const toggleArea = (area) => {
    setSelectedAreas(prev => 
      prev.includes(area) 
        ? prev.filter(a => a !== area)
        : [...prev, area]
    );
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setLoading(true);
    setError(null);
    
    try {
      // Prepare form data with multipart/form-data
      const formDataPayload = new FormData();
      
      // Add form fields
      for (const key in formData) {
        formDataPayload.append(key, Number(formData[key]));
      }
      
      // Add pain areas
      formDataPayload.append('pain_areas', JSON.stringify(selectedAreas));
      
      // Add uploaded files
      uploadedFiles.forEach((file, index) => {
        formDataPayload.append(`documents`, file);
      });
      
      const response = await axios.post(
        "http://127.0.0.1:8000/predict-heart-multimodal",
        formDataPayload,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      navigate('/report', { state: { result: response.data } });
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.detail || "Failed to process prediction.";
      alert(`Error: ${errorMessage}`);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 min-h-full w-full max-w-[1600px] mx-auto">
      {/* Top Section: Form and Body Selector */}
      <div className="flex flex-col lg:flex-row gap-6 w-full">
        {/* Larger space for the 3D model */}
        <div className="w-full lg:w-[60%] xl:w-[65%] min-h-[600px] flex flex-col shrink-0">
          <BodySelector selectedAreas={selectedAreas} toggleArea={toggleArea} />
        </div>
        
        <div className="w-full lg:flex-1 flex flex-col">
          <MedicalForm 
            formData={formData} 
            setFormData={setFormData} 
            onSubmit={handleSubmit} 
            loading={loading} 
          />
        </div>
      </div>

      {/* Document Upload Section */}
      <div className="w-full bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
        <DocumentUploader onFilesSelected={setUploadedFiles} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="w-full p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
