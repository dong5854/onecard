package com.dong.onecardserver.web;

import com.dong.onecardserver.dto.*;
import com.dong.onecardserver.service.OneCardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

    @PostMapping("/rooms/{id}/join")
    public ResponseEntity<JoinOneCardRoomResponseDTO> joinRoom(@PathVariable String id, @RequestBody JoinOneCardRoomRequestDTO joinOneCardRoomRequestDTO) {
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(oneCardService.joinRoom(id, joinOneCardRoomRequestDTO));
    }

    @DeleteMapping("/rooms/{id}")
    public ResponseEntity<DeleteOneCardRoomResponseDTO> deleteRoom(@PathVariable String id) {
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(oneCardService.deleteRoom(id));
    }
}

