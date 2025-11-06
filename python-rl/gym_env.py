"""ONE CARD 싱글 플레이 환경을 Gymnasium과 연동하는 래퍼."""

from dataclasses import dataclass
from typing import Any, Callable, Dict, Optional, Sequence, Tuple

import gymnasium as gym
import numpy as np
import requests


def default_reward(
    prev_state: Optional[Dict[str, Any]],
    next_state: Dict[str, Any],
    action_was_valid: bool,
) -> float:
    """기본 보상 함수.

    Args:
        prev_state: 이전 게임 상태 객체.
        next_state: 현재 게임 상태 객체.
        action_was_valid: 수행한 행동이 유효했는지 여부.

    Returns:
        계산된 스칼라 보상 값.
    """
    reward = 0.0
    if prev_state is not None:
        prev_size = len(prev_state["players"][0]["hand"])
        next_size = len(next_state["players"][0]["hand"])
        reward += 0.05 * float(prev_size - next_size)
        reward -= 0.01
    if not action_was_valid:
        reward -= 0.1
    if next_state["gameStatus"] == "finished":
        winner = next_state.get("winner")
        reward += 1.0 if winner and winner.get("isSelf") else -1.0
    return reward


@dataclass(frozen=True)
class ObservationSpec:
    """관측 벡터 구성을 설명하는 스펙.

    Attributes:
        ranks: 사용 가능한 카드 랭크 목록.
        suits: 사용 가능한 카드 무늬 목록.
        max_hand_size: 플레이어 한 명이 들 수 있는 최대 카드 수.
        player_count: 게임에 참여하는 플레이어 수.
        initial_deck_size: 초기 드로우 덱의 카드 수.
    """

    ranks: Sequence[int]
    suits: Sequence[str]
    max_hand_size: int
    player_count: int
    initial_deck_size: int

    @property
    def vector_size(self) -> int:
        """관측 벡터가 갖는 총 길이를 계산한다.

        Returns:
            관측 벡터의 특성 개수.
        """
        rank_dim = len(self.ranks)
        suit_dim = len(self.suits)
        player_dim = self.player_count
        opponent_dim = max(0, self.player_count - 1)
        return (
            rank_dim
            + suit_dim
            + 1
            + rank_dim
            + suit_dim
            + 1
            + 1
            + 1
            + player_dim
            + 1
            + opponent_dim
        )


class ObservationEncoder:
    """게임 상태를 정규화된 관측 벡터로 인코딩한다."""

    def __init__(self, spec: ObservationSpec) -> None:
        """인코더를 초기화한다.

        Args:
            spec: 관측 스펙 정의.
        """
        self.spec = spec
        self.rank_to_idx = {rank: idx for idx, rank in enumerate(spec.ranks)}
        self.suit_to_idx = {suit: idx for idx, suit in enumerate(spec.suits)}

    def encode(self, state: Dict[str, Any]) -> np.ndarray:
        """주어진 상태를 관측 벡터로 변환한다.

        Args:
            state: 엔진에서 반환된 게임 상태.

        Returns:
            정규화된 관측 벡터.

        Raises:
            ValueError: 관측 길이가 스펙과 일치하지 않을 때.
        """
        player = state["players"][0]
        hand = player["hand"]

        rank_counts = np.zeros(len(self.spec.ranks), dtype=np.float32)
        suit_counts = np.zeros(len(self.spec.suits), dtype=np.float32)
        joker_count = 0.0
        for card in hand:
            if card.get("isJoker"):
                joker_count += 1.0
            else:
                rank_idx = self.rank_to_idx.get(card.get("rank"))
                suit_idx = self.suit_to_idx.get(card.get("suit"))
                if rank_idx is not None:
                    rank_counts[rank_idx] += 1.0
                if suit_idx is not None:
                    suit_counts[suit_idx] += 1.0
        rank_counts /= max(1.0, float(self.spec.max_hand_size))
        suit_counts /= max(1.0, float(self.spec.max_hand_size))
        joker_feat = np.array(
            [joker_count / max(1.0, float(self.spec.max_hand_size))],
            dtype=np.float32,
        )

        top_card = state["discardPile"][0]
        top_rank = np.zeros(len(self.spec.ranks), dtype=np.float32)
        top_suit = np.zeros(len(self.spec.suits), dtype=np.float32)
        top_joker = np.array([1.0 if top_card.get("isJoker") else 0.0], dtype=np.float32)
        if not top_card.get("isJoker"):
            rank_idx = self.rank_to_idx.get(top_card.get("rank"))
            suit_idx = self.suit_to_idx.get(top_card.get("suit"))
            if rank_idx is not None:
                top_rank[rank_idx] = 1.0
            if suit_idx is not None:
                top_suit[suit_idx] = 1.0

        damage = np.array(
            [
                min(float(state["damage"]), float(self.spec.max_hand_size))
                / max(1.0, float(self.spec.max_hand_size))
            ],
            dtype=np.float32,
        )
        direction = np.array(
            [1.0 if state["direction"] == "clockwise" else 0.0], dtype=np.float32
        )

        current_player = np.zeros(self.spec.player_count, dtype=np.float32)
        current_player[state["currentPlayerIndex"]] = 1.0

        deck_size = np.array(
            [
                min(
                    float(len(state.get("deck", [])))
                    / max(1.0, float(self.spec.initial_deck_size)),
                    1.0,
                )
            ],
            dtype=np.float32,
        )

        opponent_sizes = np.array(
            [
                float(len(p["hand"])) / max(1.0, float(self.spec.max_hand_size))
                for p in state["players"][1:]
            ],
            dtype=np.float32,
        )

        vector = np.concatenate(
            [
                rank_counts,
                suit_counts,
                joker_feat,
                top_rank,
                top_suit,
                top_joker,
                damage,
                direction,
                current_player,
                deck_size,
                opponent_sizes,
            ]
        )
        if vector.shape[0] != self.spec.vector_size:
            raise ValueError(
                f"Observation length {vector.shape[0]} does not match spec {self.spec.vector_size}"
            )
        return vector


