package com.dong.onecardserver.error;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum OneCardErrorCode implements ErrorCode {
    ROOM_NOT_FOUND(HttpStatus.NOT_FOUND, "R001", "게임 방이 존재하지 않습니다."),
    FULL_ROOM(HttpStatus.BAD_REQUEST, "R002", "게임 방에 사용자가 가득 찼습니다."),
    NOT_ENOUGH_PLAYERS(HttpStatus.BAD_REQUEST, "R003", "게임을 시작하기에 플레이어가 부족합니다.");

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;
    OneCardErrorCode(HttpStatus httpStatus, String code, String message) {
        this.httpStatus = httpStatus;
        this.code = code;
        this.message = message;
    }
}
