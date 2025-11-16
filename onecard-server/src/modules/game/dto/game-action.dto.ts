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
  public id!: string;

  @IsBoolean()
  public isJoker!: boolean;

  @IsBoolean()
  public isFlipped!: boolean;

  @IsOptional()
  @IsString()
  public rank?: string;

  @IsOptional()
  @IsString()
  public suit?: string;
}

export class GameActionDto {
  @IsEnum(GameActionType)
  public type!: GameActionType;

  @IsOptional()
  @IsInt()
  @Min(0)
  public playerIndex?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  public cardIndex?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  public amount?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => EffectCardDto)
  public effectCard?: EffectCardDto;

  @IsOptional()
  @IsInt()
  @Min(0)
  public winnerIndex?: number;
}

export class ApplyGameActionDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => GameActionDto)
  public action!: GameActionDto;
}
