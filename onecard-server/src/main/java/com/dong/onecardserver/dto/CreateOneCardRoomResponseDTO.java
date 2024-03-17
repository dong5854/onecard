package com.dong.onecardserver.dto;

import lombok.Builder;
import lombok.Getter;

@Builder
public record CreateOneCardRoomResponseDTO(String id, String name) { }
