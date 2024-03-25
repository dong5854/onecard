package com.dong.onecardserver.dto;

import lombok.Builder;

@Builder
public record JoinAppRequestDTO(String playerId, String sessionId) {
    public JoinAppRequestDTO withSessionId(String sessionId) {
        return new JoinAppRequestDTO(this.playerId, sessionId);
    }
}
