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
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@Controller
public class OneCardWebSocketHandler {

    private final OneCardService oneCardService;

    @MessageMapping("/one-card/rooms/{id}/join")
    @SendTo("/topic/rooms/{id}")
    public ResponseEntity<JoinOneCardRoomResponseDTO> joinRoom(@DestinationVariable String id, @RequestBody JoinOneCardRoomRequestDTO joinOneCardRoomRequestDTO, @Header("simpSessionId") String sessionId) {
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(oneCardService.joinRoom(id, joinOneCardRoomRequestDTO.withSessionId(sessionId)));
    }

    // TODO: 참여중인 모든 플레이어에게 send
    @MessageMapping("/one-card/rooms/{roomId}/start")
    public ResponseEntity<GameInfoResponseDTO> startPlaying(@DestinationVariable String roomId) {
        // TODO: player/queue/{playerID} 로 보내기
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(null);
    }
}
