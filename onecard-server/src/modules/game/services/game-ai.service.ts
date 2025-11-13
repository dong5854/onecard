import { Injectable } from '@nestjs/common';
import type { GameState } from '@/modules/game/domain/types/gameState';
import type { GameAction } from '@/modules/game/domain/types/gameAction';
import type { PokerCardPropsWithId } from '@/modules/game/domain/types/pokerCard';
import { GameEngineService } from '@/modules/game/services/game-engine.service';
import {
  applySpecialEffectAction,
  drawCardAction,
  nextTurnAction,
  playCardAction,
  EngineStepResult,
} from '@/modules/game/domain/engine/gameEngine';
import { isValidPlay } from '@/modules/game/domain/utils/cardUtils';

interface AiTurnResult {
  state: GameState;
  actions: GameAction[];
  result: EngineStepResult;
}

@Injectable()
export class GameAiService {
  private readonly maxConsecutiveTurns = 32;

  constructor(private readonly gameEngine: GameEngineService) {}

  playWhileAiTurn(state: GameState): EngineStepResult | null {
    if (state.settings.mode !== 'single' || !this.isAiTurn(state)) {
      return null;
    }

    const executedActions: GameAction[] = [];
    let currentState = state;
    let lastResult: EngineStepResult | null = null;
    let turns = 0;

    while (
      this.isAiTurn(currentState) &&
      currentState.gameStatus !== 'finished' &&
      turns < this.maxConsecutiveTurns
    ) {
      const turnResult = this.executeTurn(currentState);
      if (!turnResult) {
        break;
      }

      executedActions.push(...turnResult.actions);
      currentState = turnResult.state;
      lastResult = turnResult.result;
      turns += 1;
    }

    if (!lastResult || executedActions.length === 0) {
      return null;
    }

    return {
      state: currentState,
      done: currentState.gameStatus === 'finished',
      info: {
        aiActions: executedActions,
      },
    };
  }

  private executeTurn(state: GameState): AiTurnResult | null {
    const player = state.players[state.currentPlayerIndex];
    if (!player || !player.isAI) {
      return null;
    }

    let currentState = state;
    let lastResult: EngineStepResult | null = null;
    const actions: GameAction[] = [];

    const topCard = currentState.discardPile[0];
    let playableIndex = this.findPlayableCardIndex(
      player.hand,
      topCard,
      currentState.damage,
    );

    if (playableIndex >= 0) {
      const cardToPlay = player.hand[playableIndex];
      const playOutcome = this.applyAction(
        currentState,
        playCardAction(currentState.currentPlayerIndex, playableIndex),
      );
      currentState = playOutcome.state;
      lastResult = playOutcome.result;
      this.pushAction(actions, playOutcome.result);

      if (this.hasSpecialEffect(cardToPlay)) {
        const effectOutcome = this.applyAction(
          currentState,
          applySpecialEffectAction(cardToPlay),
        );
        currentState = effectOutcome.state;
        lastResult = effectOutcome.result;
        this.pushAction(actions, effectOutcome.result);
      }
    } else {
      const drawOutcome = this.applyAction(
        currentState,
        drawCardAction(Math.max(1, currentState.damage || 0)),
      );
      currentState = drawOutcome.state;
      lastResult = drawOutcome.result;
      this.pushAction(actions, drawOutcome.result);

      const refreshedPlayer =
        currentState.players[currentState.currentPlayerIndex];
      if (refreshedPlayer) {
        const refreshedTopCard = currentState.discardPile[0];
        playableIndex = this.findPlayableCardIndex(
          refreshedPlayer.hand,
          refreshedTopCard,
          currentState.damage,
        );

        if (playableIndex >= 0) {
          const cardToPlay = refreshedPlayer.hand[playableIndex];
          const playOutcome = this.applyAction(
            currentState,
            playCardAction(currentState.currentPlayerIndex, playableIndex),
          );
          currentState = playOutcome.state;
          lastResult = playOutcome.result;
          this.pushAction(actions, playOutcome.result);

          if (this.hasSpecialEffect(cardToPlay)) {
            const effectOutcome = this.applyAction(
              currentState,
              applySpecialEffectAction(cardToPlay),
            );
            currentState = effectOutcome.state;
            lastResult = effectOutcome.result;
            this.pushAction(actions, effectOutcome.result);
          }
        }
      }
    }

    if (!lastResult) {
      return null;
    }

    if (currentState.gameStatus !== 'finished') {
      const nextOutcome = this.applyAction(currentState, nextTurnAction());
      currentState = nextOutcome.state;
      lastResult = nextOutcome.result;
      this.pushAction(actions, nextOutcome.result);
    }

    return {
      state: currentState,
      actions,
      result: lastResult,
    };
  }

  private applyAction(state: GameState, action: GameAction) {
    const result = this.gameEngine.step(state, action);
    return {
      state: result.state,
      result,
    };
  }

  private pushAction(actions: GameAction[], result: EngineStepResult) {
    if (result.info?.action) {
      actions.push(result.info.action as GameAction);
    }
  }

  private findPlayableCardIndex(
    hand: PokerCardPropsWithId[],
    topCard: PokerCardPropsWithId | undefined,
    damage: number,
  ): number {
    if (!topCard) {
      return -1;
    }
    return hand.findIndex((card) => isValidPlay(card, topCard, damage));
  }

  private hasSpecialEffect(card: PokerCardPropsWithId): boolean {
    if (card.isJoker) {
      return true;
    }
    const specialRanks = new Set([1, 2, 11, 12, 13]);
    return card.rank !== undefined && specialRanks.has(card.rank);
  }

  isAiTurn(state: GameState): boolean {
    const player = state.players[state.currentPlayerIndex];
    return Boolean(player?.isAI);
  }
}
