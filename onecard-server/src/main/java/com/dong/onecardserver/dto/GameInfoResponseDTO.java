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
    private final ArrayDeque<Player> turnOrder;
    private final Boolean turnDir;
    private final Player curTurn;
    private final Player nextTurn;
    private final List<Card> myHand;
    private final Map<Player, Integer> opponentsRemainingCards;
}
