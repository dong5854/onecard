import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GameService } from '@/modules/game/game.service';
import type { StateResponse } from '@/modules/game/game.service';
import { ResetGameDto } from '@/modules/game/dto/reset-game.dto';
import { StepGameDto } from '@/modules/game/dto/game-action.dto';

@ApiTags('game')
@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get('state')
  @ApiOperation({ summary: '현재 게임 상태를 조회합니다.' })
  getState(): StateResponse {
    return this.gameService.getState();
  }

  @Post('reset')
  @ApiOperation({ summary: '게임 상태를 초기화합니다.' })
  @ApiBody({ type: ResetGameDto, required: false })
  reset(@Body() body: ResetGameDto = new ResetGameDto()): StateResponse {
    return this.gameService.resetState(body.settings);
  }

  @Post('step')
  @ApiOperation({ summary: '게임 액션을 적용하여 다음 상태로 진행합니다.' })
  @ApiBody({ type: StepGameDto })
  step(@Body() body: StepGameDto): ReturnType<GameService['step']> {
    return this.gameService.step(body.action);
  }

  @Post('ai/step')
  @ApiOperation({ summary: 'AI의 차례를 자동으로 진행합니다.' })
  executeAiTurn(): ReturnType<GameService['executeAiTurn']> {
    return this.gameService.executeAiTurn();
  }
}
