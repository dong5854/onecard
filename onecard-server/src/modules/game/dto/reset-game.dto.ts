import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';
import { GameSettingsDto } from '@/modules/game/dto/game-settings.dto';

export class ResetGameDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => GameSettingsDto)
  settings?: GameSettingsDto;
}
