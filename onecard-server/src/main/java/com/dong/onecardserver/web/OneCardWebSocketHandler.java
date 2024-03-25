package com.dong.onecardserver.web;

import com.dong.onecardserver.dto.*;
import com.dong.onecardserver.service.OneCardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RequiredArgsConstructor
@Controller
public class OneCardWebSocketHandler {

    private final OneCardService oneCardService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/one-card/rooms/{id}/join")
    @SendTo("/topic/rooms/{id}")
    public ResponseEntity<JoinOneCardRoomResponseDTO> joinRoom(@DestinationVariable String id, @RequestBody JoinOneCardRoomRequestDTO joinOneCardRoomRequestDTO, @Header("simpSessionId") String sessionId) {
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(oneCardService.joinRoom(id, joinOneCardRoomRequestDTO.withSessionId(sessionId)));
    }

    @MessageMapping("/one-card/rooms/{roomId}/start")
    public void startPlaying(@DestinationVariable String roomId) {
        for (Map.Entry<String, GameInfoResponseDTO> responseDTOEntry : oneCardService.startGame(roomId).entrySet()) {
            messagingTemplate.convertAndSend("/queue/player/" + responseDTOEntry.getKey(), responseDTOEntry.getValue());
        }
    }
}
