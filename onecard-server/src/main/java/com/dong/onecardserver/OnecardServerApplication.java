package com.dong.onecardserver;

import com.redis.om.spring.annotations.EnableRedisDocumentRepositories;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@EnableRedisDocumentRepositories
@SpringBootApplication
public class OneCardServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(OneCardServerApplication.class, args);
    }

}
