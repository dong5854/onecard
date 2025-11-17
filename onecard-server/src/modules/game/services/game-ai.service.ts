import { Injectable, Logger } from '@nestjs/common';
import type { GameState } from '@/modules/game/domain/types/gameState';
import type { GameAction } from '@/modules/game/domain/types/gameAction';
import type { PokerCardPropsWithId } from '@/modules/game/domain/types/pokerCard';
import type { Player } from '@/modules/game/domain/types/gamePlayer';
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

interface AiTurnContext {
  gameId?: string;
}

@Injectable()
export class GameAiService {
  private readonly logger = new Logger(GameAiService.name);

  public constructor(private readonly gameEngine: GameEngineService) {}

  public playWhileAiTurn(
    state: GameState,
    context?: AiTurnContext,
  ): EngineStepResult | null {
    if (state.settings.mode !== 'single' || !this.isAiTurn(state)) {
      return null;
    }

    const turnResult = this.executeTurn(state, context);
    if (!turnResult) {
      return null;
    }

    return {
      state: turnResult.state,
      done: turnResult.state.gameStatus === 'finished',
      info: {
        aiActions: turnResult.actions,
      },
    };
  }

  private executeTurn(
    state: GameState,
    context?: AiTurnContext,
  ): AiTurnResult | null {
    const player = state.players.at(state.currentPlayerIndex);
    if (!player?.isAI) {
      return null;
    }

    let currentState = state;
    let lastResult: EngineStepResult | undefined;
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
        context,
      );
      currentState = playOutcome.state;
      lastResult = playOutcome.result;
      this.pushAction(actions, playOutcome.result);

      if (this.hasSpecialEffect(cardToPlay)) {
        const effectOutcome = this.applyAction(
          currentState,
          applySpecialEffectAction(cardToPlay),
          context,
        );
        currentState = effectOutcome.state;
        lastResult = effectOutcome.result;
        this.pushAction(actions, effectOutcome.result);
      }
    } else {
      const drawOutcome = this.applyAction(
        currentState,
        drawCardAction(Math.max(1, currentState.damage)),
        context,
      );
      currentState = drawOutcome.state;
      lastResult = drawOutcome.result;
      this.pushAction(actions, drawOutcome.result);

      const refreshedPlayer = currentState.players.at(
        currentState.currentPlayerIndex,
      );
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
            context,
          );
          currentState = playOutcome.state;
          lastResult = playOutcome.result;
          this.pushAction(actions, playOutcome.result);

          if (this.hasSpecialEffect(cardToPlay)) {
            const effectOutcome = this.applyAction(
              currentState,
              applySpecialEffectAction(cardToPlay),
              context,
            );
            currentState = effectOutcome.state;
            lastResult = effectOutcome.result;
            this.pushAction(actions, effectOutcome.result);
          }
        }
      }
    }

    if (currentState.gameStatus !== 'finished') {
      const nextOutcome = this.applyAction(
        currentState,
        nextTurnAction(),
        context,
      );
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

  private applyAction(
    state: GameState,
    action: GameAction,
    context?: AiTurnContext,
  ): { state: GameState; result: EngineStepResult } {
    this.logAiAction(
      action,
      state.players.at(state.currentPlayerIndex),
      context,
    );
    const result = this.gameEngine.step(state, action);
    return {
      state: result.state,
      result,
    };
  }

  private pushAction(actions: GameAction[], result: EngineStepResult): void {
    if (result.info?.action) {
      actions.push(result.info.action as GameAction);
    }
  }

  private logAiAction(
    action: GameAction,
    actor: Player | undefined,
    context?: AiTurnContext,
  ): void {
    if (!actor?.isAI) {
      return;
    }
    const metadata = {
      event: 'ai-action',
      gameId: context?.gameId ?? null,
      playerId: actor.id,
      playerName: actor.name,
      actionType: action.type,
      payload: action.payload ?? null,
    };
    this.logger.log(`[AI] ${JSON.stringify(metadata)}`);
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

  public isAiTurn(state: GameState): boolean {
    const player = state.players.at(state.currentPlayerIndex);
    if (!player) {
      return false;
    }
    return player.isAI;
  }
}
