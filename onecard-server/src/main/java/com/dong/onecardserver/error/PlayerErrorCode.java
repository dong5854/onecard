package com.dong.onecardserver.error;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum PlayerErrorCode implements ErrorCode {
    PLAYER_NOT_FOUND(HttpStatus.NOT_FOUND, "R001", "존재하지 않는 아이디입니다."),
    PLAYER_ID_DUPLICATED(HttpStatus.CONFLICT, "P002", "이미 존재하는 아이디입니다.");

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;
    PlayerErrorCode(HttpStatus httpStatus, String code, String message) {
        this.httpStatus = httpStatus;
        this.code = code;
        this.message = message;
    }
}
