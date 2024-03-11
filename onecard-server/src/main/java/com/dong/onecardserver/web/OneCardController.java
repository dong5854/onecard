package com.dong.onecardserver.web;

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

    @PostMapping("/room")
    public CreateOneCardRoomResponseDTO createRoom(@RequestBody CreateOneCardRoomRequestDTO createOneCardRoomRequestDTO) {
        return CreateOneCardRoomResponseDTO.builder()
                .id("test-1234")
                .name("테스트 룸")
                .build();
    }
}

