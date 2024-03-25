package com.dong.onecardserver.web;

import com.dong.onecardserver.dto.*;
import com.dong.onecardserver.error.CustomException;
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
@RestController
public class OneCardWebSocketHandler {

    private final OneCardService oneCardService;
    private final SimpMessagingTemplate messagingTemplate;
    private final GlobalExceptionHandler exceptionHandler;

    @MessageMapping("/one-card/rooms/{id}/join")
    public void joinRoom(@DestinationVariable String id, @RequestBody JoinOneCardRoomRequestDTO joinOneCardRoomRequestDTO, @Header("simpSessionId") String sessionId) {
        try {
            messagingTemplate.convertAndSend("/topic/rooms/" + id, ResponseEntity
                    .status(HttpStatus.OK)
                    .body(oneCardService.joinRoom(id, joinOneCardRoomRequestDTO.withSessionId(sessionId))));
        } catch (CustomException ex) {
            messagingTemplate.convertAndSend("/topic/rooms/" + id, exceptionHandler.handleRestException(ex));
        }
    }

    @MessageMapping("/one-card/rooms/{roomId}/start")
    public void startPlaying(@DestinationVariable String roomId) {
        try {
            for (Map.Entry<String, GameInfoResponseDTO> responseDTOEntry : oneCardService.startGame(roomId).entrySet()) {
                System.out.println(responseDTOEntry.getKey());
                messagingTemplate.convertAndSend("/queue/player/" + responseDTOEntry.getKey(), ResponseEntity
                        .status(HttpStatus.OK)
                        .body(responseDTOEntry.getValue()));
            }
        } catch (CustomException ex) {
            messagingTemplate.convertAndSend("/topic/rooms/" + roomId, exceptionHandler.handleRestException(ex));
        }
    }

}
