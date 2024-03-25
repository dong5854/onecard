package com.dong.onecardserver.web;

import com.dong.onecardserver.dto.JoinAppRequestDTO;
import com.dong.onecardserver.service.PlayerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;

@RequiredArgsConstructor
@Controller
public class PlayerWebSocketHandler {

    private final PlayerService playerService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/players")
    public void joinApp(@RequestBody JoinAppRequestDTO joinAppRequestDTO, @Header("simpSessionId") String sessionId) {
        messagingTemplate.convertAndSend("/queue/player/" + joinAppRequestDTO.playerId(),
                ResponseEntity
                .status(HttpStatus.CREATED)
                .body(playerService.joinApp(joinAppRequestDTO.withSessionId(sessionId))));
    }
}
