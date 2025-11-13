import type { AIDifficulty } from '@/modules/game/domain/types/gamePlayer';
import type { Mode } from '@/modules/game/domain/types/gameState';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

export class GameSettingsDto {
  @IsOptional()
  @IsEnum(['single', 'multi'])
  mode?: Mode;

  @IsOptional()
  @IsInt()
  @Min(2)
  @Max(6)
  numberOfPlayers?: number;

  @IsOptional()
  @IsBoolean()
  includeJokers?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(15)
  initHandSize?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  maxHandSize?: number;

  @IsOptional()
  @IsEnum(['easy', 'medium', 'hard'])
  difficulty?: AIDifficulty;
}
