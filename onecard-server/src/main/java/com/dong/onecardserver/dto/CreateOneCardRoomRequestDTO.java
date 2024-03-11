package com.dong.onecardserver.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class CreateOneCardRoomRequestDTO {
    private String name;
    @Builder
    public CreateOneCardRoomRequestDTO(String name) {
        this.name = name;
    }
}
