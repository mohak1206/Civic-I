import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { compressImage } from '../../utils/imageCompression';
import { Button } from '../ui/Button';

export function PhotoCapture({ photo, onPhotoChange, onAnalyzingStart }) {
  const [compressing, setCompressing] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const processFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPEG, PNG, WebP).');
      return;
    }

    setError(null);
    setCompressing(true);
    if (onAnalyzingStart) onAnalyzingStart();

    try {
      const compressedDataUrl = await compressImage(file, 800, 0.72);
      onPhotoChange(compressedDataUrl);
    } catch (err) {
      console.error('Image compression failed:', err);
      setError('Failed to process image. Please try a different photo.');
    } finally {
      setCompressing(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleRemove = () => {
    onPhotoChange(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
        id="civic-photo-input"
      />

      {photo ? (
        <div className="relative rounded-2xl overflow-hidden border border-zinc-700 bg-zinc-950 aspect-video max-h-[300px] flex items-center justify-center group shadow-2xl">
          <img src={photo} alt="Reported issue preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              aria-label="Change photo"
              className="p-2.5 rounded-full bg-zinc-900/90 text-zinc-100 hover:bg-zinc-800 transition-colors shadow-lg"
            >
              <Camera className="w-5 h-5" />
            </button>
            <button
              onClick={handleRemove}
              aria-label="Delete photo"
              className="p-2.5 rounded-full bg-rose-500/90 text-white hover:bg-rose-600 transition-colors shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <span className="absolute bottom-2 right-2 text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-950/80 text-zinc-400 border border-zinc-800">
            Compressed for storage
          </span>
        </div>
      ) : (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-zinc-700 hover:border-emerald-500/60 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 bg-zinc-900/40 hover:bg-zinc-900/80 group"
        >
          <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-emerald-400 group-hover:scale-105 transition-all mb-3 shadow-inner">
            <Camera className="w-7 h-7" />
          </div>

          <p className="text-sm font-semibold text-zinc-200">
            {compressing ? 'Downscaling photo...' : 'Take or upload a photo'}
          </p>
          <p className="text-xs text-zinc-400 mt-1 max-w-xs">
            Capture potholes, garbage, or damaged structures. Photos are resized automatically to save storage.
          </p>

          <div className="flex items-center gap-2 mt-4">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              icon={Upload}
            >
              Browse Photo
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

