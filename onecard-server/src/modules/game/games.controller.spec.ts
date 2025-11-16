import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { GamesController } from '@/modules/game/games.controller';
import { GameService } from '@/modules/game/game.service';
import type { GameResource, GameSummary } from '@/modules/game/game.service';
import type { GameActionDto } from '@/modules/game/dto/game-action.dto';
import { GameActionType } from '@/modules/game/dto/game-action.dto';

type GameServiceMethod<Key extends keyof GameService> =
  GameService[Key] extends (...args: infer Args) => infer Result
    ? jest.Mock<Result, Args>
    : never;

type GameServiceMock = {
  [K in
    | 'listGames'
    | 'createGame'
    | 'getGame'
    | 'applyAction'
    | 'executeAiTurn'
    | 'deleteGame']: GameServiceMethod<K>;
};

describe('GamesController', () => {
  let controller: GamesController;
  let gameService: GameServiceMock;

  const createServiceMock = (): GameServiceMock => ({
    listGames: jest
      .fn<
        ReturnType<GameService['listGames']>,
        Parameters<GameService['listGames']>
      >()
      .mockReturnValue([] satisfies GameSummary[]),
    createGame: jest
      .fn<
        ReturnType<GameService['createGame']>,
        Parameters<GameService['createGame']>
      >()
      .mockReturnValue({
        id: 'game-1',
        state: {} as GameResource['state'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    getGame: jest
      .fn<
        ReturnType<GameService['getGame']>,
        Parameters<GameService['getGame']>
      >()
      .mockReturnValue({
        id: 'game-1',
        state: {} as GameResource['state'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    applyAction: jest
      .fn<
        ReturnType<GameService['applyAction']>,
        Parameters<GameService['applyAction']>
      >()
      .mockReturnValue({ done: false, state: {} }),
    executeAiTurn: jest
      .fn<
        ReturnType<GameService['executeAiTurn']>,
        Parameters<GameService['executeAiTurn']>
      >()
      .mockReturnValue({ done: false, state: {}, info: {} }),
    deleteGame: jest
      .fn<
        ReturnType<GameService['deleteGame']>,
        Parameters<GameService['deleteGame']>
      >()
      .mockReturnValue(undefined),
  });

  beforeEach(async () => {
    gameService = createServiceMock();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GamesController],
      providers: [
        {
          provide: GameService,
          useValue: gameService,
        },
      ],
    }).compile();

    controller = module.get<GamesController>(GamesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should list games', () => {
    expect(controller.list()).toEqual([]);
    expect(gameService.listGames).toHaveBeenCalledTimes(1);
  });

  it('should create a game with optional settings', () => {
    controller.create({ settings: { initHandSize: 7 } });
    expect(gameService.createGame).toHaveBeenCalledWith({
      initHandSize: 7,
    });
  });

  it('should get a game by id', () => {
    controller.get('game-1');
    expect(gameService.getGame).toHaveBeenCalledWith('game-1');
  });

  it('should apply an action to a game', () => {
    const action: GameActionDto = { type: GameActionType.START_GAME };
    controller.applyAction('game-1', { action });
    expect(gameService.applyAction).toHaveBeenCalledWith('game-1', action);
  });

  it('should execute ai turn for a game', () => {
    controller.executeAiTurn('game-1');
    expect(gameService.executeAiTurn).toHaveBeenCalledWith('game-1');
  });

  it('should delete a game', () => {
    controller.delete('game-1');
    expect(gameService.deleteGame).toHaveBeenCalledWith('game-1');
  });
});
