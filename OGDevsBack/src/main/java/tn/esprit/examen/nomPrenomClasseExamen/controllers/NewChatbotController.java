package tn.esprit.examen.nomPrenomClasseExamen.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.examen.nomPrenomClasseExamen.services.ChatbotService;
import java.util.HashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/new-chatbot")
public class NewChatbotController {

    private static final Logger logger = LoggerFactory.getLogger(NewChatbotController.class);
    private final ChatbotService chatbotService;

    public NewChatbotController(ChatbotService chatbotService) {
        this.chatbotService = chatbotService;
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> getChatbotResponse(@RequestBody Map<String, String> request) {
        logger.info("Received request: {}", request);
        try {
            String message = request.get("message");
            if (message == null || message.trim().isEmpty()) {
                logger.warn("Invalid request: message is null or empty");
                Map<String, String> response = new HashMap<>();
                response.put("response", null);
                response.put("error", "Message is required");
                return ResponseEntity.badRequest().body(response);
            }
            String response = chatbotService.callChatbot(message);
            logger.info("Chatbot response: {}", response);
            Map<String, String> responseMap = new HashMap<>();
            responseMap.put("response", response);
            responseMap.put("error", null);
            return ResponseEntity.ok(responseMap);
        } catch (Exception e) {
            logger.error("Failed to process chatbot request: {}", e.getMessage(), e);
            Map<String, String> response = new HashMap<>();
            response.put("response", null);
            response.put("error", "Internal server error: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}
