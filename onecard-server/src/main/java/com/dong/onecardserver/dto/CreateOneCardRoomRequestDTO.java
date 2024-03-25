package com.dong.onecardserver.dto;

import com.dong.onecardserver.domain.onecard.*;
import lombok.Builder;
import lombok.Getter;
import org.checkerframework.checker.units.qual.C;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.List;

public record CreateOneCardRoomRequestDTO(String name, String adminId) {
    public OneCardRoom toDocument() {
        return OneCardRoom
                .builder()
                .name(this.name)
                .playing(false)
                .maxPlayers(4)
                .adminId(adminId)
                .playerIds(new ArrayList<>())
                .build();
    }
}
