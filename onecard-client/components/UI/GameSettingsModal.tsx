'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ChangeEvent, MouseEvent } from 'react';
import PixelRetroButton from '@/components/UI/PixelRetroButton';
import styles from '@/components/UI/GameSettingModal.module.css';
import { GameSettings, Mode } from '@/types/gameState';
import { AIDifficulty } from '@/types/gamePlayer';
import PixelSelect from '@/components/UI/PixelSelect';

interface GameSettingsModalProps {
	onSubmit: (settings: GameSettings) => void;
	onClose: () => void;
}

type NumericRange = {
	min: number;
	max: number;
};

const clampToRange = (value: number, range: NumericRange): number => {
	if (value < range.min) return range.min;
	if (value > range.max) return range.max;
	return value;
};

const sanitizeNumericInput = (
	rawValue: string,
	range: NumericRange,
	fallback: number,
): number => {
	const parsedValue = Number.parseInt(rawValue, 10);
	if (Number.isNaN(parsedValue)) {
		return fallback;
	}
	return clampToRange(parsedValue, range);
};

export default function GameSettingsModal({
	onSubmit,
	onClose,
}: GameSettingsModalProps) {
	const [mode, setMode] = useState<Mode>('single');
	const [difficulty, setDifficulty] = useState<AIDifficulty>('easy');
	const [numberOfPlayers, setNumberOfPlayers] = useState(4);
	const [includeJokers, setIncludeJokers] = useState(false);
	const [initHandSize, setInitHandSize] = useState(5);
	const [maxHandSize, setMaxHandSize] = useState(15);

	useEffect(() => {
		setMaxHandSize(prev => (prev < initHandSize ? initHandSize : prev));
	}, [initHandSize]);

	const handleNumberOfPlayersChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			const { value } = event.target;
			setNumberOfPlayers(prev =>
				sanitizeNumericInput(value, { min: 2, max: 4 }, prev),
			);
		},
		[],
	);

	const handleInitHandSizeChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			const { value } = event.target;
			setInitHandSize(prev =>
				sanitizeNumericInput(value, { min: 1, max: 10 }, prev),
			);
		},
		[],
	);

	const handleMaxHandSizeChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			const { value } = event.target;
			const range: NumericRange = { min: Math.max(5, initHandSize), max: 20 };
			setMaxHandSize(prev =>
				sanitizeNumericInput(value, range, Math.max(prev, range.min)),
			);
		},
		[initHandSize],
	);

	const handleSubmit = useCallback(() => {
		const settings: GameSettings = {
			mode,
			numberOfPlayers,
			includeJokers,
			initHandSize,
			maxHandSize,
			difficulty,
		};

		onSubmit(settings);
	}, [
		difficulty,
		includeJokers,
		initHandSize,
		maxHandSize,
		mode,
		numberOfPlayers,
		onSubmit,
	]);

	const handleBackgroundClick = useCallback(
		(event: MouseEvent<HTMLDivElement>) => {
			if (event.target === event.currentTarget) {
				onClose();
			}
		},
		[onClose],
	);

	return (
		<div
			className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${styles.text}`}
			onClick={handleBackgroundClick}
		>
			<div className="bg-[rgba(39,67,42,1)] p-6 rounded-lg shadow-lg w-96">
				<h2 className="text-lg font-bold mb-4">Game Settings</h2>
				<div className="form-control mb-4">
					<label className="label">Mode</label>
					<PixelSelect
						value={mode}
						onChange={setMode}
						options={[
							{ value: 'single', label: 'Single' },
							{
								value: 'multi',
								label: 'Multiplayer (coming soon)',
								disabled: true,
							},
						]}
						ariaLabel="Select game mode"
					/>
				</div>
				<div className="form-control mb-4">
					<label className="label">Difficulty</label>
					<PixelSelect
						value={difficulty}
						onChange={setDifficulty}
						options={[
							{ value: 'easy', label: 'Easy' },
							{ value: 'medium', label: 'Medium' },
							{ value: 'hard', label: 'Hard' },
						]}
						ariaLabel="Select AI difficulty"
					/>
				</div>
				<div className="form-control mb-4">
					<label className="label">Number of Players</label>
					<input
						type="number"
						className="input input-bordered"
						value={numberOfPlayers}
						onChange={handleNumberOfPlayersChange}
						min="2"
						max="4"
						aria-label="Select number of players"
					/>
				</div>
				<div className="form-control mb-4">
					<label className="label cursor-pointer">
						<span className="label-text text-[#E3F1A7]">Include Jokers</span>
						<input
							type="checkbox"
							className="toggle checked:border-[#2F4F4F] checked:bg-[#2F4F4F] checked:hover:bg-[#3A5234] checked:[--tglbg:#E3F1A7] unchecked:bg-gray-500 unchecked:border-gray-500 unchecked:[--tglbg:gray]"
							checked={includeJokers}
							onChange={() => setIncludeJokers(prev => !prev)}
						/>
					</label>
				</div>
				<div className="form-control mb-4">
					<label className="label">Initial Hand Size</label>
					<input
						type="number"
						className="input input-bordered"
						value={initHandSize}
						onChange={handleInitHandSizeChange}
						min="1"
						max="10"
						aria-label="Set initial hand size"
					/>
				</div>
				<div className="form-control mb-4">
					<label className="label">Max Hand Size</label>
					<input
						type="number"
						className="input input-bordered"
						value={maxHandSize}
						onChange={handleMaxHandSizeChange}
						min="5"
						max="20"
						aria-label="Set maximum hand size"
					/>
				</div>
				<div className="modal-action">
					<PixelRetroButton
						className="max-w-32 max-h-10"
						text="SUBMIT"
						onClick={handleSubmit}
					/>
				</div>
			</div>
		</div>
	);
}
