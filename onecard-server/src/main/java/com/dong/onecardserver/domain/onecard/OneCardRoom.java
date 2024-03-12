package com.dong.onecardserver.domain.onecard;

import com.redis.om.spring.annotations.Document;
import com.redis.om.spring.annotations.Indexed;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NonNull;
import org.springframework.data.annotation.Id;

import java.util.*;

@Getter
@AllArgsConstructor
@Document
public class OneCardRoom {

    @Id
    @Indexed
    private String id;
    @Indexed @NonNull
    private String name;

    private int playersCnt;
    @NonNull
    private Player admin;

    private List<Player> players;

    private ArrayDeque<Card> deck;

    private boolean turnDir;
    private ArrayDeque<Player> turnOrder;
    private Player curTurn;

    @Builder
    public OneCardRoom(@NonNull String name, int playersCnt, @NonNull Player admin, List<Player> players, ArrayDeque<Card> deck, boolean turnDir, ArrayDeque<Player> turnOrder, Player curTurn) {
        this.name = name;
        this.playersCnt = playersCnt;
        this.admin = admin;
        this.players = players;
        this.deck = deck;
        this.turnDir = turnDir;
        this.turnOrder = turnOrder;
        this.curTurn = curTurn;
    }
}
