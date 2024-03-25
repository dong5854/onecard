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

    /**
     * 차례의 순서를 ArrayDeque 안에 playerId 로 저장
     */
    @NonNull
    private ArrayDeque<String> turnOrder;
    @NonNull
    private Boolean turnDir;
    /**
     * True 시, 정방향입니다. False 시 역방향입니다.
     * True : 다음 순서는 turnOrder.pollFirst(), 순서 끝난 후는 turnOrder.addLast()
     * False: 다음 순서는 turnOrder.pollLast(), 순서 끝난 후는 turnOrder.addFirst()
     */
    @NonNull
    private String curTurnPlayerId;
    @NonNull
    private String nextTurnPlayerId;

    @Builder
    public PlayInfo(@NonNull ArrayDeque<Card> deck, @NonNull Card openedCard, @NonNull ArrayDeque<String> turnOrder, @NonNull Boolean turnDir, @NonNull String curTurnPlayerId, @NonNull String nextTurnPlayerId) {
        this.deck = deck;
        this.openedCard = openedCard;
        this.turnOrder = turnOrder;
        this.turnDir = turnDir;
        this.curTurnPlayerId = curTurnPlayerId;
        this.nextTurnPlayerId = nextTurnPlayerId;
    }
}