import {GameAction, GameSettings, SpecialEffect} from "@/types/gameTypes";

export const initializeGame = (settings: GameSettings): GameAction => ({
    type: 'INITIALIZE_GAME',
    payload: settings
});

export const playCard = (playerIndex: number, cardIndex: number): GameAction => ({
    type: 'PLAY_CARD',
    payload: { playerIndex, cardIndex }
});

export const drawCard = (amount : number): GameAction => ({
    type: 'DRAW_CARD',
    payload: { amount }
});

export const nextTurn = (): GameAction => ({
    type: 'NEXT_TURN'
});

export const changeDirection = (): GameAction => ({
    type: 'CHANGE_DIRECTION'
});

export const applySpecialEffect = (effect: SpecialEffect): GameAction => ({
    type: 'APPLY_SPECIAL_EFFECT',
    payload: effect
});

export const endGame = (winnerIndex: number): GameAction => ({
    type: 'END_GAME',
    payload: { winnerIndex }
});