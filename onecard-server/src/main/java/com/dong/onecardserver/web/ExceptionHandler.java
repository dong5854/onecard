package com.dong.onecardserver.web;

import com.dong.onecardserver.dto.ErrorResponseDTO;
import com.dong.onecardserver.error.CustomException;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ExceptionHandler {
    @MessageExceptionHandler(CustomException.class)
    @org.springframework.web.bind.annotation.ExceptionHandler(CustomException.class)
    public ResponseEntity<ErrorResponseDTO> handleRoomNotFound(CustomException ex) {
        return ResponseEntity.status(ex.getErrorCode().getHttpStatus())
                .body(ErrorResponseDTO.builder()
                                .code(ex.getErrorCode().getCode())
                                .message(ex.getErrorCode().getMessage())
                                .build());
    }
}
