# Onecard API (FastAPI)

FastAPI로 구성된 Onecard 게임 서버입니다. 주요 엔드포인트는 `/games`와 `/games/{id}/onnx-action`입니다. 코드 패키지는 `src/onecard_api` 이하로 정리되었습니다.

## 실행

```bash
cd onecard-server
python -m venv .venv
source .venv/bin/activate
pip install -e .
PYTHONPATH=src uvicorn app:app --reload --port 3000
```

## 테스트

```bash
cd onecard-server
PYTHONPATH=src pytest
```

## ONNX 모델

- 기본 모델 경로: `assets/onnx` (환경 변수 `ONNX_MODEL_DIR`로 재정의 가능, 패키지 루트의 `assets/onnx`가 우선시됨)
- `/games/{gameId}/onnx-action/health`로 모델 로드 가능 여부를 확인할 수 있습니다.
