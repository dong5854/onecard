"""Stable-Baselines3 학습 스크립트."""

import argparse
import os
from typing import Optional

import gymnasium as gym
from stable_baselines3 import PPO
from stable_baselines3.common.callbacks import CheckpointCallback
from stable_baselines3.common.vec_env import DummyVecEnv

from gym_env import OneCardEnv


def make_env(endpoint: str, settings: Optional[dict]) -> gym.Env:
    return OneCardEnv(endpoint=endpoint, settings=settings)


def main() -> None:
    parser = argparse.ArgumentParser(description="Train PPO agent on ONE CARD")
    parser.add_argument("--endpoint", default="http://localhost:4000", help="engine bridge URL")
    parser.add_argument("--timesteps", type=int, default=200_000, help="number of training timesteps")
    parser.add_argument("--model-path", default="ppo-onecard.zip", help="path to save the trained model")
    parser.add_argument("--checkpoint-dir", default="checkpoints", help="directory for periodic checkpoints")
    args = parser.parse_args()

    env = DummyVecEnv([lambda: make_env(args.endpoint, None)])

    os.makedirs(args.checkpoint_dir, exist_ok=True)
    checkpoint_callback = CheckpointCallback(save_freq=10_000, save_path=args.checkpoint_dir, name_prefix="ppo")

    model = PPO("MlpPolicy", env, verbose=1)
    model.learn(total_timesteps=args.timesteps, callback=checkpoint_callback)
    model.save(args.model_path)
    env.close()


if __name__ == "__main__":
    main()
