package com.dong.onecardserver.dto;

import com.dong.onecardserver.domain.onecard.Card;
import com.dong.onecardserver.domain.player.Player;
import lombok.Builder;
import lombok.RequiredArgsConstructor;

import java.util.*;

@Builder
@RequiredArgsConstructor
public class GameInfoResponseDTO {
    private final Card openedCard;
    private final ArrayDeque<String> turnOrder;
    private final Boolean turnDir;
    private final String curTurn;
    private final String nextTurn;
    private final Set<Card> myHand;
    private final Map<String, Integer> opponentsRemainingCards;
}
