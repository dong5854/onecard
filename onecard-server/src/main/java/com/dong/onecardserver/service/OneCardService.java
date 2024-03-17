package com.dong.onecardserver.service;

import com.dong.onecardserver.domain.onecard.OneCardRoom;
import com.dong.onecardserver.domain.onecard.OneCardRoomRepository;
import com.dong.onecardserver.dto.CreateOneCardRoomRequestDTO;
import com.dong.onecardserver.dto.CreateOneCardRoomResponseDTO;
import com.dong.onecardserver.dto.JoinOneCardRoomRequestDTO;
import com.dong.onecardserver.dto.JoinOneCardRoomResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

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

    public JoinOneCardRoomResponseDTO joinRoom(String id, JoinOneCardRoomRequestDTO joinOneCardRoomRequestDTO) {
        Optional<OneCardRoom> oneCardRoom = oneCardRoomRepository.findById(id);
        // TODO: 찾는 방이 없을 때 예외 로직
        // TODO: 사용자가 가득 찼을 때 예외 로직
        oneCardRoom.get().getPlayers().add(joinOneCardRoomRequestDTO.toPlayer());
        OneCardRoom updatedRoom = oneCardRoomRepository.update(oneCardRoom.get());
        return JoinOneCardRoomResponseDTO
                .builder()
                .id(updatedRoom.getId())
                .name(updatedRoom.getName())
                .build();
    }
}
