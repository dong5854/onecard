import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { GameSettingsDto } from '@/modules/game/dto/game-settings.dto';

export class CreateGameDto {
  @ApiPropertyOptional({
    type: GameSettingsDto,
    example: {
      mode: 'single',
      numberOfPlayers: 3,
      includeJokers: true,
      initHandSize: 7,
      maxHandSize: 15,
      difficulty: 'medium',
    },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => GameSettingsDto)
  public settings?: GameSettingsDto;
}
