import {
  IsBoolean,
  IsDefined,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum GameActionType {
  START_GAME = 'START_GAME',
  PLAY_CARD = 'PLAY_CARD',
  DRAW_CARD = 'DRAW_CARD',
  NEXT_TURN = 'NEXT_TURN',
  APPLY_SPECIAL_EFFECT = 'APPLY_SPECIAL_EFFECT',
  END_GAME = 'END_GAME',
}

export class EffectCardDto {
  @IsString()
  id!: string;

  @IsBoolean()
  isJoker!: boolean;

  @IsBoolean()
  isFlipped!: boolean;

  @IsOptional()
  @IsString()
  rank?: string;

  @IsOptional()
  @IsString()
  suit?: string;
}

export class GameActionDto {
  @IsEnum(GameActionType)
  type!: GameActionType;

  @IsOptional()
  @IsInt()
  @Min(0)
  playerIndex?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  cardIndex?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  amount?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => EffectCardDto)
  effectCard?: EffectCardDto;

  @IsOptional()
  @IsInt()
  @Min(0)
  winnerIndex?: number;
}

export class StepGameDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => GameActionDto)
  action!: GameActionDto;
}
