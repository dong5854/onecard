package com.dong.onecardserver.service;

import com.dong.onecardserver.domain.player.Player;
import com.dong.onecardserver.domain.player.PlayerRepository;
import com.dong.onecardserver.dto.CreatePlayerRequestDTO;
import com.dong.onecardserver.dto.CreatePlayerResponseDTO;
import com.dong.onecardserver.dto.JoinAppRequestDTO;
import com.dong.onecardserver.dto.JoinAppResponseDTO;
import com.dong.onecardserver.error.CustomException;
import com.dong.onecardserver.error.PlayerErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@RequiredArgsConstructor
@Service
public class PlayerService {
    private final PlayerRepository playerRepository;

    public CreatePlayerResponseDTO createPlayer(CreatePlayerRequestDTO createPlayerRequestDTO) {
        if (playerRepository.findById(createPlayerRequestDTO.id()).isPresent())
            throw new CustomException(PlayerErrorCode.PLAYER_ID_DUPLICATED);

        Player player = playerRepository.save(createPlayerRequestDTO.toDocument());
        return new CreatePlayerResponseDTO(player.getId());
    }

    public JoinAppResponseDTO joinApp(JoinAppRequestDTO joinAppRequestDTO) {
        Optional<Player> player = playerRepository.findById(joinAppRequestDTO.playerId());
        if (player.isEmpty())
            throw new CustomException(PlayerErrorCode.PLAYER_NOT_FOUND);

        player.get().updateSessionId(joinAppRequestDTO.sessionId());
        Player updated = playerRepository.save(player.get());
        return JoinAppResponseDTO.builder()
                .playerId(updated.getId())
                .sessionId(updated.getSessionId())
                .build();
    }
}
