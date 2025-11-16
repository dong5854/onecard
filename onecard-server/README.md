# onecard-server

NestJS 기반으로 구현한 원카드 게임 API 서버입니다. React 클라이언트에서 사용하던 게임 로직을 Nest의 의존성 주입·모듈 시스템에 맞게 이식하고, 싱글 플레이 모드의 AI 턴 처리까지 서버에서 담당하도록 리팩토링했습니다.

## 주요 특징
- **모듈러 아키텍처**: `AppModule` → `GameModule` 계층 구조, `GameStateStore`/`GameEngineService`/`GameAiService`로 책임 분리.
- **도메인 캡슐화**: 카드 생성/셔플·상태 전이·행동 정의 등을 `src/modules/game/domain` 하위에 모아 React 잔재 제거.
- **RESTful 세션 API**: `/games` 리소스 중심 설계로 다중 게임 세션을 생성/조회/삭제할 수 있으며, 액션 PATCH 및 `/games/{id}/ai-turns` 서브 리소스로 AI 턴을 실행.
- **DTO + ValidationPipe**: `class-validator`/`class-transformer` 기반 DTO로 입력을 검증하고 Nest 표준 파이프라인에 연결.

## 디렉터리 구조
```
src/
  main.ts                # NestFactory 부트스트랩 및 전역 파이프 구성
  app.module.ts
  modules/game/
    constants/           # 기본 게임 설정 토큰
    controller + spec    # HTTP 인터페이스
    dto/                 # 요청 DTO 및 enum
    services/            # GameService / GameEngineService / GameAiService
    state/               # GameStateStore (인메모리 상태 보관)
    domain/              # 순수 게임 로직 (engine, state machine, utils, types)
```

## 설치 & 실행
```bash
yarn install

# 개발 서버
yarn start

# 파일 변경 감지
yarn start:dev

# 프로덕션 빌드 + 실행
yarn build
yarn start:prod
```

> 기본 포트는 `PORT` 환경 변수(기본 3000)로 조정할 수 있습니다.

## 스크립트
| 명령 | 설명 |
| --- | --- |
| `yarn lint` | eslint + prettier 검사(자동 수정 포함) |
| `yarn test` | Jest 단위 테스트 (현재 `wrap-ansi` ESM 이슈 해결 필요) |
| `yarn test:e2e` | e2e 테스트 |

## API 개요
| 메서드 | 경로 | 설명 |
| --- | --- | --- |
| `GET /games` | 게임 세션 목록 조회 |
| `POST /games` | 설정(Optional)을 받아 새 게임 세션 생성 |
| `GET /games/{gameId}` | 특정 게임 세션 상태 조회 |
| `PATCH /games/{gameId}` | DTO(`ApplyGameActionDto`) 기반 플레이어 액션 적용 |
| `POST /games/{gameId}/ai-turns` | 현재 턴이 AI일 때 서버에서 자동 행동 실행 |
| `DELETE /games/{gameId}` | 게임 세션 삭제 |

### DTO 하이라이트
- `GameSettingsDto`: 모드, 참가자 수, 조커 포함 여부, 난이도 등 옵션을 검증.
- `GameActionDto`: `START_GAME`, `PLAY_CARD`, `DRAW_CARD`, `APPLY_SPECIAL_EFFECT`, `END_GAME` 등 액션 타입과 필요한 필드를 검증.
- `ApplyGameActionDto`: PATCH 요청 본문에서 `GameActionDto`를 래핑해 검증.

## 개발 메모
- 도메인 엔진은 순수 함수(`transitionGameState`, `createGameState`, `cardUtils` 등)로 유지해 테스트와 재사용이 쉽습니다.
- `GameStateStore`는 인메모리 다중 세션 저장소이며, 멀티 룸/멀티 세션이 필요하면 이 계층을 별도 persistence 레이어로 교체하면 됩니다.
- AI 전략은 `GameAiService`와 `domain/state/gamePlayers.ts`에서 난이도별로 확장 가능합니다.

## TODO / 향후 작업
1. Jest 실행 시 `wrap-ansi` ESM 호환성 문제 해결.
2. 멀티플레이 지원 및 세션 분리 저장소 도입.
3. AI 난이도별 전략 고도화 및 행동 로그 저장.
