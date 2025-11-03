import { useState } from 'react';
import PixelRetroButton from './PixelRetroButton';
import styles from './GameSettingModal.module.css';
import { GameSettings, Mode } from '@/types/gameState';
import { AIDifficulty } from '@/types/gamePlayer';
import PixelSelect from './PixelSelect';

interface GameSettingsModalProps {
	onSubmit: (settings: GameSettings) => void;
	onClose: () => void; // 모달 닫기 함수를 props로 추가
}

export default function GameSettingsModal({
	onSubmit,
	onClose, // onClose 함수 props로 받음
}: GameSettingsModalProps) {
	const [mode, setMode] = useState<Mode>('single');
	const [difficulty, setDifficulty] = useState<AIDifficulty>('easy');
	const [numberOfPlayers, setNumberOfPlayers] = useState(4);
	const [includeJokers, setIncludeJokers] = useState(false);
	const [initHandSize, setInitHandSize] = useState(5);
	const [maxHandSize, setMaxHandSize] = useState(15);

	const handleSubmit = () => {
		const settings: GameSettings = {
			mode,
			numberOfPlayers,
			includeJokers,
			initHandSize,
			maxHandSize,
			difficulty,
		};

		onSubmit(settings);
	};

	const handleBackgroundClick = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget) {
			onClose();
		}
	};

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
						onChange={e => setNumberOfPlayers(parseInt(e.target.value, 10))}
						min="2"
						max="4"
					/>
				</div>
				<div className="form-control mb-4">
					<label className="label cursor-pointer">
						<span className="label-text text-[#E3F1A7]">Include Jokers</span>
						<input
							type="checkbox"
							className="toggle checked:border-[#2F4F4F] checked:bg-[#2F4F4F] checked:hover:bg-[#3A5234] checked:[--tglbg:#E3F1A7] unchecked:bg-gray-500 unchecked:border-gray-500 unchecked:[--tglbg:gray]"
							checked={includeJokers}
							onChange={() => setIncludeJokers(!includeJokers)}
						/>
					</label>
				</div>
				<div className="form-control mb-4">
					<label className="label">Initial Hand Size</label>
					<input
						type="number"
						className="input input-bordered"
						value={initHandSize}
						onChange={e => setInitHandSize(parseInt(e.target.value, 10))}
						min="1"
						max="10"
					/>
				</div>
				<div className="form-control mb-4">
					<label className="label">Max Hand Size</label>
					<input
						type="number"
						className="input input-bordered"
						value={maxHandSize}
						onChange={e => setMaxHandSize(parseInt(e.target.value, 10))}
						min="5"
						max="20"
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
