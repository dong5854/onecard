import React, { useEffect, useRef, useState } from 'react';
import './BackgroundMusic.css'
import { FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

interface BackgroundMusicProps {
  url : string
}

export const BackgroundMusic = ({url}: BackgroundMusicProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    audioRef.current = new Audio(url);
    audioRef.current.loop = true;

    const playAudio = () => {
      if (audioRef.current) {
        audioRef.current.play().catch((error) => {
          console.error("Failed to play audio:", error);
        });
      }
    };

    playAudio();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };

  }, [url]);

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
            className={`pixel-button ${isPlaying ? 'off' : 'on'}`}
            onClick={togglePlayPause}
        >
          {isPlaying ? <FaVolumeMute size={24}/> : <FaVolumeUp size={24}/>}
        </button>
      </div>
  );
}
