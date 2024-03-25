package com.dong.onecardserver.domain.player;

import com.redis.om.spring.repository.RedisEnhancedRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlayerRepository extends RedisEnhancedRepository<Player, String> {
}
