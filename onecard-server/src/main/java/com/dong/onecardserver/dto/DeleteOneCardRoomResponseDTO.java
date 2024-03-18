package com.dong.onecardserver.dto;

import lombok.Builder;

@Builder
public record DeleteOneCardRoomResponseDTO(String id, String name) { }
