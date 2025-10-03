package tn.esprit.examen.nomPrenomClasseExamen.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AiSuggestionService {

    @Value("${gemini.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public List<String> suggest(String nonConformityText) {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=" + apiKey;

        String promptText = "Voici le texte extrait d'un fichier d'audit contenant une non-conformité et sa cause racine :\n\n" +
                nonConformityText +
                "\n\nTu dois analyser la cause de non-conformité et proposer EXACTEMENT deux actions correctives précises, réalistes et numérotées (1. et 2.). Utilise le format suivant : '1. [Première action]' et '2. [Seconde action]'. Si tu ne peux identifier qu'une seule action, répète-la comme '2.' ou ajoute '2. Effectuer un suivi régulier pour vérifier l'efficacité des actions.' :";

        // Préparation du body JSON pour Gemini
        Map<String, Object> part = new HashMap<>();
        part.put("text", promptText);

        List<Map<String, Object>> parts = Collections.singletonList(part);

        Map<String, Object> content = new HashMap<>();
        content.put("parts", parts);

        List<Map<String, Object>> contents = Collections.singletonList(content);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", contents);

        // Configuration de génération (réduire la température pour plus de précision)
        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("temperature", 0.4); // Réduit la créativité pour respecter le format
        generationConfig.put("maxOutputTokens", 250); // Augmente légèrement pour s'assurer d'avoir deux lignes
        requestBody.put("generationConfig", generationConfig);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map body = response.getBody();
                List<Map> candidates = (List<Map>) body.get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map candidate = candidates.get(0);
                    Map contentResp = (Map) candidate.get("content");
                    List<Map> partsResp = (List<Map>) contentResp.get("parts");
                    if (partsResp != null && !partsResp.isEmpty()) {
                        String text = (String) partsResp.get(0).get("text");
                        System.out.println("Texte brut retourné par Gemini : " + text); // Débogage
                        // Extraction des suggestions numérotées
                        List<String> suggestions = Arrays.stream(text.split("\n"))
                                .filter(s -> !s.isBlank() && s.matches("^\\d+\\..*"))
                                .map(String::trim)
                                .collect(Collectors.toList());

                        // Assurer exactement 2 suggestions
                        if (suggestions.size() < 2) {
                            if (suggestions.isEmpty()) {
                                suggestions.add("1. Proposer une solution basée sur la cause identifiée.");
                                suggestions.add("2. Effectuer un suivi régulier pour vérifier l'efficacité des actions.");
                            } else {
                                suggestions.add("2. " + (suggestions.get(0).replace("1.", "2.") + " (répété)")); // Répéter avec ajustement
                            }
                        } else if (suggestions.size() > 2) {
                            suggestions = suggestions.subList(0, 2); // Limiter à 2
                        }

                        return suggestions;
                    }
                }
            }
            throw new RuntimeException("Réponse invalide de l'API Gemini");
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de l'appel à l'API Gemini : " + e.getMessage(), e);
        }
    }
}