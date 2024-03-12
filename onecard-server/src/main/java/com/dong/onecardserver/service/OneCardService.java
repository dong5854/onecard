package com.dong.onecardserver.service;

import com.dong.onecardserver.domain.onecard.OneCardRoom;
import com.dong.onecardserver.domain.onecard.OneCardRoomRepository;
import com.dong.onecardserver.dto.CreateOneCardRoomRequestDTO;
import com.dong.onecardserver.dto.CreateOneCardRoomResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class OneCardService {

    private final OneCardRoomRepository oneCardRoomRepository;

    public CreateOneCardRoomResponseDTO createRoom(CreateOneCardRoomRequestDTO createOneCardRoomRequestDTO) {
        OneCardRoom oneCardRoom = oneCardRoomRepository.save(createOneCardRoomRequestDTO.toDocument());
        return CreateOneCardRoomResponseDTO
                .builder()
                .id(oneCardRoom.getId())
                .name(oneCardRoom.getName())
                .build();
    }
}
