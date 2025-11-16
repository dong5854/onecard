import { BadRequestException, Injectable } from '@nestjs/common';
import {
  applySpecialEffectAction,
  createStartedState as createStartedEngineState,
  createWaitingState as createWaitingEngineState,
  drawCardAction,
  endGameAction,
  nextTurnAction,
  playCardAction,
  startGameAction,
  step,
} from '@/modules/game/domain/engine/gameEngine';
import {
  EffectCardDto,
  GameActionDto,
  GameActionType,
} from '@/modules/game/dto/game-action.dto';
import {
  PokerCardPropsWithId,
  isValidRank,
  isValidSuit,
} from '@/modules/game/domain/types/pokerCard';
import { GameSettings, GameState } from '@/modules/game/domain/types/gameState';
import { GameAction } from '@/modules/game/domain/types/gameAction';
import { EngineStepResult } from '@/modules/game/domain/engine/gameEngine';

@Injectable()
export class GameEngineService {
  public createWaitingState(settings: GameSettings): GameState {
    return createWaitingEngineState(settings);
  }

  public createStartedState(settings: GameSettings): GameState {
    return createStartedEngineState(settings);
  }

  public step(state: GameState, action: GameAction): EngineStepResult {
    return step(state, action);
  }

  public buildAction(payload: GameActionDto): GameAction {
    switch (payload.type) {
      case GameActionType.START_GAME:
        return startGameAction();
      case GameActionType.PLAY_CARD:
        if (
          payload.playerIndex === undefined ||
          payload.cardIndex === undefined
        ) {
          throw new BadRequestException(
            'PLAY_CARD requires both playerIndex and cardIndex',
          );
        }
        return playCardAction(payload.playerIndex, payload.cardIndex);
      case GameActionType.DRAW_CARD: {
        const amount = payload.amount ?? 1;
        return drawCardAction(amount);
      }
      case GameActionType.NEXT_TURN:
        return nextTurnAction();
      case GameActionType.APPLY_SPECIAL_EFFECT:
        if (!payload.effectCard) {
          throw new BadRequestException(
            'APPLY_SPECIAL_EFFECT requires an effectCard payload',
          );
        }
        return applySpecialEffectAction(this.toEffectCard(payload.effectCard));
      case GameActionType.END_GAME: {
        const winnerIndex = payload.winnerIndex ?? 0;
        return endGameAction(winnerIndex);
      }
      default:
        throw new BadRequestException(
          `Unsupported action type: ${String(payload.type)}`,
        );
    }
  }

  private toEffectCard(effectCard: EffectCardDto): PokerCardPropsWithId {
    const transformed: PokerCardPropsWithId = {
      id: effectCard.id,
      isJoker: effectCard.isJoker,
      isFlipped: effectCard.isFlipped,
    };

    if (
      typeof effectCard.rank !== 'undefined' &&
      isValidRank(effectCard.rank)
    ) {
      transformed.rank = effectCard.rank;
    }
    if (
      typeof effectCard.suit !== 'undefined' &&
      isValidSuit(effectCard.suit)
    ) {
      transformed.suit = effectCard.suit;
    }

    return transformed;
  }
}
