import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Download, Minimize, Maximize, AlertTriangle } from 'lucide-react';
import { Button } from './Button';

interface ComparisonSliderProps {
  beforeImage: string;
  afterImage: string;
}

export const ComparisonSlider: React.FC<ComparisonSliderProps> = ({ beforeImage, afterImage }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = (x / rect.width) * 100;
    
    setSliderPosition(percentage);
  }, [isDragging]);
  
  const handleTouchMove = useCallback((e: TouchEvent) => {
     if (!isDragging || !containerRef.current) return;
     const rect = containerRef.current.getBoundingClientRect();
     const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width));
     const percentage = (x / rect.width) * 100;
     setSliderPosition(percentage);
  }, [isDragging]);

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchend', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchend', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, [handleMouseMove, handleMouseUp, handleTouchMove]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = afterImage;
    link.download = `headshot-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Use h-[600px] to ensure the slider always has height, instead of relying on flex parent
  const containerClass = isFullscreen 
    ? "fixed inset-0 z-50 bg-black flex items-center justify-center p-4" 
    : "relative w-full h-[600px] rounded-xl overflow-hidden shadow-lg border border-slate-200 bg-slate-200";

  const imageClass = isFullscreen
    ? "h-full w-full object-contain bg-black"
    : "absolute inset-0 w-full h-full object-cover";

  if (imageError) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 text-slate-500">
        <AlertTriangle className="w-10 h-10 mb-2 text-amber-500" />
        <p className="font-medium">Failed to load result image</p>
        <p className="text-sm">The generated image data was invalid.</p>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <div 
        ref={containerRef}
        className={`relative w-full ${isFullscreen ? 'h-full max-w-5xl mx-auto' : 'h-full'} select-none cursor-col-resize overflow-hidden`}
        style={{ 
            backgroundColor: '#e2e8f0', 
            backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', 
            backgroundSize: '20px 20px' 
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        {/* After Image (Background) - The Generated Headshot */}
        <img 
          src={afterImage} 
          alt="After" 
          className={imageClass} 
          onError={(e) => {
             console.error("Error loading after image", e);
             setImageError(true);
          }}
        />
        
        {/* Before Image (Foreground - Clipped) - The Original */}
        <div 
          className="absolute inset-0 w-full h-full overflow-hidden"
          style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
        >
          <img 
            src={beforeImage} 
            alt="Before" 
            className={imageClass}
          />
          {/* Label for Before */}
          <div className="absolute top-4 left-4 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-sm z-10">
            ORIGINAL
          </div>
        </div>

        {/* Label for After */}
        <div className="absolute top-4 right-4 bg-indigo-600/80 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-sm z-10">
          PROFESSIONAL AI
        </div>

        {/* Slider Handle */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-white cursor-col-resize shadow-[0_0_10px_rgba(0,0,0,0.5)] z-20"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
            <div className="flex gap-0.5">
              <div className="w-0.5 h-3 bg-slate-400"></div>
              <div className="w-0.5 h-3 bg-slate-400"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Overlay */}
      <div className="absolute bottom-4 right-4 flex gap-2 z-30">
         <Button variant="secondary" onClick={toggleFullscreen} className="bg-black/50 hover:bg-black/70 border-none backdrop-blur-md">
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
         </Button>
         <Button onClick={handleDownload} icon={<Download className="w-4 h-4" />} className="shadow-lg">
           Download HD
         </Button>
      </div>
    </div>
  );
};