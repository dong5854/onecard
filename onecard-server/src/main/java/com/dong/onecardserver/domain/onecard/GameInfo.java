package com.dong.onecardserver.domain.onecard;

import com.redis.om.spring.annotations.Document;
import lombok.Builder;
import lombok.Getter;
import lombok.NonNull;
import org.springframework.boot.context.properties.bind.DefaultValue;

import java.util.*;

@Getter
@Document
public class GameInfo {

    private ArrayDeque<Card> deck;
    private ArrayDeque<Card> playedCards;
    private Map<String, Set<Card>> playerHand;
    /**
     * 차례의 순서를 ArrayDeque 안에 playerId 로 저장
     */
    private ArrayDeque<String> turnOrder;
    private Boolean turnDir;
    /**
     * True 시, 정방향입니다. False 시 역방향입니다.
     * True : 다음 순서는 turnOrder.pollFirst(), 순서 끝난 후는 turnOrder.addLast()
     * False: 다음 순서는 turnOrder.pollLast(), 순서 끝난 후는 turnOrder.addFirst()
     */
    private String curTurnPlayerId;
    private String nextTurnPlayerId;

    @Builder
    public GameInfo(ArrayDeque<Card> deck, ArrayDeque<Card> playedCards, Map<String, Set<Card>> playerHand, ArrayDeque<String> turnOrder, Boolean turnDir, String curTurnPlayerId, String nextTurnPlayerId) {
        this.deck = deck;
        this.playedCards = playedCards;
        this.playerHand = playerHand;
        this.turnOrder = turnOrder;
        this.turnDir = turnDir;
        this.curTurnPlayerId = curTurnPlayerId;
        this.nextTurnPlayerId = nextTurnPlayerId;
    }

    public void updateOrderStatus(@NonNull ArrayDeque<String> turnOrder,@NonNull Boolean turnDir,@NonNull String curTurnPlayerId,@NonNull String nextTurnPlayerId) {
        this.turnOrder = turnOrder;
        this.turnDir = turnDir;
        this.curTurnPlayerId = curTurnPlayerId;
        this.nextTurnPlayerId =nextTurnPlayerId;
    }

    public void updateCardStatus(ArrayDeque<Card> deck, ArrayDeque<Card> playedCards, Map<String, Set<Card>> playerHand) {
        this.deck = deck;
        this.playedCards = playedCards;
        this.playerHand = playerHand;
    }
}