class OneCardEnv(gym.Env):
    """강화학습용 ONE CARD 싱글플레이 환경."""

    metadata = {"render_modes": ["human"]}

    def __init__(
        self,
        endpoint: str = "http://localhost:4000",
        settings: Optional[Dict[str, Any]] = None,
        session: Optional[requests.Session] = None,
    ) -> None:
        """환경을 초기화한다.

        Args:
            endpoint: 엔진 브리지 서버의 엔드포인트.
            settings: 기본 게임 설정 덮어쓰기 값.
            session: HTTP 세션 재사용 객체.

        Attributes:
            endpoint: 브리지 서버 주소 (슬래시 제거).
            http: HTTP 세션 객체.
            settings: 게임 설정 딕셔너리.
            reward_function: 보상 전략을 정의하는 콜러블.
            obs_spec: 관측 스펙 정의.
            encoder: 관측 인코더 인스턴스.
            observation_space: 환경의 관측 공간.
            action_space: 환경의 행동 공간.
            state_cache: 최근 상태 캐시.
        """
        super().__init__()

        self.endpoint = endpoint.rstrip("/")
        self.http = session or requests.Session()

        self.settings: Dict[str, Any] = {
            "mode": "single",
            "numberOfPlayers": 2,
            "includeJokers": False,
            "initHandSize": 5,
            "maxHandSize": 15,
            "difficulty": "easy",
        }
        if settings:
            self.settings.update(settings)

        self.reward_function: Callable[[Optional[Dict[str, Any]], Dict[str, Any], bool], float] = (
            default_reward
        )

        rank_values = list(range(1, 14))
        suit_values = ["clubs", "diamonds", "hearts", "spades"]

        self.max_hand_size = int(self.settings["maxHandSize"])
        self.player_count = int(self.settings["numberOfPlayers"])
        base_deck_size = 52 + (2 if self.settings.get("includeJokers") else 0)
        initial_deck_size = (
            base_deck_size
            - self.player_count * int(self.settings["initHandSize"])
            - 1
        )

        self.obs_spec = ObservationSpec(
            ranks=rank_values,
            suits=suit_values,
            max_hand_size=self.max_hand_size,
            player_count=self.player_count,
            initial_deck_size=max(1, initial_deck_size),
        )
        self.encoder = ObservationEncoder(self.obs_spec)

        self.observation_space = gym.spaces.Box(
            low=0.0,
            high=1.0,
            shape=(self.obs_spec.vector_size,),
            dtype=np.float32,
        )

        self.action_space = gym.spaces.Discrete(self.max_hand_size + 1)

        self.state_cache: Optional[Dict[str, Any]] = None

    def reset(
        self,
        *,
        seed: Optional[int] = None,
        options: Optional[Dict[str, Any]] = None,
    ) -> Tuple[np.ndarray, Dict[str, Any]]:
        """환경을 초기화하고 첫 관측을 반환한다.

        Args:
            seed: Gymnasium 표준 시드 값.
            options: 게임 설정 덮어쓰기 값.

        Returns:
            관측 벡터와 부가 정보 딕셔너리.
        """
        super().reset(seed=seed)
        if options:
            self.settings.update(options)
        payload = {"settings": self.settings}
        state = self._post_json("/reset", payload)["state"]
        observation = self._encode_state(state)
        self.state_cache = state
        return observation, {}

    def step(self, action: int) -> Tuple[np.ndarray, float, bool, bool, Dict[str, Any]]:
        """하나의 시간 스텝을 진행한다.

        Args:
            action: 이산 행동 인덱스.

        Returns:
            관측 벡터, 보상, 종료 여부, 잘림 여부, 부가 정보.
        """
        if self.state_cache is None:
            raise RuntimeError("reset() must be called before step().")

        action_payload, was_valid = self._decode_action(action, self.state_cache)
        result = self._post_json("/step", {"action": action_payload})

        next_state = result["state"]
        observation = self._encode_state(next_state)
        reward = self._compute_reward(self.state_cache, next_state, was_valid)
        done = bool(result["done"])
        info = result.get("info", {})

        self.state_cache = next_state
        return observation, reward, done, False, info

    def render(self) -> None:
        """현재 상태를 텍스트로 출력한다."""
        if self.state_cache is None:
            print("No state cached. Call reset() first.")
            return
        players = self.state_cache["players"]
        print("--- ONE CARD STATE ---")
        for idx, player in enumerate(players):
            marker = "(You)" if idx == 0 else "(AI)"
            hand_size = len(player["hand"])
            print(f"Player {idx} {marker}: hand={hand_size}")
        top = self.state_cache["discardPile"][0]
        print(
            f"Top card: {self._describe_card(top)} | damage={self.state_cache['damage']}"
        )
        print("Direction:", self.state_cache["direction"])

    def close(self) -> None:
        """환경 종료 시 네트워크 리소스를 해제한다."""
        self.http.close()
        super().close()

    def _post_json(self, path: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """엔진 브리지에 POST 요청을 보내고 응답 JSON을 반환한다.

        Args:
            path: 요청을 보낼 엔드포인트 경로.
            payload: JSON으로 직렬화할 데이터.

        Returns:
            서버의 응답 JSON 딕셔너리.
        """
        response = self.http.post(f"{self.endpoint}{path}", json=payload, timeout=10)
        response.raise_for_status()
        return response.json()

    def _encode_state(self, state: Dict[str, Any]) -> np.ndarray:
        """관측 인코더를 사용해 상태를 벡터로 변환한다."""
        return self.encoder.encode(state)

    def _decode_action(
        self,
        action: int,
        state: Dict[str, Any],
    ) -> Tuple[Dict[str, Any], bool]:
        """이산 행동 인덱스를 엔진 액션으로 매핑한다.

        Args:
            action: 선택된 행동 인덱스.
            state: 현재 게임 상태.

        Returns:
            엔진 액션 payload와 유효성 플래그.
        """
        hand = state["players"][0]["hand"]
        if action == self.max_hand_size:
            return {"type": "DRAW_CARD", "amount": 1}, True
        if 0 <= action < len(hand):
            return {
                "type": "PLAY_CARD",
                "playerIndex": 0,
                "cardIndex": action,
            }, True
        return {"type": "DRAW_CARD", "amount": 1}, False

    def _compute_reward(
        self,
        prev_state: Optional[Dict[str, Any]],
        next_state: Dict[str, Any],
        action_was_valid: bool,
    ) -> float:
        """설정된 보상 함수를 사용해 보상을 계산한다."""
        return float(self.reward_function(prev_state, next_state, action_was_valid))

    def _describe_card(self, card: Dict[str, Any]) -> str:
        """카드 정보를 사람이 읽기 쉬운 문자열로 변환한다."""
        if card.get("isJoker"):
            return "JOKER"
        rank = card.get("rank", "?")
        suit = card.get("suit", "?")
        return f"{rank} of {suit}"
