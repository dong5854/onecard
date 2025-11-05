const path = require('path');
const express = require('express');

const engineModulePath = path.resolve(
	__dirname,
	'../../onecard-client/dist/engine/gameEngine.js',
);
const {
	createStartedState,
	step,
	playCardAction,
	drawCardAction,
	nextTurnAction,
	applySpecialEffectAction,
	startGameAction,
	endGameAction,
} = require(engineModulePath);

const DEFAULT_SETTINGS = {
	mode: 'single',
	numberOfPlayers: 2,
	includeJokers: false,
	initHandSize: 5,
	maxHandSize: 15,
	difficulty: 'easy',
};

const app = express();
app.use(express.json());

let state = createStartedState(DEFAULT_SETTINGS);

const toGameAction = payload => {
	if (!payload || typeof payload !== 'object' || !payload.type) {
		throw new Error('Invalid action payload');
	}

	switch (payload.type) {
		case 'START_GAME':
			return startGameAction();
		case 'PLAY_CARD':
			return playCardAction(payload.playerIndex, payload.cardIndex);
		case 'DRAW_CARD':
			return drawCardAction(payload.amount ?? 1);
		case 'NEXT_TURN':
			return nextTurnAction();
		case 'APPLY_SPECIAL_EFFECT':
			return applySpecialEffectAction(payload.effectCard);
		case 'END_GAME':
			return endGameAction(payload.winnerIndex ?? 0);
		default:
			throw new Error(`Unsupported action type: ${payload.type}`);
	}
};

app.get('/state', (_req, res) => {
	res.json({ state });
});

app.post('/reset', (req, res) => {
	const settings = { ...DEFAULT_SETTINGS, ...(req.body?.settings ?? {}) };
	state = createStartedState(settings);
	res.json({ state });
});

app.post('/step', (req, res) => {
	try {
		const action = toGameAction(req.body?.action);
		const result = step(state, action);
		state = result.state;
		res.json(result);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});

const port = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(port, () => {
	console.log(`engine-server listening on http://localhost:${port}`);
});
