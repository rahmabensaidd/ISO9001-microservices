package tn.esprit.examen.nomPrenomClasseExamen.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.examen.nomPrenomClasseExamen.services.OcrService;
import tn.esprit.examen.nomPrenomClasseExamen.dto.OcrData;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/ocr")
@CrossOrigin(origins = "http://localhost:4200", methods = {RequestMethod.POST, RequestMethod.OPTIONS}, allowedHeaders = "*")
public class OcrController {

    @Autowired
    private OcrService ocrService;

    @PostMapping("/save")
    public ResponseEntity<Map<String, String>> saveOcrData(@RequestBody OcrData ocrData) {
        try {
            ocrService.saveOcrData(ocrData);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Data saved successfully");
            return ResponseEntity.ok(response); // Retourne {"message": "Data saved successfully"}
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Error during data recording: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse); // Retourne {"message": "Error..."}
        }
    }
}
