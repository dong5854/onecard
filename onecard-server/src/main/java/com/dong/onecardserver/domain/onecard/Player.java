package com.dong.onecardserver.domain.onecard;

import lombok.Builder;

import java.util.*;

@Builder
public record Player(String id, String sessionId, List<Card> hand) {}
