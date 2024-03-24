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
    private Player admin;
    @NonNull
    private List<Player> players;

    private PlayInfo playInfo;

    @Builder
    public OneCardRoom(@NonNull String name, @NonNull Integer maxPlayers, @NonNull Boolean playing, @NonNull Player admin, @NonNull List<Player> players, PlayInfo playInfo) {
        this.name = name;
        this.maxPlayers = maxPlayers;
        this.playing = playing;
        this.admin = admin;
        this.players = players;
        this.playInfo = playInfo;
    }
}
