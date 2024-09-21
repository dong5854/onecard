import { useState } from 'react';

interface GameSettings {
	mode: string;
	numberOfPlayers: number;
	includeJokers: boolean;
	initHandSize: number;
	maxHandSize: number;
}

interface GameSettingsModalProps {
	onSubmit: (settings: GameSettings) => void;
}

export default function GameSettingsModal({
	onSubmit,
}: GameSettingsModalProps) {
	const [mode, setMode] = useState('easy');
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
		};

		onSubmit(settings);
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white p-6 rounded-lg shadow-lg w-96">
				<h2 className="text-lg font-bold mb-4">Game Settings</h2>
				<div className="form-control mb-4">
					<label className="label">Mode</label>
					<select
						className="select select-bordered"
						value={mode}
						onChange={e => setMode(e.target.value)}
					>
						<option value="easy">Easy</option>
						<option value="medium">Medium</option>
						<option value="hard">Hard</option>
					</select>
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
						<span className="label-text">Include Jokers</span>
						<input
							type="checkbox"
							className="toggle toggle-primary"
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
					<button className="btn btn-primary" onClick={handleSubmit}>
						Submit
					</button>
				</div>
			</div>
		</div>
	);
}
