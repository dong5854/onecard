"""Stable-Baselines3 모델을 ONNX로 내보내는 스크립트."""

from __future__ import annotations

import argparse
import json
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Dict, Tuple

import gymnasium as gym
import torch
from stable_baselines3 import PPO
from stable_baselines3.common.policies import ActorCriticPolicy

from gym_env import OneCardEnv


@dataclass
class ExportSettings:
    mode: str
    numberOfPlayers: int
    difficulty: str
    includeJokers: bool
    maxHandSize: int
    initHandSize: int

    @classmethod
    def from_args(cls, args: argparse.Namespace) -> "ExportSettings":
        return cls(
            mode="single",
            numberOfPlayers=args.players,
            difficulty=args.difficulty,
            includeJokers=args.include_jokers,
            maxHandSize=args.max_hand_size,
            initHandSize=args.init_hand_size,
        )

    def to_dict(self) -> Dict[str, object]:
        return asdict(self)


class PolicyExporter(torch.nn.Module):
    """PPO Actor-Critic 정책에서 로짓/가치를 직접 추출하기 위한 래퍼."""

    def __init__(self, policy: ActorCriticPolicy) -> None:
        super().__init__()
        self.policy = policy

    def forward(self, obs: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor]:
        features = self.policy.extract_features(obs)
        latent_pi, latent_vf = self.policy.mlp_extractor(features)
        action_logits = self.policy.action_net(latent_pi)
        state_value = self.policy.value_net(latent_vf)
        return action_logits, state_value


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Export PPO model (Stable-Baselines3) to ONNX"
    )
    parser.add_argument(
        "--model-path",
        default="ppo-onecard.zip",
        help="학습된 SB3 모델 (.zip)",
    )
    parser.add_argument(
        "--output-path",
        default="ppo-onecard.onnx",
        help="저장할 ONNX 파일 경로",
    )
    parser.add_argument(
        "--endpoint",
        default="http://localhost:3000",
        help="oncard-server REST URL (관측 차원 산출용)",
    )
    parser.add_argument(
        "--players",
        type=int,
        default=2,
        help="플레이어 수 (에이전트 포함)",
    )
    parser.add_argument(
        "--difficulty",
        choices=["easy", "medium", "hard"],
        default="easy",
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
    parser.add_argument(
        "--opset",
        type=int,
        default=17,
        help="ONNX opset 버전",
    )
    args = parser.parse_args()

    export_settings = ExportSettings.from_args(args)
    env = OneCardEnv(endpoint=args.endpoint, settings=export_settings.to_dict())
    obs_space = env.observation_space
    if not isinstance(obs_space, gym.spaces.Box):
        raise TypeError("Observation space must be Box to compute observation_dim.")
    observation_dim = obs_space.shape[0]

    model = PPO.load(args.model_path, env=env)
    model.policy.eval()

    wrapper = PolicyExporter(model.policy)
    dummy = torch.zeros((1, observation_dim), dtype=torch.float32)

    output_path = Path(args.output_path)
    torch.onnx.export(
        wrapper,
        (dummy,),
        output_path,
        input_names=["observation"],
        output_names=["action_logits", "state_value"],
        opset_version=args.opset,
        dynamic_axes={"observation": {0: "batch"}, "action_logits": {0: "batch"}, "state_value": {0: "batch"}},
    )

    action_space = env.action_space
    if not isinstance(action_space, gym.spaces.Discrete):
        raise TypeError("Action space must be Discrete to compute action dimension.")
    metadata = {
        "observation_dim": int(observation_dim),
        "action_dim": int(action_space.n),
        "settings": export_settings.to_dict(),
        "opset_version": int(args.opset),
    }
    metadata_path = output_path.with_suffix(output_path.suffix + ".json")
    metadata_path.write_text(json.dumps(metadata, indent=2), encoding="utf-8")

    env.close()
    print(f"Exported ONNX model to {output_path}")
    print(f"Wrote metadata to {metadata_path}")


if __name__ == "__main__":
    main()
