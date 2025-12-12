import React, { useCallback, useState } from 'react';
import { UploadCloud, Image as ImageIcon, X } from 'lucide-react';

interface UploadAreaProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
}

export const UploadArea: React.FC<UploadAreaProps> = ({ onFileSelect, selectedFile, onClear }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Generate preview when file changes
  React.useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [selectedFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onFileSelect(file);
      }
    }
  }, [onFileSelect]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  }, [onFileSelect]);

  if (selectedFile && previewUrl) {
    return (
      <div className="relative w-full h-64 md:h-96 rounded-xl overflow-hidden border-2 border-slate-200 bg-slate-50 group">
        <img 
          src={previewUrl} 
          alt="Preview" 
          className="w-full h-full object-contain"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button 
            onClick={onClear}
            className="bg-white text-red-600 p-3 rounded-full hover:bg-red-50 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        w-full h-64 md:h-96 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all
        ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'}
      `}
    >
      <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
        <div className="p-4 bg-white rounded-full shadow-sm mb-4">
          <UploadCloud className={`w-8 h-8 ${isDragging ? 'text-indigo-600' : 'text-slate-400'}`} />
        </div>
        <p className="text-lg font-medium text-slate-700 mb-1">
          Upload a photo
        </p>
        <p className="text-sm text-slate-500 text-center max-w-xs">
          Drag and drop or click to browse. <br/> Works best with clear selfies.
        </p>
        <input 
          type="file" 
          className="hidden" 
          accept="image/*"
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
};