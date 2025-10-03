package tn.esprit.examen.nomPrenomClasseExamen.controllers;

import lombok.RequiredArgsConstructor;
import net.sourceforge.tess4j.TesseractException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Document;
import tn.esprit.examen.nomPrenomClasseExamen.entities.TypeDocument;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Version;
import tn.esprit.examen.nomPrenomClasseExamen.services.IDocumentServices;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/documents")
@CrossOrigin(origins = "http://localhost:4200") // Permet les requêtes Angular
public class DocumentRestController {

    private final IDocumentServices documentServices;

    @PostMapping("/createDocument")
    public ResponseEntity<Document> createDocument(@RequestBody Document document) {
        try {
            Document createdDocument = documentServices.createDocument(document);
            return new ResponseEntity<>(createdDocument, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Document> updateDocument(@PathVariable Long id, @RequestBody Document document) {
        try {
            Document updatedDocument = documentServices.updateDocument(id, document);
            return new ResponseEntity<>(updatedDocument, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    @PostMapping("/unarchive/{id}")
    public ResponseEntity<Document> unarchiveDocument(@PathVariable Long id) {
        Document unarchivedDocument = documentServices.unarchiveDocument(id);
        return new ResponseEntity<>(unarchivedDocument, HttpStatus.OK);
    }
    @GetMapping("/getDocument/{id}")
    public ResponseEntity<Document> getDocumentById(@PathVariable Long id) {
        Optional<Document> document = documentServices.getDocumentById(id);
        return document.map(ResponseEntity::ok)
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/getallDocuments")
    public ResponseEntity<List<Document>> getAllDocuments() {
        List<Document> documents = documentServices.getAllDocuments();
        return new ResponseEntity<>(documents, HttpStatus.OK);
    }

    @DeleteMapping("/deleteDocument/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        try {
            documentServices.deleteDocument(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Nouveaux endpoints pour les fonctionnalités supplémentaires

    @GetMapping("/archived")
    public ResponseEntity<List<Document>> getArchivedDocuments() {
        List<Document> archivedDocuments = documentServices.getArchivedDocuments();
        return new ResponseEntity<>(archivedDocuments, HttpStatus.OK);
    }

    @PostMapping("/archive/{id}")
    public ResponseEntity<Document> archiveDocument(@PathVariable Long id) {
        try {
            Document archivedDocument = documentServices.archiveDocument(id);
            return new ResponseEntity<>(archivedDocument, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<Document>> searchDocuments(@RequestParam String keyword) {
        List<Document> documents = documentServices.searchDocuments(keyword);
        return new ResponseEntity<>(documents, HttpStatus.OK);
    }

    @PostMapping("/upload")
    public ResponseEntity<Document> uploadAndSummarize(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "userId", required = false) String userId,
            @RequestParam(value = "config", required = false) Map<String, Object> config)
            throws IOException, TesseractException {
        try {
            Document document = documentServices.uploadAndSummarize(file, userId, config);
            return new ResponseEntity<>(document, HttpStatus.OK);
        } catch (IOException | TesseractException e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{id}/versions")
    public ResponseEntity<List<Version>> getDocumentVersions(@PathVariable Long id) {
        try {
            List<Version> versions = documentServices.getDocumentVersions(id);
            return new ResponseEntity<>(versions, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/{id}/versions/{versionNumber}")
    public ResponseEntity<Version> getDocumentVersion(@PathVariable Long id, @PathVariable Long versionNumber) {
        try {
            Version version = documentServices.getDocumentVersion(id, versionNumber);
            return new ResponseEntity<>(version, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    @GetMapping("/stats/by-type")
    public ResponseEntity<Map<TypeDocument, Long>> getDocumentsByType() {
        return new ResponseEntity<>(documentServices.getDocumentsByType(), HttpStatus.OK);
    }

    // Statistiques : Documents par catégorie
    @GetMapping("/stats/by-category")
    public ResponseEntity<Map<String, Long>> getDocumentsByCategory() {
        return new ResponseEntity<>(documentServices.getDocumentsByCategory(), HttpStatus.OK);
    }

    // Statistiques : Documents par mois de création
    @GetMapping("/stats/by-creation-month")
    public ResponseEntity<Map<String, Long>> getDocumentsByCreationMonth() {
        return new ResponseEntity<>(documentServices.getDocumentsByCreationMonth(), HttpStatus.OK);
    }

    // Statistiques : Moyenne des salaires bruts
    @GetMapping("/stats/average-gross-salary")
    public ResponseEntity<Double> getAverageGrossSalary() {
        return new ResponseEntity<>(documentServices.getAverageGrossSalary(), HttpStatus.OK);
    }

    // Statistiques : Documents par créateur
    @GetMapping("/stats/by-creator")
    public ResponseEntity<Map<String, Long>> getDocumentsByCreator() {
        return new ResponseEntity<>(documentServices.getDocumentsByCreator(), HttpStatus.OK);
    }

    // Statistiques : Documents par période
    @GetMapping("/stats/by-period")
    public ResponseEntity<Map<String, Long>> getDocumentsByPeriod(
            @RequestParam("startDate") String startDate,
            @RequestParam("endDate") String endDate) {
        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);
        return new ResponseEntity<>(documentServices.getDocumentsByPeriod(start, end), HttpStatus.OK);
    }
}
