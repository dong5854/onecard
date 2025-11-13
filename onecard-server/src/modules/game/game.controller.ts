import { Body, Controller, Get, Post } from '@nestjs/common';
import { GameService } from '@/modules/game/game.service';
import type { StateResponse } from '@/modules/game/game.service';
import { ResetGameDto } from '@/modules/game/dto/reset-game.dto';
import { StepGameDto } from '@/modules/game/dto/game-action.dto';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get('state')
  getState(): StateResponse {
    return this.gameService.getState();
  }

  @Post('reset')
  reset(@Body() body: ResetGameDto = new ResetGameDto()): StateResponse {
    return this.gameService.resetState(body.settings);
  }

  @Post('step')
  step(@Body() body: StepGameDto): ReturnType<GameService['step']> {
    return this.gameService.step(body.action);
  }

  @Post('ai/step')
  executeAiTurn(): ReturnType<GameService['executeAiTurn']> {
    return this.gameService.executeAiTurn();
  }
}
