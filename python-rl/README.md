# python-rl

ONE CARD 강화학습 실험 스크립트 모음입니다. 이제는 `engine-bridge`가 아니라 NestJS 기반의 `onecard-server`와 직접 HTTP로 통신하여 게임 상태를 전환합니다. 학습·추론 모두 동일한 REST API(`/games`, `/games/{id}`, `/games/{id}/ai-turns`)를 사용하므로, 실제 서비스와 최대한 가까운 규칙으로 에이전트를 훈련할 수 있습니다.

## 사전 준비

1. **oncard-server 실행**
   ```bash
   cd ../onecard-server
   yarn install
   yarn start:dev # 기본 포트 3000
   ```
2. **Python 의존성 설치**
   ```bash
    cd ../python-rl
    # uv 사용 시
    uv sync
    # 또는 표준 pip
    python -m venv .venv
    source .venv/bin/activate
    pip install -e .
   ```

## 학습 실행

```bash
cd python-rl
python train.py \
  --endpoint http://localhost:3000 \
  --timesteps 300000 \
  --players 4 \
  --difficulty easy \
  --model-path checkpoints/ppo-onecard.zip
```

- `--players`, `--difficulty`, `--include-jokers`, `--max-hand-size`, `--init-hand-size` 옵션으로 서버에 전달될 게임 설정을 제어합니다.
- 설정을 바꾸면 관측 공간/행동 공간이 달라지므로, 동일한 설정으로 학습·추론을 진행해야 합니다.
- 체크포인트는 `--checkpoint-dir`(기본 `checkpoints`)에 10k step마다 저장됩니다.

### 전체 조합 일괄 학습

플레이어 수 2~4와 조커 포함 여부(on/off) 총 6가지 설정을 한 번에 학습하려면 `train_all_cases.py`를 사용하세요. 각 조합은 `models/ppo-onecard_p{플레이어}_joker{on|off}.zip` 형식으로 저장됩니다.

```bash
cd python-rl
python train_all_cases.py \
  --endpoint http://localhost:3000 \
  --timesteps 300000 \
  --difficulty easy \
  --output-dir models \
  --checkpoint-dir checkpoints
```

- `--timesteps`, `--difficulty`, `--max-hand-size` 등은 내부적으로 `train.py`에 그대로 전달됩니다.
- `models` 디렉터리는 자동으로 생성되며, 추후 ONNX 내보내기에서도 동일한 경로를 사용합니다.

## 추론 실행

```bash
python inference.py \
  --endpoint http://localhost:3000 \
  --model-path checkpoints/ppo-onecard.zip \
  --players 4 \
  --difficulty easy \
  --deterministic
```

터미널에 각 step의 보상과 현재 게임 보드가 출력됩니다. `--deterministic` 플래그를 빼면 정책의 확률 분포에 따라 행동을 샘플링합니다.

## ONNX 내보내기 (Nest 연동)

Nest 백엔드에서 `onnxruntime-node`로 추론하려면 학습된 모델을 ONNX로 변환합니다.

```bash
python export_onnx.py \
  --model-path checkpoints/ppo-onecard.zip \
  --output-path exports/ppo-onecard.onnx \
  --endpoint http://localhost:3000 \
  --players 4 \
  --difficulty easy \
  --max-hand-size 15 \
  --init-hand-size 5
```

- 같은 설정(플레이어 수, 난이도, 조커 포함 여부 등)으로 학습된 모델만 내보내야 관측 차원이 일치합니다.
- 스크립트는 ONNX 파일과 함께 `<파일명>.json` 메타데이터를 생성합니다. 이 JSON에는 `observation_dim`, `action_dim`, `settings`가 들어 있으며, Nest에서 관측 벡터를 구성할 때 참고할 수 있습니다.
- Node 측에서는 `onnxruntime-node`로 모델을 로드하고, `ObservationEncoder`와 동일한 전처리를 TypeScript로 구현해 `action_logits`를 argmax하거나 softmax로 정책을 구성하면 됩니다.
- ONNX 산출물은 기본적으로 `exports/` 아래 저장하도록 설명되어 있으며, 이 디렉터리는 `.gitignore`에 추가해 깃에는 포함되지 않습니다.

### 전체 조합 일괄 내보내기

`train_all_cases.py`로 생성된 모든 모델을 한 번에 ONNX로 변환하려면 `--all-cases` 옵션을 사용합니다. 모델 ZIP은 `--models-dir`에서 찾고, ONNX 결과는 `--onnx-dir`에 저장합니다.

```bash
python export_onnx.py \
  --all-cases \
  --models-dir models \
  --onnx-dir onnx_exports \
  --endpoint http://localhost:3000 \
  --difficulty easy
```

각 조합에 대해 `ppo-onecard_p{플레이어}_joker{on|off}.onnx`와 `.onnx.json` 메타데이터가 생성됩니다.

## 환경 작동 방식

`gym_env.OneCardEnv`는 다음 순서로 서버와 상호작용합니다.

1. `reset()` 시 `POST /games`로 새 세션을 만들고, `PATCH /games/{id}`에 `START_GAME` 액션을 보내 게임을 시작합니다.
2. 플레이어 차례가 아니면 `POST /games/{id}/ai-turns`를 호출해 서버 내장 AI가 턴을 모두 처리할 때까지 기다립니다.
3. `step()` 호출 시에는 플레이어 행동을 `PATCH /games/{id}`로 전달하고, 다시 AI 턴을 필요만큼 실행해 관측을 돌려줍니다.
4. 에피소드가 끝나거나 `close()`가 호출되면 `DELETE /games/{id}`로 세션을 정리합니다.

이 구조 덕분에 강화학습 실험과 실제 게임 서비스가 동일한 엔진/상태머신을 공유합니다.

## 트러블슈팅

- **HTTP 4xx**: 대부분 서버가 기대하지 않은 액션이나 잘못된 설정일 때 발생합니다. 서버 로그(terminal)에서 Nest 에러 메시지를 확인하세요.
- **시드 재현성**: 현재 서버가 덱 셔플 시 고정 시드를 받지 않으므로, 실험을 기록할 때는 랜덤성을 염두에 두고 여러 seeds로 학습하는 것이 좋습니다.
- **환경 누수**: 학습 도중 예외가 발생해도 `OneCardEnv.close()`가 호출되도록 `try/finally`를 사용하는 것이 좋습니다. 세션이 남더라도 `/games` 엔드포인트에서 수동으로 삭제할 수 있습니다.
