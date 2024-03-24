package com.dong.onecardserver.domain.onecard;

import com.redis.om.spring.annotations.Document;
import lombok.Builder;
import lombok.NonNull;

import java.util.ArrayDeque;
@Document
public class PlayInfo {
    @NonNull
    private ArrayDeque<Card> deck;
    /**
     * 공개된 카드
     */
    @NonNull
    private Card openedCard;
    @NonNull
    private ArrayDeque<Player> turnOrder;
    @NonNull
    private Boolean turnDir;
    /**
     * True 시, 정방향입니다. False 시 역방향입니다.
     * True : 다음 순서는 turnOrder.pollFirst(), 순서 끝난 후는 turnOrder.addLast()
     * False: 다음 순서는 turnOrder.pollLast(), 순서 끝난 후는 turnOrder.addFirst()
     */
    @NonNull
    private Player curTurn;
    @NonNull
    private Player nextTurn;

    @Builder
    public PlayInfo(@NonNull ArrayDeque<Card> deck, @NonNull Card openedCard, @NonNull ArrayDeque<Player> turnOrder, @NonNull Boolean turnDir, @NonNull Player curTurn, @NonNull Player nextTurn) {
        this.deck = deck;
        this.openedCard = openedCard;
        this.turnOrder = turnOrder;
        this.turnDir = turnDir;
        this.curTurn = curTurn;
        this.nextTurn = nextTurn;
    }
}
