// src/components/jade/shared/CameraPreview.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function CameraPreview({ stream }: { stream: MediaStream | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [isOpen, stream]);

  return (
    <div className="absolute bottom-5 right-5 z-50 flex flex-col items-end gap-2">
      {isOpen && (
        <div className="w-48 h-36 bg-black/80 rounded-lg overflow-hidden border border-white/20 shadow-xl backdrop-blur-md">
          {stream ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform -scale-x-100"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/50 text-xs">
              Waiting...
            </div>
          )}
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 rounded-full bg-white/10 text-white border border-white/10 hover:bg-white/20 transition-all"
      >
        {isOpen ? 'Close Cam' : 'Check Hand'}
      </button>
    </div>
  );
}