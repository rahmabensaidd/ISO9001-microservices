package tn.esprit.examen.nomPrenomClasseExamen.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class ChatbotService {

    private static final Logger logger = LoggerFactory.getLogger(ChatbotService.class);

    @Value("${openrouter.api.url:https://openrouter.ai/api/v1/chat/completions}")
    private String apiUrl;

    @Value("${openrouter.api.key:}")
    private String apiKey;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public ChatbotService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
        this.objectMapper = new ObjectMapper();
    }

    public String callChatbot(String message) {
        logger.info("Calling OpenRouter API with message: {}", message);
        try {
            if (apiKey.isEmpty()) {
                logger.error("OpenRouter API key is not configured");
                throw new IllegalStateException("OpenRouter API key is not configured");
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);

            // Enhanced prompt to enforce conversational or code response
            String prompt;
            if (message.matches("(?i).*\\b(code|program|python|algorithm|function|script)\\b.*")) {
                prompt = "Provide a concise Python code solution for the query, with minimal explanation: " + message;
            } else {
                prompt = "Respond concisely and conversationally to the query, without any code or technical examples unless explicitly requested. Keep the response short and professional: " + message;
            }

            String requestBody = String.format(
                    "{\"model\": \"deepseek/deepseek-prover-v2:free\", \"messages\": [{\"role\": \"user\", \"content\": \"%s\"}]}",
                    prompt.replace("\"", "\\\"")
            );

            HttpEntity<String> request = new HttpEntity<>(requestBody, headers);
            String rawResponse = restTemplate.postForObject(apiUrl, request, String.class);

            // Log raw response for debugging
            logger.debug("Raw OpenRouter response: {}", rawResponse);

            // Parse JSON response
            JsonNode responseJson = objectMapper.readTree(rawResponse);
            String responseContent = responseJson.path("choices").path(0).path("message").path("content").asText("No content returned");

            // Clean whitespace
            responseContent = responseContent.trim();

            // Trim verbose text for non-code queries
            if (!message.matches("(?i).*\\b(code|program|python|algorithm|function|script)\\b.*")) {
                responseContent = responseContent.split("\\.")[0] + ".";
            }

            logger.info("Processed OpenRouter response: {}", responseContent);
            return responseContent.isEmpty() ? "No response from chatbot" : responseContent;

        } catch (Exception e) {
            logger.error("OpenRouter API call failed: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to call OpenRouter API: " + e.getMessage(), e);
        }
    }
}
