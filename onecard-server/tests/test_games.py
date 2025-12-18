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
async def test_ai_turn_rejected_when_not_ai_round(client):
    created = await client.post("/games", json={})
    game_id = created.json()["id"]
    await client.patch(f"/games/{game_id}", json={"action": {"type": "START_GAME"}})

    ai_turn = await client.post(f"/games/{game_id}/ai-turns")
    assert ai_turn.status_code == 400
    assert "AI" in ai_turn.json()["detail"]
