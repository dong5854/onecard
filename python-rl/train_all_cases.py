"""Batch training helper for running all player/joker combinations."""

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Run train.py sequentially for players 2~4 and whether jokers are included."
        )
    )
    parser.add_argument(
        "--python",
        default=sys.executable,
        help="python interpreter to use when spawning train.py",
    )
    parser.add_argument(
        "--train-script",
        default=str(Path(__file__).with_name("train.py")),
        help="path to the train.py script",
    )
    parser.add_argument(
        "--output-dir",
        default="models",
        help="directory where the trained model artifacts will be stored",
    )
    parser.add_argument(
        "--checkpoint-root",
        default="checkpoints",
        help="base directory for checkpoints (one sub-dir per case)",
    )
    parser.add_argument(
        "--endpoint",
        default="http://localhost:3000",
        help="onecard-server REST base URL forwarded to train.py",
    )
    parser.add_argument(
        "--timesteps",
        type=int,
        default=200_000,
        help="number of training timesteps for each run",
    )
    parser.add_argument(
        "--difficulty",
        choices=["easy", "medium", "hard"],
        default="easy",
        help="difficulty passed to the backend",
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
        help="starting hand size for every player",
    )
    return parser.parse_args()


def run_case(
    *,
    python_exec: str,
    train_script: Path,
    endpoint: str,
    timesteps: int,
    difficulty: str,
    max_hand_size: int,
    init_hand_size: int,
    players: int,
    include_jokers: bool,
    model_path: Path,
    checkpoint_dir: Path,
) -> None:
    case_label = f"players-{players}_jokers-{'on' if include_jokers else 'off'}"
    print(f"\n=== Training {case_label} ===")
    checkpoint_dir.mkdir(parents=True, exist_ok=True)
    cmd = [
        python_exec,
        str(train_script),
        "--endpoint",
        endpoint,
        "--timesteps",
        str(timesteps),
        "--model-path",
        str(model_path),
        "--checkpoint-dir",
        str(checkpoint_dir),
        "--players",
        str(players),
        "--difficulty",
        difficulty,
        "--max-hand-size",
        str(max_hand_size),
        "--init-hand-size",
        str(init_hand_size),
    ]
    if include_jokers:
        cmd.append("--include-jokers")
    subprocess.run(cmd, check=True)


def main() -> None:
    args = parse_args()
    train_script = Path(args.train_script)
    output_dir = Path(args.output_dir)
    checkpoint_root = Path(args.checkpoint_root)
    output_dir.mkdir(parents=True, exist_ok=True)
    checkpoint_root.mkdir(parents=True, exist_ok=True)

    for players in (2, 3, 4):
        for include_jokers in (False, True):
            case_suffix = f"p{players}_joker{'on' if include_jokers else 'off'}"
            model_path = output_dir / f"ppo-onecard_{case_suffix}.zip"
            checkpoint_dir = checkpoint_root / case_suffix
            run_case(
                python_exec=args.python,
                train_script=train_script,
                endpoint=args.endpoint,
                timesteps=args.timesteps,
                difficulty=args.difficulty,
                max_hand_size=args.max_hand_size,
                init_hand_size=args.init_hand_size,
                players=players,
                include_jokers=include_jokers,
                model_path=model_path,
                checkpoint_dir=checkpoint_dir,
            )


if __name__ == "__main__":
    main()
