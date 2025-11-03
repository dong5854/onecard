# ONE CARD 확장 제안서

## 1. 머신러닝 기반 AI 아이디어

### 1.1 모델 전략
- **강화학습(PPO, DQN 변형)**: 현재 게임 로직을 OpenAI Gym 스타일 환경으로 감싸 자가 플레이(Self-Play) 학습.
- **상태 표현**: 손패, 버린 카드 top, 누적 피해, 남은 카드 확률 추정치, 진행 방향 등.
- **행동 공간**: 유효 카드 플레이 + 드로우 선택으로 제한, 규칙 기반 필터로 후보 축소.
- **훈련/배포 파이프라인**:
  - Python (PyTorch)에서 학습 → ONNX 변환 → Node.js/브라우저(WebAssembly) 추론.
  - 서버에서 주기적으로 모델 버전을 관리하고 클라이언트는 최신 모델을 fetch.

### 1.2 추가 전략
- **커리큘럼 학습**: 초기에는 현재 easy AI와 스파링 → 점진적으로 복잡한 전략 도입.
- **경량 모델**: 실시간 응답을 위해 작은 MLP/LSTM + 규칙 필터 조합 유지.
- **분리된 추론 서비스**: FastAPI/Flask로 모델 서빙 후 메인 서버는 REST/gRPC 호출.

## 2. 멀티플레이어 아키텍처 제안

### 2.1 실시간 서버 후보
- **NestJS + WebSocket/Socket.IO**: TypeScript 일관성, 모듈식 구조.
- **Colyseus**: 룸/상태 동기화 내장, 턴 기반 게임에 최적화.
- **권장 구조**: 서버에서 게임 상태를 권위(authoritative)로 유지, 클라이언트는 입력만 전송.

### 2.1.1 기타 백엔드 대안
- **Fastify + uWebSockets.js**: Node.js 생태계를 유지하면서 높은 처리량을 기대. 구조를 직접 설계해야 하지만 TS 로직 재사용이 용이함.
- **AdonisJS**: 인증/ORM/WebSocket이 통합된 TS 프레임워크로, 게임 룸 관리 및 API를 한 곳에서 운영 가능.
- **Go (Fiber/Echo + Gorilla WebSocket)**
  - 장점: 고루틴 기반 높은 동시성, 낮은 메모리 footprint, 배포 간편.
  - 고려사항: 현재 TS 로직을 Go로 이식해야 하며, 프레임워크 구조를 직접 설계해야 함.
- **Kotlin (Ktor / Spring WebFlux)**
  - 장점: 코루틴 기반 비동기 처리, JVM 생태계 활용, Spring 사용 시 인증/DB/모니터링이 풍부.
  - 고려사항: JVM 배포(또는 GraalVM 네이티브)와 TS ↔ Kotlin 로직 분리를 고민해야 함.
- **Elixir/Phoenix**: 채널 기반으로 초고동시성 지원. 단, 기존 TS 코드와의 통합은 별도 REST/gRPC 계층이 필요.

### 2.2 지원 서비스
- 세션·매치메이킹: Redis Pub/Sub, Key-Value 저장소.
- 인증/친구: tRPC 또는 GraphQL (Apollo Server)로 타입 안전 API 제공. 대규모 분산 환경이라면 **gRPC**를 도입해 서버 간 통신을 표준화하고, TypeScript 코드엔 `ts-proto` 등의 플러그인으로 타입을 생성할 수 있습니다.
- ML 추론 API: 별도 Python 서비스에서 모델 결정 결과를 반환.

## 3. 아키텍처 다이어그램
```
+-------------------+       REST/WebSocket       +-------------------------+
|   Next.js Client  | <------------------------> |   Game Gateway (Nest)   |
| - UI (React)      |                            | - Auth / Matchmaking    |
| - Input events    |                            | - Room lifecycle        |
+---------+---------+                            +-----------+-------------+
          |                                                     |
          | GraphQL/tRPC                                        |
          v                                                     v
+-----------------------+                           +-----------------------+
|   Game State Engine   | <------ Redis Pub/Sub --->|  ML Inference Service |
| - Reducer logic port  |                           | - RL model (ONNX)      |
| - Authoritative rules |                           | - FastAPI/Flask        |
+-----------+-----------+                           +-----------------------+
            |
            | Persistence / Analytics
            v
+-----------------------+
|   Database (Postgres) |
| + Replay storage      |
+-----------------------+
```

## 4. POC 로드맵

### Phase 1 — Multiplayer Foundation (2~3주)
1. 기존 reducer 로직을 서버 공용 모듈로 추출.
2. NestJS + WebSocket 기반 게임 룸/턴 동기화 구축.
3. Redis를 활용한 세션 관리, 기본 매치메이킹 구현.
4. 클라이언트는 서버가 푸시하는 상태로 UI만 렌더.

### Phase 2 — ML AI Integration (4~6주)
1. 게임 환경을 Python RL 환경으로 래핑, PPO로 self-play 학습.
2. 학습된 모델을 ONNX로 변환하고 추론 REST API 작성.
3. 서버 사이드에서 AI 플레이어 시나리오에 대해 추론 호출 → 선택 액션을 룸에 반영.
4. 모델 버전 관리 및 핫스왑 전략 도입.

### Phase 3 — Enhancements & UX (2~4주)
1. 멀티 난이도 전략(중간/어려움) 도입 및 규칙 기반/ML 혼합 전략 적용.
2. 랭킹/리플레이/통계 저장을 위한 Postgres 스키마 설계.
3. 모바일 UX 개선, 터치 제스처 및 접근성 강화.
4. 모니터링/알람(예: Prometheus + Grafana) 구축으로 안정성 확보.

---

## 참고 노트
- ML 프로젝트는 데이터(게임 로그) 축적을 위해 초기엔 서버 권위 구조가 필수.
- 추론 API는 응답 지연을 100ms 이하로 유지해야 사용성이 좋음.
- Colyseus 도입 시 룸 상태 직렬화가 쉬워지지만, 자체 락/동시성 전략을 검토할 것.
- 멀티플레이 초기에는 동시 사용자 수를 가정하고 부하 테스트(K6, Artillery)를 추천.
