package tn.esprit.examen.nomPrenomClasseExamen.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import tn.esprit.examen.nomPrenomClasseExamen.services.WebsocketHandler;
import tn.esprit.examen.nomPrenomClasseExamen.services.WebsocketInterceptor;



@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer  {

    @Override
    public void configureMessageBroker(org.springframework.messaging.simp.config.MessageBrokerRegistry config) {
        config.enableSimpleBroker("/room");
        config.setApplicationDestinationPrefixes("/chat");
    }

    @Override
    public void registerStompEndpoints(org.springframework.web.socket.config.annotation.StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOrigins("http://localhost:4200")
                .setHandshakeHandler(new WebsocketHandler())
                .addInterceptors(new WebsocketInterceptor())
                .withSockJS();
    }
}