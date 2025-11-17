'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from '@/components/GameObject/BackgroundMusic.module.css';
import { FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

interface BackgroundMusicProps {
	url: string;
	className?: string;
}

export const BackgroundMusic = ({
	url,
	className = '',
}: BackgroundMusicProps) => {
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const [isPlaying, setIsPlaying] = useState(false);

	const togglePlayPause = useCallback(() => {
		const audio = audioRef.current;
		if (!audio) {
			return;
		}

		if (isPlaying) {
			audio.pause();
			setIsPlaying(false);
			return;
		}

		audio
			.play()
			.then(() => setIsPlaying(true))
			.catch(error => {
				console.error('Failed to play audio:', error);
				setIsPlaying(false);
			});
	}, [isPlaying]);

	useEffect(() => {
		const audio = new Audio(url);
		audio.loop = true;
		audioRef.current = audio;
		setIsPlaying(false);

		return () => {
			audio.pause();
			audioRef.current = null;
		};
	}, [url]);

	return (
		<div className={`${styles.buttonContainer} ${className}`}>
			<button
				className={`${styles.miniPixelButton} ${isPlaying ? styles.on : styles.off}`}
				onClick={togglePlayPause}
			>
				{isPlaying ? (
					<FaVolumeUp style={{ width: '60%', height: '60%' }} />
				) : (
					<FaVolumeMute style={{ width: '60%', height: '60%' }} />
				)}
			</button>
		</div>
	);
};
