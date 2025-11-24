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
        reward -= 0.5  # 티켓 하나 날린 느낌으로 강한 패널티
    if next_state["gameStatus"] == "finished":
        winner = next_state.get("winner")
        reward += 1.0 if winner and winner.get("isSelf") else -1.0
    return reward


def _is_able_to_block(
    played_card: Dict[str, Any], top_card: Dict[str, Any],
) -> bool:
    # Damage 상황에서 막기 허용 규칙을 서버와 동일하게 맞춘다.
    if top_card.get("rank") == 2:
        return played_card.get("rank") == 2 or (
            played_card.get("suit") == top_card.get("suit")
            and played_card.get("rank") == 1
        )
    if top_card.get("rank") == 1:
        return played_card.get("rank") == 1
    return bool(played_card.get("isJoker"))


def is_valid_play(
    played_card: Dict[str, Any], top_card: Dict[str, Any], damage: float
) -> bool:
    # 서버 cardUtils.isValidPlay 규칙을 그대로 재현한다.
    if played_card.get("isJoker"):
        return True
    if damage > 0:
        return _is_able_to_block(played_card, top_card)
    if top_card.get("isJoker"):
        return True
    if played_card.get("rank") is None or played_card.get("suit") is None:
        return False
    if top_card.get("rank") is None or top_card.get("suit") is None:
        return False
    return (
        played_card.get("rank") == top_card.get("rank")
        or played_card.get("suit") == top_card.get("suit")
    )


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
        endpoint: str = "http://localhost:3000",
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
        self.game_id: Optional[str] = None

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
        self._cleanup_session()
        resource = self._request("post", "/games", json={"settings": self.settings})
        self.game_id = resource["id"]
        state = resource["state"]
        if state.get("gameStatus") == "waiting":
            start_result = self._apply_action({"type": "START_GAME"})
            state = start_result["state"]
        collapsed_state, obs = self._resolve_to_agent_turn(state)
        self.state_cache = collapsed_state
        return obs, {"gameId": self.game_id}

    def step(self, action: int) -> Tuple[np.ndarray, float, bool, bool, Dict[str, Any]]:
        """하나의 시간 스텝을 진행한다.

        Args:
            action: 이산 행동 인덱스.

        Returns:
            관측 벡터, 보상, 종료 여부, 잘림 여부, 부가 정보.
        """
        if self.state_cache is None or not self.game_id:
            raise RuntimeError("reset() must be called before step().")

        action_payload, was_valid = self._decode_action(action, self.state_cache)
        step_result = self._apply_action(action_payload)
        post_action_state = step_result["state"]

        if post_action_state["gameStatus"] == "playing":
            turn_result = self._apply_action({"type": "NEXT_TURN"})
            post_action_state = turn_result["state"]
            merged_info = {
                **step_result.get("info", {}),
                "afterTurn": turn_result.get("info", {}),
            }
        else:
            merged_info = step_result.get("info", {})

        collapsed_state, observation = self._resolve_to_agent_turn(post_action_state)
        reward = self._compute_reward(self.state_cache, collapsed_state, was_valid)
        done = bool(step_result["done"]) or collapsed_state["gameStatus"] == "finished"
        info = {**merged_info, "gameId": self.game_id}
        self.state_cache = collapsed_state
        return observation, reward, done, False, info

    def render(self) -> None:
        """현재 상태를 텍스트로 출력한다."""
        if self.state_cache is None:
            print("No state cached. Call reset() first.")
            return
        players = self.state_cache["players"]
        print("--- ONE CARD STATE ---")
        for idx, player in enumerate(players):
            marker = "(You)" if idx == 0 else "(Enemy)"
            hand_size = len(player["hand"])
            print(f"Player {idx} {marker}: hand={hand_size}")
        top = self.state_cache["discardPile"][0]
        print(
            f"Top card: {self._describe_card(top)} | damage={self.state_cache['damage']}"
        )
        print("Direction:", self.state_cache["direction"])

    def close(self) -> None:
        """환경 종료 시 네트워크 리소스를 해제한다."""
        self._cleanup_session()
        self.http.close()
        super().close()

    def _request(
        self, method: str, path: str, *, json: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """API 서버에 HTTP 요청을 보내고 응답 JSON을 반환한다.

        Args:
            method: HTTP 메서드.
            path: 엔드포인트 경로.
            json: JSON 본문.

        Returns:
            서버의 응답 JSON 딕셔너리.
        """
        url = f"{self.endpoint}{path}"
        response = self.http.request(method.upper(), url, json=json, timeout=10)
        response.raise_for_status()
        if not response.content:
            return {}
        try:
            return response.json()
        except ValueError:
            return {}

    def _encode_state(self, state: Dict[str, Any]) -> np.ndarray:
        """관측 인코더를 사용해 상태를 벡터로 변환한다."""
        return self.encoder.encode(state)

    def action_mask(self) -> np.ndarray:
        """현재 상태에서 선택 가능한 행동(카드)만 True로 표시한 마스크를 반환한다."""
        mask = np.zeros(self.max_hand_size + 1, dtype=bool)
        if self.state_cache is None:
            mask[:] = True
            return mask

        hand = self.state_cache["players"][0]["hand"]
        mask[self.max_hand_size] = len(hand) < self.max_hand_size  # 손패가 꽉 찼으면 드로우 불가

        if not self.state_cache.get("discardPile"):
            mask[: len(hand)] = True
            mask[len(hand) : self.max_hand_size] = False
            return mask

        top_card = self.state_cache["discardPile"][0]
        damage = float(self.state_cache.get("damage", 0))

        for idx in range(self.max_hand_size):
            if idx >= len(hand):
                mask[idx] = False
                continue
            mask[idx] = is_valid_play(hand[idx], top_card, damage)

        return mask

    def _resolve_to_agent_turn(
        self, state: Dict[str, Any]
    ) -> Tuple[Dict[str, Any], np.ndarray]:
        """AI 턴을 서버에서 처리해 에이전트 순서가 올 때까지 대기한다."""

        collapsed_state = state
        while (
            collapsed_state["gameStatus"] == "playing"
            and self._is_ai_turn(collapsed_state)
        ):
            ai_result = self._execute_ai_turn()
            collapsed_state = ai_result["state"]

        observation = self._encode_state(collapsed_state)
        return collapsed_state, observation

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
        action_index = int(action)
        hand = state["players"][0]["hand"]
        if action_index == self.max_hand_size:
            return {"type": "DRAW_CARD", "amount": 1}, True
        if 0 <= action_index < len(hand):
            return {
                "type": "PLAY_CARD",
                "playerIndex": 0,
                "cardIndex": action_index,
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

    def _apply_action(self, action: Dict[str, Any]) -> Dict[str, Any]:
        """PATCH /games/{id}로 액션을 전달한다."""
        if not self.game_id:
            raise RuntimeError("Game session is not initialized.")
        return self._request(
            "patch",
            f"/games/{self.game_id}",
            json={"action": action},
        )

    def _execute_ai_turn(self) -> Dict[str, Any]:
        """POST /games/{id}/ai-turns 엔드포인트를 호출한다."""
        if not self.game_id:
            raise RuntimeError("Game session is not initialized.")
        return self._request("post", f"/games/{self.game_id}/ai-turns")

    def _cleanup_session(self) -> None:
        """기존 게임 세션을 정리한다."""
        if self.game_id:
            try:
                self._request("delete", f"/games/{self.game_id}")
            except requests.HTTPError:
                pass
        self.game_id = None
        self.state_cache = None

    def _is_ai_turn(self, state: Dict[str, Any]) -> bool:
        """현재 턴 플레이어가 AI인지 여부를 반환한다."""
        idx = state.get("currentPlayerIndex", 0)
        players = state.get("players", [])
        if idx < 0 or idx >= len(players):
            return False
        return bool(players[idx].get("isAI"))
