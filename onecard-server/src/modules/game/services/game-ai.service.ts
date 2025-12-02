import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import type { GameState } from '@/modules/game/domain/types/gameState';
import type { GameAction } from '@/modules/game/domain/types/gameAction';
import type { PokerCardPropsWithId } from '@/modules/game/domain/types/pokerCard';
import type { Player } from '@/modules/game/domain/types/gamePlayer';
import { findPlayableCardBruteForce } from '@/modules/game/domain/state/gamePlayers';
import { GameEngineService } from '@/modules/game/services/game-engine.service';
import {
  applySpecialEffectAction,
  drawCardAction,
  nextTurnAction,
  playCardAction,
  EngineStepResult,
} from '@/modules/game/domain/engine/gameEngine';
import { isValidPlay } from '@/modules/game/domain/utils/cardUtils';
import { OnnxPolicyService } from '@/modules/game/inference/onnx-policy.service';

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

  public constructor(
    private readonly gameEngine: GameEngineService,
    private readonly onnxPolicyService: OnnxPolicyService,
  ) {}

  public async playWhileAiTurn(
    state: GameState,
    context?: AiTurnContext,
  ): Promise<EngineStepResult | null> {
    if (state.settings.mode !== 'single' || !this.isAiTurn(state)) {
      return null;
    }

    if (state.settings.difficulty === 'medium') {
      return this.playWithOnnx(state, context);
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
    const cardToPlayResult = findPlayableCardBruteForce(
      player.hand,
      topCard,
      currentState.damage,
    );

    if (cardToPlayResult) {
      const playableIndex = player.hand.findIndex(
        (c) => c.id === cardToPlayResult.id,
      );
      const playOutcome = this.applyAction(
        currentState,
        playCardAction(currentState.currentPlayerIndex, playableIndex),
        context,
      );
      currentState = playOutcome.state;
      lastResult = playOutcome.result;
      this.pushAction(actions, playOutcome.result);

      if (this.hasSpecialEffect(cardToPlayResult)) {
        const effectOutcome = this.applyAction(
          currentState,
          applySpecialEffectAction(cardToPlayResult),
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
        const refreshedCardToPlayResult = findPlayableCardBruteForce(
          refreshedPlayer.hand,
          refreshedTopCard,
          currentState.damage,
        );

        if (refreshedCardToPlayResult) {
          const playableIndex = refreshedPlayer.hand.findIndex(
            (c) => c.id === refreshedCardToPlayResult.id,
          );
          const playOutcome = this.applyAction(
            currentState,
            playCardAction(currentState.currentPlayerIndex, playableIndex),
            context,
          );
          currentState = playOutcome.state;
          lastResult = playOutcome.result;
          this.pushAction(actions, playOutcome.result);

          if (this.hasSpecialEffect(refreshedCardToPlayResult)) {
            const effectOutcome = this.applyAction(
              currentState,
              applySpecialEffectAction(refreshedCardToPlayResult),
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
      payload: 'payload' in action ? action.payload : null,
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

  private async playWithOnnx(
    state: GameState,
    context?: AiTurnContext,
  ): Promise<EngineStepResult | null> {
    try {
      let currentState = state;
      const actions: GameAction[] = [];
      let lastResult: EngineStepResult | undefined;

      const prediction =
        await this.onnxPolicyService.predictAction(currentState);
      const { payload, actionIndex } = prediction;
      const isDraw = payload.type === 'DRAW_CARD';
      const amount = isDraw ? (payload.amount ?? 1) : 1;
      const playerIndex = isDraw ? 0 : (payload.playerIndex ?? 0);
      const cardIndex = isDraw ? 0 : (payload.cardIndex ?? 0);

      const firstAction: GameAction = isDraw
        ? drawCardAction(amount)
        : playCardAction(playerIndex, cardIndex);

      this.logger.log(
        `[AI][ONNX] actionIndex=${String(actionIndex)} payload=${JSON.stringify(payload)}`,
      );

      const firstOutcome = this.applyAction(currentState, firstAction, context);
      currentState = firstOutcome.state;
      lastResult = firstOutcome.result;
      this.pushAction(actions, firstOutcome.result);

      if (!isDraw) {
        const player = state.players[state.currentPlayerIndex];
        const cardToPlay = player.hand[cardIndex];
        if (cardToPlay && this.hasSpecialEffect(cardToPlay)) {
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

      if (isDraw && currentState.gameStatus !== 'finished') {
        try {
          const secondPrediction =
            await this.onnxPolicyService.predictAction(currentState);
          const { payload: p2 } = secondPrediction;

          if (p2.type === 'PLAY_CARD') {
            const p2PlayerIdx = p2.playerIndex ?? 0;
            const p2CardIdx = p2.cardIndex ?? 0;

            const p2Player =
              currentState.players[currentState.currentPlayerIndex];
            if (p2Player && p2Player.hand[p2CardIdx]) {
              const secondAction = playCardAction(p2PlayerIdx, p2CardIdx);
              const secondOutcome = this.applyAction(
                currentState,
                secondAction,
                context,
              );
              currentState = secondOutcome.state;
              lastResult = secondOutcome.result;
              this.pushAction(actions, secondOutcome.result);

              const cardPlayed = p2Player.hand[p2CardIdx];
              if (this.hasSpecialEffect(cardPlayed)) {
                const effectOutcome = this.applyAction(
                  currentState,
                  applySpecialEffectAction(cardPlayed),
                  context,
                );
                currentState = effectOutcome.state;
                lastResult = effectOutcome.result;
                this.pushAction(actions, effectOutcome.result);
              }
            }
          }
        } catch (e) {
          this.logger.warn(`[AI][ONNX] Second prediction failed: ${String(e)}`);
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
        done: currentState.gameStatus === 'finished',
        info: { aiActions: actions, source: 'onnx' },
      };
    } catch (error: unknown) {
      this.logger.error(
        `[AI][ONNX] fallback to rule-based due to: ${this.describeOnnxError(error)}`,
      );
      const fallback = this.executeTurn(state, context);
      return fallback
        ? {
            state: fallback.state,
            done: fallback.state.gameStatus === 'finished',
            info: {
              aiActions: fallback.actions,
              source: 'fallback',
              reason: this.describeOnnxError(error),
            },
          }
        : null;
    }
  }

  private describeOnnxError(error: unknown): string {
    if (
      error instanceof BadRequestException ||
      error instanceof NotFoundException
    ) {
      return `${error.name}: ${error.message}`;
    }
    if (error instanceof Error) {
      return `${error.name}: ${error.message}`;
    }
    return String(error);
  }

  public isAiTurn(state: GameState): boolean {
    const player = state.players.at(state.currentPlayerIndex);
    if (!player) {
      return false;
    }
    return player.isAI;
  }
}
