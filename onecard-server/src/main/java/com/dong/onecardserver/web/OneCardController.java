package com.dong.onecardserver.web;

import com.dong.onecardserver.service.OneCardService;
import com.dong.onecardserver.dto.CreateOneCardRoomRequestDTO;
import com.dong.onecardserver.dto.CreateOneCardRoomResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RequestMapping("/one-card")
@RestController
public class OneCardController {

    private final OneCardService oneCardService;

    @PostMapping("/room")
    public CreateOneCardRoomResponseDTO createRoom(@RequestBody CreateOneCardRoomRequestDTO createOneCardRoomRequestDTO) {
        return oneCardService.createRoom(createOneCardRoomRequestDTO);
    }
}

