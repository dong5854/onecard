package com.dong.onecardserver.domain.player;

import com.redis.om.spring.annotations.Document;
import com.redis.om.spring.annotations.Indexed;
import lombok.Builder;
import lombok.Getter;
import org.springframework.data.annotation.Id;


@Builder @Getter
@Document
public class Player {
    @Id
    private String id;
    @Indexed
    String sessionId;

    public void updateSessionId (String sessionId){
        this.sessionId = sessionId;
    }
}
