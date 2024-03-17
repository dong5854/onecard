package com.dong.onecardserver.dto;

import com.dong.onecardserver.domain.onecard.*;
import lombok.Builder;
import lombok.Getter;

import java.util.ArrayList;

@Builder
public record JoinOneCardRoomRequestDTO(String playerID) {
    public Player toPlayer() {
        return new Player(this.playerID, new ArrayList<>());
    }
}
