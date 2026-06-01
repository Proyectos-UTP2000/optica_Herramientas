package com.herramientas.optica.security.jwt;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.test.util.ReflectionTestUtils;

class JwtServiceTest {

    @Test
    void generateTokenAcceptsPlainTextSecretWithUnderscoreCharacters() {
        JwtService jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secretKey", "local_dev_secret_with_underscores_1234567890");
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 86_400_000L);

        User user = new User("admin", "123456", List.of());

        String token = jwtService.generateToken(user);

        assertThat(token).isNotBlank();
        assertThat(jwtService.extractUsername(token)).isEqualTo("admin");
    }

    @Test
    void generateTokenKeepsSupportingBase64EncodedSecret() {
        JwtService jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secretKey", "MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=");
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 86_400_000L);

        User user = new User("admin", "123456", List.of());

        String token = jwtService.generateToken(user);

        assertThat(token).isNotBlank();
        assertThat(jwtService.extractUsername(token)).isEqualTo("admin");
    }
}
