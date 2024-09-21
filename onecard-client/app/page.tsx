'use client';

import { useState } from 'react';
import GameTitle from '@/components/UI/GameTitle';
import PixelRetroButton from '@/components/UI/PixelRetroButton';
import GameSettingsModal from '@/components/UI/GameSettingsModal';
import { useRouter } from 'next/navigation';

export default function MainPage() {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [gameSettings, setGameSettings] = useState(null);
	const router = useRouter();

	const handleGameSettingsSubmit = (settings: any) => {
		setGameSettings(settings);
		setIsModalOpen(false);

		console.log('Game settings:', settings);

		const params = new URLSearchParams({
			mode: settings.mode,
			players: settings.numberOfPlayers.toString(),
			jokers: settings.includeJokers ? 'true' : 'false',
			initHand: settings.initHandSize.toString(),
			maxHand: settings.maxHandSize.toString(),
		});

		router.push(`/game/single-player?${params.toString()}`);
	};
	return (
		<div className="flex flex-col justify-center items-center mb-40">
			<GameTitle title="ONE CARD" subtitle="WEB GAME" />
			<PixelRetroButton
				text="START GAME"
				className="mt-6"
				onClick={() => setIsModalOpen(true)}
			/>

			{isModalOpen && <GameSettingsModal onSubmit={handleGameSettingsSubmit} />}
		</div>
	);
}
