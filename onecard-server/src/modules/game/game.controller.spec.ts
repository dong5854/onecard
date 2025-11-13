import { Test, TestingModule } from '@nestjs/testing';
import { GameController } from '@/modules/game/game.controller';
import { GameService } from '@/modules/game/game.service';
import {
  GameActionDto,
  GameActionType,
  StepGameDto,
} from '@/modules/game/dto/game-action.dto';
import { ResetGameDto } from '@/modules/game/dto/reset-game.dto';

describe('GameController', () => {
  let gameController: GameController;
  let gameService: ReturnType<typeof createServiceMock>;

  const createServiceMock = () => ({
    getState: jest.fn().mockReturnValue({ state: {} }),
    resetState: jest.fn().mockReturnValue({ state: {} }),
    step: jest.fn().mockReturnValue({ state: {}, events: [] }),
    executeAiTurn: jest.fn().mockReturnValue({ state: {}, events: [] }),
  });

  beforeEach(async () => {
    gameService = createServiceMock();
    const app: TestingModule = await Test.createTestingModule({
      controllers: [GameController],
      providers: [
        {
          provide: GameService,
          useValue: gameService,
        },
      ],
    }).compile();

    gameController = app.get<GameController>(GameController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return the current state', () => {
    expect(gameController.getState()).toEqual({ state: {} });
    expect(gameService.getState).toHaveBeenCalledTimes(1);
  });

  it('should reset the state with provided settings', () => {
    const body: ResetGameDto = { settings: { initHandSize: 7 } };
    gameController.reset(body);
    expect(gameService.resetState).toHaveBeenCalledWith(body.settings);
  });

  it('should forward actions to the step handler', () => {
    const action: GameActionDto = { type: GameActionType.START_GAME };
    const body: StepGameDto = { action };
    gameController.step(body);
    expect(gameService.step).toHaveBeenCalledWith(action);
  });

  it('should trigger AI turn execution when requested', () => {
    gameController.executeAiTurn();
    expect(gameService.executeAiTurn).toHaveBeenCalledTimes(1);
  });
});
