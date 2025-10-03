package tn.esprit.examen.nomPrenomClasseExamen.Security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

public class WebSocketTokenFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketTokenFilter.class);
    private final JwtDecoder jwtDecoder;

    public WebSocketTokenFilter(JwtDecoder jwtDecoder) {
        this.jwtDecoder = jwtDecoder;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String path = request.getRequestURI();
        logger.debug("Processing request: {}, Query: {}", path, request.getQueryString());

        if (path.startsWith("/ws")) {
            // Check for token in query parameters
            String token = request.getParameter("access_token");
            if (token == null) {
                // Check for token in Authorization header
                String authHeader = request.getHeader("Authorization");
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    token = authHeader.substring(7);
                }
            }
            logger.debug("Access token: {}", token != null ? token.substring(0, Math.min(token.length(), 20)) + "..." : "missing");

            if (token != null && !token.isEmpty()) {
                try {
                    logger.info("Attempting to decode token...");
                    Jwt jwt = jwtDecoder.decode(token);
                    logger.info("Token decoded successfully: subject={}, claims={}", jwt.getSubject(), jwt.getClaims());

                    List<String> roles = extractRolesFromJwt(jwt);
                    List<SimpleGrantedAuthority> authorities = roles.stream()
                            .map(SimpleGrantedAuthority::new)
                            .collect(Collectors.toList());
                    logger.debug("Authorities extracted: {}", authorities);

                    JwtAuthenticationToken authToken = new JwtAuthenticationToken(jwt, authorities);
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    logger.info("Authentication set in SecurityContext for user: {}", jwt.getSubject());
                } catch (Exception e) {
                    logger.error("Token validation failed: {}", e.getMessage(), e);
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid or expired token");
                    return;
                }
            } else {
                logger.warn("No token provided for WebSocket request");
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Missing access token");
                return;
            }
        } else {
            logger.debug("Not a WebSocket request, proceeding with filter chain");
        }
        filterChain.doFilter(request, response);
    }

    private List<String> extractRolesFromJwt(Jwt jwt) {
        String clientId = "springid";
        var resourceAccess = (java.util.Map<String, java.util.Map<String, List<String>>>) jwt.getClaim("resource_access");
        if (resourceAccess != null && resourceAccess.containsKey(clientId)) {
            List<String> roles = resourceAccess.get(clientId).get("roles");
            if (roles != null) {
                logger.debug("Roles found in resource_access for client {}: {}", clientId, roles);
                return roles.stream().map(role -> "ROLE_" + role).collect(Collectors.toList());
            }
        }
        var realmAccess = (java.util.Map<String, List<String>>) jwt.getClaim("realm_access");
        if (realmAccess != null && realmAccess.containsKey("roles")) {
            List<String> roles = realmAccess.get("roles");
            logger.debug("Roles found in realm_access: {}", roles);
            return roles.stream()
                    .map(role -> "ROLE_" + role)
                    .collect(Collectors.toList());
        }
        logger.warn("No roles found in JWT claims");
        return List.of();
    }
}