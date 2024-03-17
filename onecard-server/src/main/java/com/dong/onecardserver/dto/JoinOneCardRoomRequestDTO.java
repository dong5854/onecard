package com.dong.onecardserver.dto;

import com.dong.onecardserver.domain.onecard.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.List;

@Getter
@NoArgsConstructor
public class JoinOneCardRoomRequestDTO {
    private String playerID;

    @Builder
    public JoinOneCardRoomRequestDTO(String playerID) {
        this.playerID = playerID;
    }

    public Player toPlayer() {
        return new Player(this.playerID, new ArrayList<>());
    }
}
