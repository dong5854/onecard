package com.dong.onecardserver.service;

import com.dong.onecardserver.domain.onecard.*;
import com.dong.onecardserver.domain.player.Player;
import com.dong.onecardserver.dto.*;
import com.dong.onecardserver.error.CustomException;
import com.dong.onecardserver.error.OneCardErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class OneCardService {

    private final OneCardRoomRepository oneCardRoomRepository;

    @Transactional
    public CreateOneCardRoomResponseDTO createRoom(CreateOneCardRoomRequestDTO createOneCardRoomRequestDTO) {
        OneCardRoom oneCardRoom = oneCardRoomRepository.save(createOneCardRoomRequestDTO.toDocument());
        return CreateOneCardRoomResponseDTO
                .builder()
                .id(oneCardRoom.getId())
                .name(oneCardRoom.getName())
                .build();
    }

    public JoinOneCardRoomResponseDTO joinRoom(String id, JoinOneCardRoomRequestDTO joinOneCardRoomRequestDTO) throws CustomException {
        Optional<OneCardRoom> oneCardRoom = oneCardRoomRepository.findById(id);

        if (oneCardRoom.isEmpty())
            throw new CustomException(OneCardErrorCode.ROOM_NOT_FOUND);
        if (oneCardRoom.get().getPlayerIds().size() >= oneCardRoom.get().getMaxPlayers())
            throw new CustomException(OneCardErrorCode.FULL_ROOM);

        oneCardRoom.get().getPlayerIds().add(joinOneCardRoomRequestDTO.toPlayer().getId());
        OneCardRoom updatedRoom = oneCardRoomRepository.update(oneCardRoom.get());

        return JoinOneCardRoomResponseDTO
                .builder()
                .id(updatedRoom.getId())
                .name(updatedRoom.getName())
                .build();
    }

    public DeleteOneCardRoomResponseDTO deleteRoom(String id) throws CustomException {
        Optional<OneCardRoom> oneCardRoom = oneCardRoomRepository.findById(id);
        if (oneCardRoom.isEmpty())
            throw new CustomException(OneCardErrorCode.ROOM_NOT_FOUND);
        oneCardRoomRepository.delete(oneCardRoom.get());
        return DeleteOneCardRoomResponseDTO.builder()
                .id(oneCardRoom.get().getId())
                .name(oneCardRoom.get().getName())
                .build();
    }

    public Map<String, GameInfoResponseDTO> startGame(String roomId) {
        Optional<OneCardRoom> oneCardRoom = oneCardRoomRepository.findById(roomId);
        if (oneCardRoom.isEmpty())
            throw new CustomException(OneCardErrorCode.ROOM_NOT_FOUND);
        initGameInfo(oneCardRoom.get());
        return serveData(oneCardRoom.get());
    }

    private Map<String, GameInfoResponseDTO> serveData(OneCardRoom oneCardRoom) {
        Map<String, GameInfoResponseDTO> data = new HashMap<>();
        for (String player : oneCardRoom.getPlayerIds()) {
            GameInfoResponseDTO dto = GameInfoResponseDTO
                    .builder()
                    .openedCard(oneCardRoom.getGameInfo().getPlayedCards().peek())
                    .turnOrder(oneCardRoom.getGameInfo().getTurnOrder())
                    .turnDir(oneCardRoom.getGameInfo().getTurnDir())
                    .curTurn(oneCardRoom.getGameInfo().getCurTurnPlayerId())
                    .nextTurn(oneCardRoom.getGameInfo().getNextTurnPlayerId())
                    .myHand(oneCardRoom.getGameInfo().getPlayerHand().get(player))
                    .opponentsRemainingCards(oneCardRoom.getGameInfo().getPlayerHand()
                            .entrySet().stream().collect(Collectors.toMap(
                                    Map.Entry::getKey,
                                    entry -> entry.getValue().size()
                            )))
                    .build();
            data.put(player, dto);
        }
        return data;
    }

    private void initGameInfo(OneCardRoom oneCardRoom) {
        oneCardRoom.updateGameInfo(GameInfo.builder().build());
        initOrder(oneCardRoom);
        initCardSetting(oneCardRoom);
    }

    private void initOrder(OneCardRoom oneCardRoom) {
        ArrayDeque<String> turnOrder = new ArrayDeque<>(oneCardRoom.getPlayerIds());
        if (oneCardRoom.getPlayerIds().size() <= 1)
            throw new CustomException(OneCardErrorCode.NOT_ENOUGH_PLAYERS);
        Boolean turnDir = true;
        String cuTurnPlayerId = Objects.requireNonNull(turnOrder.pollFirst());
        String nextTurnPlayerId = Objects.requireNonNull(turnOrder.peekFirst());
        oneCardRoom.getGameInfo().updateOrderStatus(turnOrder, turnDir, cuTurnPlayerId, nextTurnPlayerId);
    }

    private void initCardSetting(OneCardRoom oneCardRoom) {
        ArrayDeque<Card> deck = initDeck();
        ArrayDeque<Card> playedCards = new ArrayDeque<>();
        playedCards.add(Objects.requireNonNull(deck.pollFirst())); // 카드 한장 오픈
        Map<String, Set<Card>> playHand = new HashMap<>();
        for (String player : oneCardRoom.getPlayerIds()) {
            playHand.put(player, new HashSet<>());
            for (int i = 0; i < 5; i++) {
                playHand.get(player).add(deck.pollFirst());
            }
        }
        oneCardRoom.getGameInfo().updateCardStatus(deck, playedCards, playHand);
    }

    private ArrayDeque<Card> initDeck() {
        int id = 0;
        List<Card> deck = new ArrayList<>();
        for (SUIT suit : SUIT.values()) {
            if (suit.equals(SUIT.JOKER)) continue;
            for (RANK rank : RANK.values()) {
                if (rank.equals(RANK.JOKER)) continue;
                deck.add(new Card(++id, suit, rank));
            }
        }
        deck.add(new Card(++id, SUIT.JOKER, RANK.JOKER));
        Collections.shuffle(deck);
        return new ArrayDeque<>(deck);
    }
}
