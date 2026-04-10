package com.cpt208.discussionplatform.service;

import java.util.concurrent.TimeUnit;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Service
public class TokenBlacklistService {

    private static final String KEY_PREFIX = "jwt:blacklist:";

    private final StringRedisTemplate stringRedisTemplate;

    public TokenBlacklistService(StringRedisTemplate stringRedisTemplate) {
        this.stringRedisTemplate = stringRedisTemplate;
    }

    public void blacklist(String tokenId, long ttlSeconds) {
        stringRedisTemplate.opsForValue().set(KEY_PREFIX + tokenId, "1", ttlSeconds, TimeUnit.SECONDS);
    }

    public boolean isBlacklisted(String tokenId) {
        return Boolean.TRUE.equals(stringRedisTemplate.hasKey(KEY_PREFIX + tokenId));
    }
}
