"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff } from "lucide-react";

export function VideoPreview() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasVideo, setHasVideo] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false, // Audio handled separately if needed
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasVideo(true);
        }
      } catch (err) {
        console.error("Camera access denied or unavailable", err);
        setError(true);
      }
    }

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="relative w-full aspect-video bg-muted rounded-xl overflow-hidden border border-border flex items-center justify-center">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover mirror ${hasVideo ? "opacity-100" : "opacity-0 absolute"}`}
        style={{ transform: "scaleX(-1)" }}
      />
      
      {!hasVideo && (
        <div className="flex flex-col items-center gap-2 text-muted-foreground absolute z-10">
          {error ? <CameraOff className="w-8 h-8" /> : <Camera className="w-8 h-8 opacity-50" />}
          <span className="text-[12px] font-medium">
            {error ? "Camera unavailable" : "Starting camera..."}
          </span>
        </div>
      )}
      
      {/* Recording Indicator */}
      {hasVideo && (
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2 py-1 rounded-md text-white text-[11px] font-medium">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          REC
        </div>
      )}
    </div>
  );
}
