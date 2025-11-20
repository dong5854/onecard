"""학습된 모델로 ONE CARD 환경을 플레이하는 스크립트."""

from __future__ import annotations

import argparse
from pathlib import Path
from typing import Dict

from stable_baselines3 import PPO

from gym_env import OneCardEnv


def build_settings_from_args(args: argparse.Namespace) -> Dict[str, object]:
    return {
        "mode": "single",
        "numberOfPlayers": args.players,
        "difficulty": args.difficulty,
        "includeJokers": args.include_jokers,
        "maxHandSize": args.max_hand_size,
        "initHandSize": args.init_hand_size,
    }


def case_suffix(players: int, include_jokers: bool) -> str:
    return f"p{players}_joker{'on' if include_jokers else 'off'}"


def resolve_model_path(args: argparse.Namespace) -> Path:
    if args.model_path:
        return Path(args.model_path)
    suffix = case_suffix(args.players, args.include_jokers)
    candidate = Path(args.models_dir) / f"ppo-onecard_{suffix}.zip"
    if not candidate.exists():
        raise FileNotFoundError(
            f"모델 파일을 찾을 수 없습니다: {candidate}. '--model-path'를 직접 지정하거나 해당 조합을 학습하세요."
        )
    return candidate


def run_episode(
    model_path: Path,
    endpoint: str,
    settings: Dict[str, object],
    deterministic: bool,
) -> None:
    env = OneCardEnv(endpoint=endpoint, settings=settings)
    model = PPO.load(model_path, env=env)

    obs, _ = env.reset()
    done, truncated = False, False
    step_idx = 0

    while not (done or truncated):
        action, _state = model.predict(obs, deterministic=deterministic)
        action_index = int(action) if hasattr(action, "__iter__") else int(action)
        obs, reward, done, truncated, info = env.step(action_index)
        print(
            f"Step {step_idx}: reward={reward:.3f}, done={done}, truncated={truncated}, info={info}"
        )
        env.render()
        step_idx += 1

    env.close()


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Run inference with a trained PPO model"
    )
    parser.add_argument(
        "--model-path",
        help="경로: 학습된 모델 파일 (미지정 시 --models-dir에서 자동 탐색)",
    )
    parser.add_argument(
        "--models-dir",
        default="models",
        help="자동 탐색 시 모델(.zip)을 찾을 기본 폴더",
    )
    parser.add_argument(
        "--endpoint",
        default="http://localhost:3000",
        help="oncard-server REST 주소",
    )
    parser.add_argument(
        "--deterministic",
        action="store_true",
        help="항상 argmax 행동을 사용",
    )
    parser.add_argument(
        "--players",
        type=int,
        default=2,
        help="플레이어 수 (에이전트 + AI)",
    )
    parser.add_argument(
        "--difficulty",
        choices=["easy", "medium", "hard"],
        default="medium",
        help="서버 AI 난이도",
    )
    parser.add_argument(
        "--include-jokers",
        action="store_true",
        help="조커 포함 여부",
    )
    parser.add_argument(
        "--max-hand-size",
        type=int,
        default=15,
        help="손패 최대 크기",
    )
    parser.add_argument(
        "--init-hand-size",
        type=int,
        default=5,
        help="시작 손패 크기",
    )
    args = parser.parse_args()

    model_path = resolve_model_path(args)
    settings = build_settings_from_args(args)
    run_episode(model_path, args.endpoint, settings, args.deterministic)


if __name__ == "__main__":
    main()
