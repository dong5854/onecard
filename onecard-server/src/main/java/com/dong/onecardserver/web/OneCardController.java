package com.dong.onecardserver.web;

import com.dong.onecardserver.dto.JoinOneCardRoomRequestDTO;
import com.dong.onecardserver.dto.JoinOneCardRoomResponseDTO;
import com.dong.onecardserver.service.OneCardService;
import com.dong.onecardserver.dto.CreateOneCardRoomRequestDTO;
import com.dong.onecardserver.dto.CreateOneCardRoomResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RequestMapping("/one-card")
@RestController
public class OneCardController {

    private final OneCardService oneCardService;

    @PostMapping("/rooms")
    public CreateOneCardRoomResponseDTO createRoom(@RequestBody CreateOneCardRoomRequestDTO createOneCardRoomRequestDTO) {
        return oneCardService.createRoom(createOneCardRoomRequestDTO);
    }

    @PostMapping("/rooms/{id}/join")
    public JoinOneCardRoomResponseDTO joinRoom(@PathVariable String id, @RequestBody JoinOneCardRoomRequestDTO joinOneCardRoomRequestDTO) {
        return oneCardService.joinRoom(id, joinOneCardRoomRequestDTO);
    }
}

