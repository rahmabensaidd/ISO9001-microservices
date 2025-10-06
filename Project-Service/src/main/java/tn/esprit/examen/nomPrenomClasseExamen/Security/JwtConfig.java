package tn.esprit.examen.nomPrenomClasseExamen.Security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;

@Configuration
public class JwtConfig {

    private static final Logger logger = LoggerFactory.getLogger(JwtConfig.class);

    @Bean
    public JwtDecoder jwtDecoder() {
        String jwkSetUri = "http://localhost:8080/realms/test/protocol/openid-connect/certs";
        logger.info("Configuring JwtDecoder with JWK Set URI: {}", jwkSetUri);
        try {
            NimbusJwtDecoder decoder = NimbusJwtDecoder.withJwkSetUri(jwkSetUri).build();
            logger.info("JwtDecoder configured successfully");
            return decoder;
        } catch (Exception e) {
            logger.error("Failed to configure JwtDecoder with JWK Set URI: {}", jwkSetUri, e);
            throw new IllegalStateException("Failed to configure JwtDecoder", e);
        }
    }
}