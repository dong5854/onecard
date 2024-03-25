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

    private ArrayDeque<Card> initDeck() {
        ArrayDeque<Card> deck = new ArrayDeque<>();
        for (SUIT suit : SUIT.values()) {
            if (suit.equals(SUIT.JOKER)) continue;
            for (RANK rank : RANK.values()) {
                if (rank.equals(RANK.JOKER)) continue;
                deck.add(new Card(suit, rank));
            }
        }
        deck.add(new Card(SUIT.JOKER, RANK.JOKER));
        return deck;
    }
}
