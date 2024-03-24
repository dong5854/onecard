package com.dong.onecardserver.service;

import com.dong.onecardserver.domain.onecard.OneCardRoom;
import com.dong.onecardserver.domain.onecard.OneCardRoomRepository;
import com.dong.onecardserver.dto.*;
import com.dong.onecardserver.error.CustomException;
import com.dong.onecardserver.error.OneCardErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@RequiredArgsConstructor
@Service
public class OneCardService {

    private final OneCardRoomRepository oneCardRoomRepository;

    @Transactional
    public CreateOneCardRoomResponseDTO createRoom(CreateOneCardRoomRequestDTO createOneCardRoomRequestDTO) {
        OneCardRoom oneCardRoom = oneCardRoomRepository.save(createOneCardRoomRequestDTO.toDocument());
        joinRoom(oneCardRoom.getId(), new JoinOneCardRoomRequestDTO(createOneCardRoomRequestDTO.adminID()));
        return CreateOneCardRoomResponseDTO
                .builder()
                .id(oneCardRoom.getId())
                .name(oneCardRoom.getName())
                .build();
    }

    public JoinOneCardRoomResponseDTO joinRoom(String id, JoinOneCardRoomRequestDTO joinOneCardRoomRequestDTO) throws CustomException {
        Optional<OneCardRoom> oneCardRoom = oneCardRoomRepository.findById(id);
        if (oneCardRoom.isEmpty())
            throw new CustomException(OneCardErrorCode.ROOM_NOT_FOUND);
        if (oneCardRoom.get().getPlayers().size() >= oneCardRoom.get().getMaxPlayers())
            throw new CustomException(OneCardErrorCode.FULL_ROOM);
        oneCardRoom.get().getPlayers().add(joinOneCardRoomRequestDTO.toPlayer());
        OneCardRoom updatedRoom = oneCardRoomRepository.update(oneCardRoom.get());
        return JoinOneCardRoomResponseDTO
                .builder()
                .id(updatedRoom.getId())
                .name(updatedRoom.getName())
                .build();
    }

    public DeleteOneCardRoomResponseDTO deleteRoom(String id) throws CustomException {
        Optional<OneCardRoom> oneCardRoom = oneCardRoomRepository.findById(id);
        if (oneCardRoom.isEmpty())
            throw new CustomException(OneCardErrorCode.ROOM_NOT_FOUND);
        oneCardRoomRepository.delete(oneCardRoom.get());
        return DeleteOneCardRoomResponseDTO.builder()
                .id(oneCardRoom.get().getId())
                .name(oneCardRoom.get().getName())
                .build();
    }
}
