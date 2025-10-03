package tn.epac.Gateway_service.Config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    private static final Logger LOGGER = LoggerFactory.getLogger(SecurityConfig.class);

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        LOGGER.info("Configuring SecurityWebFilterChain");
        http
                .cors(cors -> cors.disable()) // Disable default CORS, rely on CorsWebFilter
                .authorizeExchange(exchanges -> exchanges
                        .pathMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .pathMatchers("/swagger-ui.html", "/v3/api-docs/**", "/webjars/**",
                                "/products/v3/api-docs/**", "/user/v3/api-docs/**",
                                "/shipping/v3/api-docs/**","/orders/v3/api-docs/**","/billing/v3/api-docs/**").permitAll()
                        .pathMatchers("/actuator/**").permitAll()
                        .pathMatchers("/order-service/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_CLIENT")
                        .pathMatchers("/billing-service/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_CLIENT")
                        .pathMatchers("/user-service/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_CLIENT")
                        .pathMatchers("/product-service/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_CLIENT")
                        .pathMatchers("/shipping-service/**").hasAuthority("ROLE_ADMIN")
                        .anyExchange().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt
                                .jwtAuthenticationConverter(jwtAuthenticationConverter())
                        )
                );
        return http.build();
    }

    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE)
    public CorsWebFilter corsWebFilter() {
        LOGGER.info("Configuring CorsWebFilter");
        CorsConfiguration config = new CorsConfiguration();
        config.addAllowedOrigin("http://localhost:4200");
        config.setAllowCredentials(true);
        config.addAllowedMethod("*");
        config.addAllowedHeader("*");
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return new CorsWebFilter(source) {
            @Override
            public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
                LOGGER.info("CORS filter start - Request: {} {}", exchange.getRequest().getMethod(), exchange.getRequest().getURI());
                LOGGER.debug("CORS request headers: {}", exchange.getRequest().getHeaders());
                return super.filter(exchange, chain)
                        .doOnSuccess(v -> {
                            ServerHttpResponse response = exchange.getResponse();
                            LOGGER.info("CORS filter success - Response headers for {}: {}", exchange.getRequest().getURI(), response.getHeaders());
                        })
                        .doOnError(error -> {
                            LOGGER.error("CORS filter error for {}: {}", exchange.getRequest().getURI(), error.getMessage(), error);
                        })
                        .doFinally(signalType -> LOGGER.info("CORS filter done with signal: {}", signalType));
            }
        };
    }

    @Bean
    public org.springframework.core.convert.converter.Converter<Jwt, Mono<JwtAuthenticationToken>> jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            List<GrantedAuthority> authorities = new ArrayList<>();
            Map<String, Object> realmAccess = jwt.getClaimAsMap("realm_access");
            LOGGER.info("Extracting roles from JWT claim 'realm_access': {}", realmAccess);
            if (realmAccess != null && realmAccess.containsKey("roles")) {
                List<String> roles = (List<String>) realmAccess.get("roles");
                authorities.addAll(roles.stream()
                        .map(role -> {
                            String finalRole = role.startsWith("ROLE_") ? role : "ROLE_" + role;
                            LOGGER.info("Mapping JWT role: {}", finalRole);
                            return new SimpleGrantedAuthority(finalRole);
                        })
                        .collect(Collectors.toList()));
            }
            LOGGER.info("Granted authorities after mapping: {}", authorities);
            return authorities;
        });
        return jwt -> {
            JwtAuthenticationToken token = (JwtAuthenticationToken) converter.convert(jwt);
            LOGGER.info("JWT Authentication Token created with authorities: {}", token.getAuthorities());
            return Mono.just(token);
        };
    }

    @Bean
    public GlobalFilter tokenRelayFilter() {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            LOGGER.info("TokenRelayFilter start - Request: {} {}", request.getMethod(), request.getURI());
            LOGGER.debug("TokenRelayFilter - Request headers: {}", request.getHeaders());

            String authHeader = request.getHeaders().getFirst("Authorization");
            if (authHeader != null) {
                LOGGER.debug("TokenRelayFilter - Forwarding Authorization header: {}", authHeader);
                ServerHttpRequest modifiedRequest = request.mutate()
                        .header("Authorization", authHeader)
                        .build();

                return chain.filter(exchange.mutate().request(modifiedRequest).build())
                        .doOnSuccess(v -> {
                            LOGGER.info("TokenRelayFilter success - Response headers for {}: {}", request.getURI(), exchange.getResponse().getHeaders());
                        })
                        .doOnError(error -> {
                            LOGGER.error("TokenRelayFilter error processing request {}: {}", request.getURI(), error.getMessage(), error);
                        })
                        .doFinally(signalType -> LOGGER.info("TokenRelayFilter done with signal: {}", signalType));
            } else {
                LOGGER.debug("TokenRelayFilter - No Authorization header found");
                return chain.filter(exchange)
                        .doOnSuccess(v -> {
                            LOGGER.info("TokenRelayFilter success (no auth) - Response headers for {}: {}", request.getURI(), exchange.getResponse().getHeaders());
                        })
                        .doOnError(error -> {
                            LOGGER.error("TokenRelayFilter error (no auth) processing request {}: {}", request.getURI(), error.getMessage(), error);
                        })
                        .doFinally(signalType -> LOGGER.info("TokenRelayFilter done (no auth) with signal: {}", signalType));
            }
        };
    }
}
