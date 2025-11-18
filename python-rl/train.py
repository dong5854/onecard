"""Stable-Baselines3 학습 스크립트."""

import argparse
import os
from typing import Dict, Optional

import gymnasium as gym
from stable_baselines3 import PPO
from stable_baselines3.common.callbacks import CheckpointCallback
from stable_baselines3.common.vec_env import DummyVecEnv

from gym_env import OneCardEnv


def make_env(endpoint: str, settings: Optional[Dict[str, object]]) -> gym.Env:
    return OneCardEnv(endpoint=endpoint, settings=settings)


def build_settings_from_args(args: argparse.Namespace) -> Dict[str, object]:
    return {
        "mode": "single",
        "numberOfPlayers": args.players,
        "difficulty": args.difficulty,
        "includeJokers": args.include_jokers,
        "maxHandSize": args.max_hand_size,
        "initHandSize": args.init_hand_size,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Train PPO agent on ONE CARD")
    parser.add_argument(
        "--endpoint",
        default="http://localhost:3000",
        help="onecard-server REST base URL",
    )
    parser.add_argument(
        "--timesteps",
        type=int,
        default=200_000,
        help="number of training timesteps",
    )
    parser.add_argument(
        "--model-path",
        default="ppo-onecard.zip",
        help="path to save the trained model",
    )
    parser.add_argument(
        "--checkpoint-dir",
        default="checkpoints",
        help="directory for periodic checkpoints",
    )
    parser.add_argument(
        "--players",
        type=int,
        default=4,
        help="number of players (agent + AI opponents)",
    )
    parser.add_argument(
        "--difficulty",
        choices=["easy", "medium", "hard"],
        default="easy",
        help="AI difficulty level served by backend",
    )
    parser.add_argument(
        "--include-jokers",
        action="store_true",
        help="include jokers when building the deck",
    )
    parser.add_argument(
        "--max-hand-size",
        type=int,
        default=15,
        help="maximum cards a player may hold",
    )
    parser.add_argument(
        "--init-hand-size",
        type=int,
        default=5,
        help="initial cards dealt to each player",
    )
    args = parser.parse_args()

    settings = build_settings_from_args(args)
    env = DummyVecEnv([lambda: make_env(args.endpoint, settings)])

    os.makedirs(args.checkpoint_dir, exist_ok=True)
    checkpoint_callback = CheckpointCallback(
        save_freq=10_000,
        save_path=args.checkpoint_dir,
        name_prefix="ppo",
    )

    model = PPO("MlpPolicy", env, verbose=1)
    model.learn(total_timesteps=args.timesteps, callback=checkpoint_callback)
    model.save(args.model_path)
    env.close()


if __name__ == "__main__":
    main()
