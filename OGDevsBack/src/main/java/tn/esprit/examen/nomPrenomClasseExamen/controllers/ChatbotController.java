package com.example.nomPrenomClasseExamen.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.Map;

@RestController
@RequestMapping("/api/chatbot")
public class ChatbotController {

    @Value("${python.executable}")
    private String pythonExecutable;

    @Value("${python.script.path}")
    private String pythonScriptPath;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostMapping("/query")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<?> queryChatbot(@RequestBody QueryRequest queryRequest) {
        try {
            String query = queryRequest.getQuery().replace("\"", "\\\"");
            ProcessBuilder pb = new ProcessBuilder(pythonExecutable, pythonScriptPath, query);
            // Set working directory to the chatbot folder
            pb.directory(new java.io.File("C:/Users/HP/OneDrive/Bureau/4SE4/LastPIProject/OGDev-Coconsult/chatbot"));
            pb.redirectErrorStream(true);
            Process process = pb.start();

            StringBuilder output = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line);
                }
            }

            int exitCode = process.waitFor();
            if (exitCode != 0) {
                return ResponseEntity.status(500).body(Map.of("error", "Python script failed with exit code: " + exitCode));
            }

            Map<String, Object> response = objectMapper.readValue(output.toString(), Map.class);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error executing chatbot: " + e.getMessage()));
        }
    }
}

class QueryRequest {
    private String query;

    public String getQuery() {
        return query;
    }

    public void setQuery(String query) {
        this.query = query;
    }
}
