"use client"

import React, { useEffect, useRef, useState } from 'react';
import './BackgroundMusic.css'
import { FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

interface BackgroundMusicProps {
  url: string;
  className?: string; // 선택적 className prop 추가
}

export const BackgroundMusic = ({ url, className = '' }: BackgroundMusicProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);


  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch((error) => {
          console.error("Failed to play audio:", error);
          setIsPlaying(false);
          return;
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    audioRef.current = new Audio(url);
    audioRef.current.loop = true;

    togglePlayPause()

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [url]);

  return (
      <div className={`button-container ${className}`}> {/* className prop 적용 */}
        <button
            className={`mini-pixel-button ${isPlaying ? 'on' : 'off'}`}
            onClick={togglePlayPause}
        >
          {isPlaying ? <FaVolumeUp style={{ width: '60%', height: '60%' }} /> : <FaVolumeMute style={{ width: '60%', height: '60%' }} />}
        </button>
      </div>
  );
}