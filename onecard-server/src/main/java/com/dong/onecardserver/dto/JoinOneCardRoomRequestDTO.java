package com.dong.onecardserver.dto;

import com.dong.onecardserver.domain.onecard.*;
import lombok.Builder;

import java.util.ArrayList;

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
