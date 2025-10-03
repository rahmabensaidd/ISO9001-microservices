package tn.esprit.examen.nomPrenomClasseExamen.services;

import net.sourceforge.tess4j.TesseractException;
import org.springframework.web.multipart.MultipartFile;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Document;
import tn.esprit.examen.nomPrenomClasseExamen.entities.TypeDocument;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Version;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface IDocumentServices {
    Document createDocument(Document document);
    Document updateDocument(Long id, Document document);
    void deleteDocument(Long id);
    Optional<Document> getDocumentById(Long id);
    List<Document> getAllDocuments();
    Document uploadAndSummarize(MultipartFile file, String userId, Map<String, Object> config) throws IOException, TesseractException;
    List<Document> searchDocuments(String keyword);
    Document archiveDocument(Long id);
    List<Document> getArchivedDocuments();


    Version getDocumentVersion(Long id, Long versionNumber);

    List<Version> getDocumentVersions(Long id);
    // New method for unarchiving
    Document unarchiveDocument(Long id);
    Map<TypeDocument, Long> getDocumentsByType();
    Map<String, Long> getDocumentsByCategory();
    Map<String, Long> getDocumentsByCreationMonth();
    Double getAverageGrossSalary();
    Map<String, Long> getDocumentsByCreator();
    Map<String, Long> getDocumentsByPeriod(LocalDate startDate, LocalDate endDate);

}
