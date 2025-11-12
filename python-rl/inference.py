"""학습된 모델로 ONE CARD 환경을 플레이하는 스크립트."""

import argparse

from stable_baselines3 import PPO

from gym_env import OneCardEnv


def run_episode(model_path: str, endpoint: str, deterministic: bool) -> None:
    env = OneCardEnv(endpoint=endpoint)
    model = PPO.load(model_path, env=env)

    obs, _ = env.reset()
    done, truncated = False, False
    step_idx = 0

    while not (done or truncated):
        action, _state = model.predict(obs, deterministic=deterministic)
        action_index = int(action) if hasattr(action, "__iter__") else int(action)
        obs, reward, done, truncated, info = env.step(action_index)
        print(f"Step {step_idx}: reward={reward:.3f}, done={done}, truncated={truncated}")
        env.render()
        step_idx += 1

    env.close()


def main() -> None:
    parser = argparse.ArgumentParser(description="Run inference with a trained PPO model")
    parser.add_argument("--model-path", default="ppo-onecard.zip", help="경로: 학습된 모델 파일")
    parser.add_argument("--endpoint", default="http://localhost:4000", help="엔진 브리지 서버 URL")
    parser.add_argument("--deterministic", action="store_true", help="항상 argmax 행동을 사용")
    args = parser.parse_args()

    run_episode(args.model_path, args.endpoint, args.deterministic)


if __name__ == "__main__":
    main()
