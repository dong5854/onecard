import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { GameService } from '@/modules/game/game.service';
import { OnnxPolicyService } from '@/modules/game/inference/onnx-policy.service';
import { OnnxHealthQueryDto } from '@/modules/game/inference/dto/onnx-health-query.dto';
import type { GameSettings } from '@/modules/game/domain/types/gameState';

@ApiTags('onnx-policy')
@Controller('games/:gameId/onnx-action')
export class OnnxPolicyController {
  public constructor(
    private readonly gameService: GameService,
    private readonly onnxPolicyService: OnnxPolicyService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'ONNX 정책으로 추천 행동을 조회합니다.' })
  public async predict(
    @Param('gameId', ParseUUIDPipe) gameId: string,
    @Query('includeLogits') includeLogits?: 'true' | 'false',
  ): Promise<{
    actionIndex: number;
    payload: unknown;
    logits?: number[];
  }> {
    const game = this.gameService.getGame(gameId);
    const result = await this.onnxPolicyService.predictAction(game.state);
    return {
      actionIndex: result.actionIndex,
      payload: result.payload,
      logits: includeLogits === 'true' ? result.logits : undefined,
    };
  }

  @Get('/health')
  @ApiOperation({ summary: 'ONNX 모델 로드 가능 여부를 확인합니다.' })
  public async health(@Query() query: OnnxHealthQueryDto): Promise<{
    suffix: string;
    observationDim: number;
    actionDim: number;
    settings: GameSettings;
  }> {
    const baseSettings: GameSettings = {
      mode: 'single' as const,
      numberOfPlayers: query.players,
      includeJokers: query.includeJokers,
      initHandSize: query.initHandSize,
      maxHandSize: query.maxHandSize,
      difficulty: query.difficulty ?? 'medium',
    };
    return this.onnxPolicyService.checkHealth(baseSettings);
  }
}
