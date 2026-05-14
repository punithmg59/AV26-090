import React, { useState, useRef } from 'react';
import { Upload, X, File, CheckCircle, AlertCircle } from 'lucide-react';

export default function DocumentUploader({ onFilesSelected }) {
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const SUPPORTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
  const SUPPORTED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const validateFile = (file) => {
    if (!SUPPORTED_TYPES.includes(file.type) && 
        !SUPPORTED_EXTENSIONS.includes(`.${file.name.split('.').pop().toLowerCase()}`)) {
      return { valid: false, error: 'Unsupported file type. Please upload PDF, JPG, PNG, or JPEG.' };
    }
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: 'File size exceeds 10MB limit.' };
    }
    return { valid: true };
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  };

  const processFiles = (fileList) => {
    const newFiles = [];

    for (let file of fileList) {
      const validation = validateFile(file);
      if (validation.valid) {
        newFiles.push({
          id: Math.random().toString(36).substr(2, 9),
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          progress: 0,
          status: 'pending',
        });
      } else {
        alert(validation.error);
      }
    }

    setFiles(prev => [...prev, ...newFiles]);
    if (onFilesSelected) {
      onFilesSelected([...files, ...newFiles].map(f => f.file));
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    processFiles(selectedFiles);
  };

  const removeFile = (id) => {
    const updatedFiles = files.filter(f => f.id !== id);
    setFiles(updatedFiles);
    if (onFilesSelected) {
      onFilesSelected(updatedFiles.map(f => f.file));
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    switch (ext) {
      case 'pdf':
        return '📄';
      case 'jpg':
      case 'jpeg':
      case 'png':
        return '🖼️';
      default:
        return '📋';
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">Upload Medical Reports</h3>
        <p className="text-sm text-slate-600">Upload MRI, ECG, blood reports, scans, or medical documents</p>
      </div>

      {/* Drag and Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 md:p-12 transition-all duration-300 cursor-pointer group ${
          dragActive
            ? 'border-purple-500 bg-purple-50 shadow-lg scale-[1.02]'
            : 'border-slate-200 bg-slate-50 hover:border-purple-400 hover:bg-purple-50/30'
        }`}
      >
        {/* Animated Background Glow */}
        <div
          className={`absolute inset-0 rounded-2xl transition-opacity duration-300 ${
            dragActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
          }`}
          style={{
            background:
              'radial-gradient(circle at center, rgba(168, 85, 247, 0.05) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Content */}
        <div className="relative flex flex-col items-center justify-center text-center space-y-4">
          <div
            className={`transition-transform duration-300 ${
              dragActive ? 'scale-125' : 'group-hover:scale-110'
            }`}
          >
            <Upload
              size={48}
              className={`transition-colors duration-300 ${
                dragActive ? 'text-purple-600' : 'text-slate-400 group-hover:text-purple-500'
              }`}
            />
          </div>

          <div>
            <p className="text-lg font-semibold text-slate-900">
              {dragActive ? 'Drop files here' : 'Drag and drop files here'}
            </p>
            <p className="text-sm text-slate-600 mt-1">
              {dragActive ? '' : 'or click to select files'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 justify-center pt-2">
            {SUPPORTED_EXTENSIONS.map((ext) => (
              <span
                key={ext}
                className="px-3 py-1 text-xs font-medium bg-white text-slate-700 rounded-full border border-slate-200"
              >
                {ext.toUpperCase()}
              </span>
            ))}
          </div>

          <p className="text-xs text-slate-500 pt-2">Max file size: 10MB</p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={SUPPORTED_TYPES.join(',')}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-700">
              {files.length} file{files.length !== 1 ? 's' : ''} selected
            </p>
            <span className="text-xs text-slate-500">
              Total: {formatFileSize(files.reduce((sum, f) => sum + f.size, 0))}
            </span>
          </div>

          {/* File Cards */}
          <div className="grid gap-3 md:grid-cols-2">
            {files.map((fileItem) => (
              <div
                key={fileItem.id}
                className="flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all duration-300 group"
              >
                {/* Icon */}
                <div className="flex-shrink-0 text-2xl mt-1">
                  {getFileIcon(fileItem.file)}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {fileItem.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatFileSize(fileItem.size)}
                  </p>

                  {/* Status Badge */}
                  <div className="mt-2 flex items-center gap-1">
                    {fileItem.status === 'pending' && (
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">
                        Ready
                      </span>
                    )}
                    {fileItem.status === 'uploading' && (
                      <span className="text-xs px-2 py-1 rounded-full bg-yellow-50 text-yellow-700 font-medium flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-yellow-600 animate-pulse" />
                        Uploading
                      </span>
                    )}
                    {fileItem.status === 'processing' && (
                      <span className="text-xs px-2 py-1 rounded-full bg-purple-50 text-purple-700 font-medium flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
                        Processing
                      </span>
                    )}
                    {fileItem.status === 'success' && (
                      <span className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-700 font-medium flex items-center gap-1">
                        <CheckCircle size={12} />
                        Processed
                      </span>
                    )}
                    {fileItem.status === 'error' && (
                      <span className="text-xs px-2 py-1 rounded-full bg-red-50 text-red-700 font-medium flex items-center gap-1">
                        <AlertCircle size={12} />
                        Error
                      </span>
                    )}
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeFile(fileItem.id)}
                  className="flex-shrink-0 p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200 opacity-0 group-hover:opacity-100"
                  title="Remove file"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>

          {/* Progress Bar (Optional - shown when uploading) */}
          {files.some((f) => f.status === 'uploading' || f.status === 'processing') && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-600">Processing documents...</p>
              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 animate-pulse" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Box */}
      <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-2">
        <p className="text-sm font-medium text-blue-900 flex items-center gap-2">
          <span className="text-base">ℹ️</span>
          <span>Supporting Document Types</span>
        </p>
        <ul className="text-xs text-blue-800 space-y-1 ml-6">
          <li>• Blood Reports (cholesterol, glucose, etc.)</li>
          <li>• ECG Reports & Images</li>
          <li>• X-ray & CT Scan Images</li>
          <li>• MRI Reports & Scans</li>
          <li>• Lab Work Documents</li>
        </ul>
      </div>
    </div>
  );
}
