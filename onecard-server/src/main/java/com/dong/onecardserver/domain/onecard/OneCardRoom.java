package com.dong.onecardserver.domain.onecard;

import com.redis.om.spring.annotations.Document;
import com.redis.om.spring.annotations.Indexed;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NonNull;
import org.springframework.data.annotation.Id;

import java.util.*;

@Getter
@AllArgsConstructor
@Document
public class OneCardRoom {

    @Id
    @Indexed
    private String id;
    @Indexed @NonNull
    private String name;
    @NonNull
    private Integer maxPlayers;
    @NonNull
    private Boolean playing;
    @NonNull
    private String adminId;
    @NonNull
    private List<String> playerIds;

    private GameInfo gameInfo;

    @Builder
    public OneCardRoom(@NonNull String name, @NonNull Integer maxPlayers, @NonNull Boolean playing, @NonNull String adminId, @NonNull List<String> playerIds, GameInfo gameInfo) {
        this.name = name;
        this.maxPlayers = maxPlayers;
        this.playing = playing;
        this.adminId = adminId;
        this.playerIds = playerIds;
        this.gameInfo = gameInfo;
    }

    public void updateGameInfo(GameInfo gameInfo) {
        this.gameInfo = gameInfo;
    }
}
