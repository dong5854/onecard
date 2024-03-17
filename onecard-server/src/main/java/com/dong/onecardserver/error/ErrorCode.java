package com.dong.onecardserver.error;

import org.springframework.http.HttpStatusCode;

public interface ErrorCode {
    HttpStatusCode getHttpStatus();
    String getCode();
    String getMessage();
}
