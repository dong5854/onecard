import React, { useEffect, useRef, useState } from 'react';
import './BackgroundMusic.css'
import { FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

interface BackgroundMusicProps {
  url : string
}

export const BackgroundMusic = ({url}: BackgroundMusicProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isUserInteracted, setIsUserInteracted] = useState(false);

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play().catch((error) => {
        console.error("Failed to play audio:", error);
      });
    }
  };

  useEffect(() => {
    audioRef.current = new Audio(url);
    audioRef.current.loop = true;

    playAudio();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [url]);

  useEffect(() => {
    const handleUserInteraction = () => {
      if (!isUserInteracted) {
        setIsUserInteracted(true);
        playAudio();
      }
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, [isUserInteracted]);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch((error) => {
          console.error("Failed to play audio:", error);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
      <div className="button-container">
        <button
            className={`mini-pixel-button ${isPlaying ? 'on' : 'off'}`}
            onClick={togglePlayPause}
        >
          {isPlaying ? <FaVolumeUp style={{ width: '60%', height: '60%' }} /> : <FaVolumeMute style={{ width: '60%', height: '60%' }} />}
        </button>
      </div>
  );
}
