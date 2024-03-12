package com.dong.onecardserver.domain.onecard;

import com.redis.om.spring.repository.RedisDocumentRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OneCardRoomRepository extends RedisDocumentRepository<OneCardRoom,String> {

}
