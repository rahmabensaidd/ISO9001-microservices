package tn.esprit.examen.nomPrenomClasseExamen.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

@Component
public class WebsocketInterceptor implements HandshakeInterceptor {

    private static final Logger log = LoggerFactory.getLogger(WebsocketInterceptor.class);

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
        boolean authorized = isAuthorized(request);
        log.info("WebSocket handshake authorized: {}, for URI: {}", authorized, request.getURI());
        return authorized;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception exception) {
        if (exception != null) {
            log.error("WebSocket handshake failed for URI: {}, exception: {}", request.getURI(), exception.getMessage(), exception);
        } else {
            log.debug("WebSocket handshake completed for URI: {}", request.getURI());
        }
    }

    private boolean isAuthorized(ServerHttpRequest request) {
        // Token validation is handled by WebSocketTokenFilter
        String query = request.getURI().getQuery();
        if (query == null || !query.contains("access_token=")) {
            log.warn("No access_token found in WebSocket handshake query: {}", query);
            return false;
        }
        log.debug("Access_token found in WebSocket handshake query: {}", query);
        return true; // Let WebSocketTokenFilter handle token validation
    }
}