package com.dong.onecardserver.dto;

import lombok.Builder;

@Builder
public record ErrorResponseDTO(String code, String message) { }
