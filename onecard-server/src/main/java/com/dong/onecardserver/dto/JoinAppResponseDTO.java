package com.dong.onecardserver.dto;

import lombok.Builder;

@Builder
public record JoinAppResponseDTO(String playerId, String sessionId) {
}
