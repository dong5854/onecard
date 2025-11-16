import type { AIDifficulty } from '@/modules/game/domain/types/gamePlayer';
import type { Mode } from '@/modules/game/domain/types/gameState';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

export class GameSettingsDto {
  @ApiPropertyOptional({
    enum: ['single', 'multi'],
    example: 'single',
    description: '게임 모드(single 또는 multi)',
  })
  @IsOptional()
  @IsEnum(['single', 'multi'])
  public mode?: Mode;

  @ApiPropertyOptional({
    minimum: 2,
    maximum: 6,
    example: 3,
    description: '참가자 수',
  })
  @IsOptional()
  @IsInt()
  @Min(2)
  @Max(6)
  public numberOfPlayers?: number;

  @ApiPropertyOptional({
    example: true,
    description: '조커 포함 여부',
  })
  @IsOptional()
  @IsBoolean()
  public includeJokers?: boolean;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 15,
    example: 7,
    description: '초기 패 수',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(15)
  public initHandSize?: number;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 20,
    example: 15,
    description: '최대 패 수',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  public maxHandSize?: number;

  @ApiPropertyOptional({
    enum: ['easy', 'medium', 'hard'],
    example: 'medium',
    description: 'AI 난이도',
  })
  @IsOptional()
  @IsEnum(['easy', 'medium', 'hard'])
  public difficulty?: AIDifficulty;
}
