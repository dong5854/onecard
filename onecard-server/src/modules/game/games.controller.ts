import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GameService } from '@/modules/game/game.service';
import type { GameResource, GameSummary } from '@/modules/game/game.service';
import type { EngineStepResult } from '@/modules/game/domain/engine/gameEngine';
import { CreateGameDto } from '@/modules/game/dto/create-game.dto';
import { ApplyGameActionDto } from '@/modules/game/dto/game-action.dto';

@ApiTags('games')
@Controller('games')
export class GamesController {
  public constructor(private readonly gameService: GameService) {}

  @Get()
  @ApiOperation({ summary: '게임 세션 목록을 조회합니다.' })
  public list(): GameSummary[] {
    return this.gameService.listGames();
  }

  @Post()
  @ApiOperation({ summary: '새로운 게임 세션을 생성합니다.' })
  @ApiBody({
    type: CreateGameDto,
    required: false,
    description: '게임 설정을 전달하여 새로운 세션을 생성합니다.',
    schema: {
      example: {
        settings: {
          mode: 'single',
          numberOfPlayers: 3,
          includeJokers: true,
          initHandSize: 7,
          maxHandSize: 15,
          difficulty: 'medium',
        },
      },
    },
  })
  public create(
    @Body() body: CreateGameDto = new CreateGameDto(),
  ): GameResource {
    return this.gameService.createGame(body.settings);
  }

  @Get(':gameId')
  @ApiOperation({ summary: '지정한 게임 세션을 조회합니다.' })
  public get(@Param('gameId', ParseUUIDPipe) gameId: string): GameResource {
    return this.gameService.getGame(gameId);
  }

  @Patch(':gameId')
  @ApiOperation({
    summary: '플레이어 액션을 적용하여 게임 상태를 갱신합니다.',
  })
  @ApiBody({ type: ApplyGameActionDto })
  public applyAction(
    @Param('gameId', ParseUUIDPipe) gameId: string,
    @Body() body: ApplyGameActionDto,
  ): EngineStepResult {
    return this.gameService.applyAction(gameId, body.action);
  }

  @Post(':gameId/ai-turns')
  @ApiOperation({ summary: 'AI 턴을 실행합니다.' })
  public executeAiTurn(
    @Param('gameId', ParseUUIDPipe) gameId: string,
  ): EngineStepResult {
    return this.gameService.executeAiTurn(gameId);
  }

  @Delete(':gameId')
  @ApiOperation({ summary: '게임 세션을 삭제합니다.' })
  public delete(@Param('gameId', ParseUUIDPipe) gameId: string): void {
    this.gameService.deleteGame(gameId);
  }
}
