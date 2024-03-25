package com.dong.onecardserver.dto;

import com.dong.onecardserver.domain.player.Player;

public record JoinOneCardRoomRequestDTO(String playerId, String sessionId) {

    public JoinOneCardRoomRequestDTO withSessionId(String sessionId) {
        return new JoinOneCardRoomRequestDTO(this.playerId, sessionId);
    }
    public Player toPlayer() {
        return Player.builder()
                .id(this.playerId)
                .sessionId(this.sessionId)
                .build();
    }
}
