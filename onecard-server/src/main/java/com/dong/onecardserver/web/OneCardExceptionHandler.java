package com.dong.onecardserver.web;

import com.dong.onecardserver.dto.ErrorResponseDTO;
import com.dong.onecardserver.error.CustomException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class OneCardExceptionHandler {
    @ExceptionHandler(CustomException.class)
    public ResponseEntity<ErrorResponseDTO> handleRoomNotFound(CustomException ex) {
        return ResponseEntity.status(ex.getErrorCode().getHttpStatus())
                .body(ErrorResponseDTO.builder()
                                .code(ex.getErrorCode().getCode())
                                .message(ex.getErrorCode().getMessage())
                                .build());
    }
}
