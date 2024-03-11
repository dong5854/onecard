package com.dong.onecardserver.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.keyvalue.core.mapping.context.KeyValueMappingContext;
import org.springframework.data.redis.core.mapping.RedisMappingContext;
import org.springframework.data.redis.core.mapping.RedisPersistentEntity;
import org.springframework.data.redis.core.mapping.RedisPersistentProperty;

@Configuration
public class RedisConfig {

    @Bean
    public KeyValueMappingContext<RedisPersistentEntity<?>, RedisPersistentProperty> keyValueMappingContext() {
        return new RedisMappingContext();
    }
}
