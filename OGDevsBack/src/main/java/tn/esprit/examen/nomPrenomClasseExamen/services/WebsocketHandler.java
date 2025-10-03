package tn.esprit.examen.nomPrenomClasseExamen.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

import java.security.Principal;
import java.util.Map;

public class WebsocketHandler extends DefaultHandshakeHandler {

    private static final Logger log = LoggerFactory.getLogger(WebsocketHandler.class);

    @Override
    protected Principal determineUser(ServerHttpRequest request, WebSocketHandler wsHandler, Map<String, Object> attributes) {
        log.info("Determining user for WebSocket handshake: {}", request.getURI());

        // First, try to get the user from SecurityContext
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() != null) {
            Object principal = authentication.getPrincipal();
            log.info("Using Authentication principal for WebSocket: {}", principal);

            if (principal instanceof Jwt jwt) {
                String userId = jwt.getSubject();
                log.info("Extracted user ID from JWT: {}", userId);
                if (userId != null) {
                    final String finalUserId = userId; // Create a final copy
                    return new Principal() {
                        @Override
                        public String getName() {
                            return finalUserId; // Use the final copy
                        }
                    };
                }
            } else {
                String userId = principal.toString();
                log.info("Using principal as user ID: {}", userId);
                final String finalUserId = userId; // Create a final copy
                return new Principal() {
                    @Override
                    public String getName() {
                        return finalUserId; // Use the final copy
                    }
                };
            }
        }

        // Fallback: Extract user ID from access_token in query
        String userId = null;
        String query = request.getURI().getQuery();
        if (query != null && query.contains("access_token=")) {
            String token = query.split("access_token=")[1].split("&")[0];
            log.info("Extracted access_token from query: {}", token.substring(0, Math.min(token.length(), 20)) + "...");
            // Note: We can't decode the token here directly without JwtDecoder.
            // Instead, rely on the user-name set by STOMP CONNECT
            userId = (String) attributes.get("user-name");
            log.info("User ID from STOMP CONNECT attributes: {}", userId);
        }

        if (userId == null) {
            log.warn("No user ID found in SecurityContext or query parameters");
            return null;
        }

        final String finalUserId = userId; // Create a final copy
        log.info("Setting WebSocket Principal to user ID: {}", finalUserId);
        return new Principal() {
            @Override
            public String getName() {
                return finalUserId; // Use the final copy
            }
        };
    }
}