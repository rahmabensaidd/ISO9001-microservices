package com.esprit.microservice.documentservice.services;

import com.esprit.microservice.documentservice.entities.Document;
import com.esprit.microservice.documentservice.entities.TypeDocument;
import com.esprit.microservice.documentservice.entities.Version;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface IDocumentServices {

    // CRUD de base
    Document createDocument(Document document);
    Document updateDocument(Long id, Document document);
    void deleteDocument(Long id);
    Optional<Document> getDocumentById(Long id);
    List<Document> getAllDocuments();

    // Upload manuel de fichier (sans OCR)
    Document uploadAndSummarize(MultipartFile file, String userId, Map<String, Object> config)
            throws IOException, net.sourceforge.tess4j.TesseractException;


    // Recherche
    List<Document> searchDocuments(String keyword);

    // Archivage
    Document archiveDocument(Long id);
    Document unarchiveDocument(Long id);
    List<Document> getArchivedDocuments();

    // Gestion des versions
    Version getDocumentVersion(Long id, Long versionNumber);
    List<Version> getDocumentVersions(Long id);

    // Statistiques
    Map<TypeDocument, Long> getDocumentsByType();
    Map<String, Long> getDocumentsByCategory();
    Map<String, Long> getDocumentsByCreationMonth();
    Double getAverageGrossSalary();
    Map<String, Long> getDocumentsByCreator();
    Map<String, Long> getDocumentsByPeriod(LocalDate startDate, LocalDate endDate);
}
