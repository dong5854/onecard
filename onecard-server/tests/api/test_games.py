import pytest


@pytest.mark.asyncio
async def test_health(client):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


@pytest.mark.asyncio
async def test_create_and_start_game_flow(client):
    created = await client.post("/games", json={})
    assert created.status_code == 201
    game_id = created.json()["id"]

    start = await client.patch(
        f"/games/{game_id}", json={"action": {"type": "START_GAME"}}
    )
    assert start.status_code == 200
    data = start.json()
    assert data["state"]["gameStatus"] == "playing"

    # Applying a draw without special rules should still succeed while playing.
    draw = await client.patch(
        f"/games/{game_id}", json={"action": {"type": "DRAW_CARD", "amount": 1}}
    )
    assert draw.status_code == 200
    assert draw.json()["state"]["gameStatus"] == "playing"


@pytest.mark.asyncio
async def test_damage_draw_does_not_auto_play(client):
    # create and start game to get discard top card
    created = await client.post("/games", json={})
    game_id = created.json()["id"]
    start = await client.patch(
        f"/games/{game_id}", json={"action": {"type": "START_GAME"}}
    )
    assert start.status_code == 200
    started_state = start.json()["state"]

    # Force a damage situation by applying special effect on top card (reusing apply effect endpoint)
    # Use the top card of discard pile as effect card to ensure mask applies
    # Use a guaranteed damage card (rank 2) to apply special effect
    top_card = {
        "id": "damage-card",
        "isJoker": False,
        "isFlipped": True,
        "rank": 2,
        "suit": "hearts",
    }
    effect = await client.patch(
        f"/games/{game_id}",
        json={
            "action": {
                "type": "APPLY_SPECIAL_EFFECT",
                "effectCard": top_card,
            }
        },
    )
    assert effect.status_code == 200
    damaged_state = effect.json()["state"]
    assert damaged_state["damage"] > 0

    # Move turn to AI (player index 1)
    next_turn = await client.patch(
        f"/games/{game_id}", json={"action": {"type": "NEXT_TURN"}}
    )
    assert next_turn.status_code == 200

    # Trigger AI turn; with damage draw it should draw and end turn without playing a card
    ai_turn = await client.post(f"/games/{game_id}/ai-turns")
    assert ai_turn.status_code == 200
    ai_state = ai_turn.json()["state"]
    assert ai_state["gameStatus"] == "playing"
    # Ensure discard pile unchanged after draw-only AI turn
    assert ai_state["discardPile"][0]["id"] == damaged_state["discardPile"][0]["id"]


@pytest.mark.asyncio
async def test_ai_turn_rejected_when_not_ai_round(client):
    created = await client.post("/games", json={})
    game_id = created.json()["id"]
    await client.patch(f"/games/{game_id}", json={"action": {"type": "START_GAME"}})

    ai_turn = await client.post(f"/games/{game_id}/ai-turns")
    assert ai_turn.status_code == 400
    assert "AI" in ai_turn.json()["detail"]
