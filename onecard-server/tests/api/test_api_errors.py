import pytest


@pytest.mark.asyncio
async def test_apply_action_before_start_returns_400(client):
    created = await client.post("/games", json={})
    game_id = created.json()["id"]

    play = await client.patch(
        f"/games/{game_id}",
        json={"action": {"type": "PLAY_CARD", "playerIndex": 0, "cardIndex": 0}},
    )
    assert play.status_code == 400
    assert "시작" in play.json()["detail"]


@pytest.mark.asyncio
async def test_invalid_action_payload_returns_400(client):
    created = await client.post("/games", json={})
    game_id = created.json()["id"]

    bad = await client.patch(
        f"/games/{game_id}", json={"action": {"type": "DRAW_CARD", "amount": -1}}
    )
    assert bad.status_code in (400, 422)
