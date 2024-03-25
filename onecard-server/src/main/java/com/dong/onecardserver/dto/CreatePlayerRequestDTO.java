package com.dong.onecardserver.dto;

import com.dong.onecardserver.domain.player.Player;

public record CreatePlayerRequestDTO(String id) {
    public Player toDocument() {
        return Player.builder()
                .id(id)
                .build();
    }
}
