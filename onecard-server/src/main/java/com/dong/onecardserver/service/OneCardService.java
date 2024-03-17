package com.dong.onecardserver.service;

import com.dong.onecardserver.domain.onecard.OneCardRoom;
import com.dong.onecardserver.domain.onecard.OneCardRoomRepository;
import com.dong.onecardserver.dto.CreateOneCardRoomRequestDTO;
import com.dong.onecardserver.dto.CreateOneCardRoomResponseDTO;
import com.dong.onecardserver.dto.JoinOneCardRoomRequestDTO;
import com.dong.onecardserver.dto.JoinOneCardRoomResponseDTO;
import com.dong.onecardserver.error.CustomException;
import com.dong.onecardserver.error.OneCardErrorCode;
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

    public Boolean deleteRoom(String id) throws CustomException {
        Optional<OneCardRoom> oneCardRoom = oneCardRoomRepository.findById(id);
        if (oneCardRoom.isEmpty())
            throw new CustomException(OneCardErrorCode.ROOM_NOT_FOUND);
        oneCardRoomRepository.delete(oneCardRoom.get());
        return true;
    }
}
