package com.dong.onecardserver.web;

import com.dong.onecardserver.dto.CreatePlayerRequestDTO;
import com.dong.onecardserver.dto.CreatePlayerResponseDTO;
import com.dong.onecardserver.dto.JoinAppRequestDTO;
import com.dong.onecardserver.dto.JoinAppResponseDTO;
import com.dong.onecardserver.service.PlayerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RequestMapping("/players")
@RestController
public class PlayerController {

    private final PlayerService playerService;
    private final SimpMessagingTemplate messagingTemplate;

    @PostMapping
    public ResponseEntity<CreatePlayerResponseDTO> createPlayer(@RequestBody CreatePlayerRequestDTO createOneCardRoomRequestDTO) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(playerService.createPlayer(createOneCardRoomRequestDTO));
    }

    @MessageMapping("/players")
    public void joinApp(@RequestBody JoinAppRequestDTO joinAppRequestDTO, @Header("simpSessionId") String sessionId) {
        messagingTemplate.convertAndSend("/queue/player/" + joinAppRequestDTO.playerId(),
                ResponseEntity
                .status(HttpStatus.CREATED)
                .body(playerService.joinApp(joinAppRequestDTO.withSessionId(sessionId))));
    }
}
