package com.dong.onecardserver.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class CreateOneCardRoomResponseDTO {
    private String id;
    private String name;

    @Builder
    public CreateOneCardRoomResponseDTO(String id, String name) {
        this.id = id;
        this.name = name;
    }
}
