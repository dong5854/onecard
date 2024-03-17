package com.dong.onecardserver.dto;

import lombok.Builder;
import lombok.Getter;

@Builder
public record JoinOneCardRoomResponseDTO(String id, String name) { }
