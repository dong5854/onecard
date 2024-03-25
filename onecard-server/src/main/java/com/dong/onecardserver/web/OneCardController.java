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
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RequestMapping("/one-card")
@RestController
public class OneCardController {

    private final OneCardService oneCardService;

    @PostMapping("/rooms")
    public ResponseEntity<CreateOneCardRoomResponseDTO> createRoom(@RequestBody CreateOneCardRoomRequestDTO createOneCardRoomRequestDTO) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(oneCardService.createRoom(createOneCardRoomRequestDTO));
    }

    @MessageMapping("/rooms/{id}/join")
    @SendTo("/topic/rooms/{id}")
    public ResponseEntity<JoinOneCardRoomResponseDTO> joinRoom(@DestinationVariable String id, @RequestBody JoinOneCardRoomRequestDTO joinOneCardRoomRequestDTO, @Header("simpSessionId") String sessionId) {
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(oneCardService.joinRoom(id, joinOneCardRoomRequestDTO.withSessionId(sessionId)));
    }

    // TODO: 참여중인 모든 플레이어에게 send
    @MessageMapping("/rooms/{roodId}/start")
    public ResponseEntity<GameInfoResponseDTO> startPlaying(@DestinationVariable String roomID, @DestinationVariable String playerId) {
        // TODO: /queue/players/{playerID} 로 보내기
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(null);
    }


    @DeleteMapping("/rooms/{id}")
    public ResponseEntity<DeleteOneCardRoomResponseDTO> deleteRoom(@PathVariable String id) {
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(oneCardService.deleteRoom(id));
    }
}
