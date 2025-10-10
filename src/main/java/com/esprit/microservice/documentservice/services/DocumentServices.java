package com.esprit.microservice.documentservice.services;

import com.esprit.microservice.documentservice.entities.Document;
import com.esprit.microservice.documentservice.entities.TypeDocument;
import com.esprit.microservice.documentservice.entities.Version;
import com.esprit.microservice.documentservice.repositories.DocumentationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.awt.image.BufferedImage;
import javax.imageio.ImageIO;
import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@RequiredArgsConstructor
@Service
public class DocumentServices implements IDocumentServices {

    private final DocumentationRepository documentRepository;
    private final VersionServices versionServices;

    private static final String UPLOAD_DIR = "C:\\Uploads\\";
    private static final String TESSDATA_PATH;

    // Initialisation du dossier d’upload et du répertoire Tesseract
    static {
        String tessdataPrefix = System.getenv("TESSDATA_PREFIX");
        if (tessdataPrefix != null && !tessdataPrefix.isEmpty()) {
            TESSDATA_PATH = tessdataPrefix;
            log.info("Using TESSDATA_PREFIX from environment: {}", TESSDATA_PATH);
        } else {
            try {
                Path tempDir = Files.createTempDirectory("tessdata");
                Path tessdataDir = tempDir.resolve("tessdata");
                Files.createDirectory(tessdataDir);
                ClassPathResource resource = new ClassPathResource("tessdata/eng.traineddata");
                if (resource.exists()) {
                    Files.copy(resource.getInputStream(), tessdataDir.resolve("eng.traineddata"));
                    TESSDATA_PATH = tessdataDir.toString();
                    log.info("Extracted tessdata to temporary directory: {}", TESSDATA_PATH);
                } else {
                    throw new RuntimeException("eng.traineddata not found in src/main/resources/tessdata");
                }
            } catch (IOException e) {
                log.error("Failed to initialize tessdata directory", e);
                throw new RuntimeException("Failed to initialize tessdata directory", e);
            }
        }

        File uploadDir = new File(UPLOAD_DIR);
        if (!uploadDir.exists() && !uploadDir.mkdirs()) {
            log.error("Échec de la création du dossier d'upload : {}", UPLOAD_DIR);
        } else {
            log.info("Dossier d'upload initialisé : {}", UPLOAD_DIR);
        }
    }

    // ──────────────────────────────── CRUD ────────────────────────────────

    @Override
    public Document createDocument(Document document) {
        validateDocument(document);
        document.setDateCreation(LocalDate.now());
        if (document.getCategory() == null) {
            document.setCategory("Files");
        }

        log.info("Création du document : {}", document.getTitle());
        Document savedDocument = documentRepository.save(document);

        Version version = new Version();
        version.setDocument(savedDocument);
        version.setContenu(savedDocument.getContent());
        version.setModifiePar(savedDocument.getCreatedById() != null ? savedDocument.getCreatedById() : "Système");
        version.setModificationDetails("Document créé");
        versionServices.createVersion(version);

        return savedDocument;
    }

    @Override
    public Document updateDocument(Long id, Document document) {
        Document existingDocument = documentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Document non trouvé avec l'ID : " + id));

        document.setId(id);
        document.setDateCreation(LocalDate.now());
        if (document.getCategory() == null)
            document.setCategory(existingDocument.getCategory());

        Version newVersion = new Version();
        newVersion.setDocument(existingDocument);
        newVersion.setContenu(document.getContent());
        newVersion.setModifiePar(document.getCreatedById() != null ? document.getCreatedById() : "Système");
        newVersion.setModificationDetails("Mise à jour du document");
        versionServices.createVersion(newVersion);

        return documentRepository.save(document);
    }

    @Override
    public void deleteDocument(Long id) {
        if (!documentRepository.existsById(id))
            throw new IllegalArgumentException("Document avec l'ID " + id + " n'existe pas.");

        log.info("Suppression du document ID : {}", id);
        documentRepository.deleteById(id);
    }

    @Override
    public Optional<Document> getDocumentById(Long id) {
        return documentRepository.findById(id);
    }

    @Override
    public List<Document> getAllDocuments() {
        return documentRepository.findAll()
                .stream()
                .filter(doc -> !"Archive".equals(doc.getCategory()))
                .collect(Collectors.toList());
    }

    // ──────────────────────────────── ARCHIVE ────────────────────────────────

    @Override
    public Document archiveDocument(Long id) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Document non trouvé avec l'ID : " + id));

        document.setCategory("Archive");
        Version v = new Version();
        v.setDocument(document);
        v.setContenu(document.getContent());
        v.setModifiePar(document.getCreatedById() != null ? document.getCreatedById() : "Système");
        v.setModificationDetails("Document archivé");
        versionServices.createVersion(v);

        return documentRepository.save(document);
    }

    @Override
    public Document unarchiveDocument(Long id) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Document non trouvé avec l'ID : " + id));
        document.setCategory("Files");

        Version v = new Version();
        v.setDocument(document);
        v.setContenu(document.getContent());
        v.setModifiePar(document.getCreatedById() != null ? document.getCreatedById() : "Système");
        v.setModificationDetails("Document désarchivé");
        versionServices.createVersion(v);

        return documentRepository.save(document);
    }

    @Override
    public List<Document> getArchivedDocuments() {
        return documentRepository.findByCategory("Archive");
    }

    // ──────────────────────────────── OCR & UPLOAD ────────────────────────────────

    @Override
    public Document uploadAndSummarize(MultipartFile file, String userId, Map<String, Object> config)
            throws IOException, TesseractException {

        if (file == null || file.isEmpty())
            throw new IllegalArgumentException("Fichier vide ou null.");

        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath))
            Files.createDirectories(uploadPath);

        Path filePath = uploadPath.resolve(System.currentTimeMillis() + "_" + file.getOriginalFilename());
        File tempFile = filePath.toFile();
        file.transferTo(tempFile);

        String extractedText = extractTextFromFile(tempFile, file.getContentType());
        Document document = new Document();
        document.setTitle(file.getOriginalFilename());
        document.setContent(extractedText);
        document.setDateCreation(LocalDate.now());
        document.setCategory("Files");
        document.setCreatedById(userId);

        Document savedDoc = documentRepository.save(document);

        Version version = new Version();
        version.setDocument(savedDoc);
        version.setContenu(extractedText);
        version.setModifiePar(userId != null ? userId : "Système");
        version.setModificationDetails("Créé via upload");
        versionServices.createVersion(version);

        Files.deleteIfExists(filePath);
        return savedDoc;
    }

    private String extractTextFromFile(File file, String contentType) throws IOException, TesseractException {
        if ("application/pdf".equals(contentType)) {
            try (PDDocument pdf = PDDocument.load(file)) {
                PDFTextStripper stripper = new PDFTextStripper();
                String text = stripper.getText(pdf);
                if (text != null && !text.trim().isEmpty())
                    return text;

                PDFRenderer renderer = new PDFRenderer(pdf);
                StringBuilder result = new StringBuilder();
                Tesseract tesseract = new Tesseract();
                tesseract.setDatapath(TESSDATA_PATH);
                tesseract.setLanguage("eng");

                for (int i = 0; i < pdf.getNumberOfPages(); i++) {
                    BufferedImage image = renderer.renderImageWithDPI(i, 300);
                    result.append(tesseract.doOCR(image));
                }
                return result.toString();
            }
        } else {
            BufferedImage image = ImageIO.read(file);
            Tesseract tesseract = new Tesseract();
            tesseract.setDatapath(TESSDATA_PATH);
            tesseract.setLanguage("eng");
            return tesseract.doOCR(image);
        }
    }

    // ──────────────────────────────── VALIDATION ────────────────────────────────

    private void validateDocument(Document document) {
        if (document.getTitle() == null || document.getTitle().isEmpty())
            throw new IllegalArgumentException("Le titre du document est requis.");
    }

    // ──────────────────────────────── STATISTIQUES ────────────────────────────────

    public Map<TypeDocument, Long> getDocumentsByType() {
        return documentRepository.countDocumentsByType()
                .stream()
                .collect(Collectors.toMap(
                        row -> (TypeDocument) row[0],
                        row -> (Long) row[1]
                ));
    }

    public Map<String, Long> getDocumentsByCategory() {
        return documentRepository.countDocumentsByCategory()
                .stream()
                .collect(Collectors.toMap(
                        row -> (String) row[0],
                        row -> (Long) row[1]
                ));
    }

    public Map<String, Long> getDocumentsByCreationMonth() {
        return documentRepository.countDocumentsByCreationMonth()
                .stream()
                .collect(Collectors.toMap(
                        row -> (String) row[0],
                        row -> (Long) row[1]
                ));
    }

    public Double getAverageGrossSalary() {
        Double avg = documentRepository.findAverageGrossSalaryByType(TypeDocument.FICHE_PAIE);
        return avg != null ? avg : 0.0;
    }

    public Map<String, Long> getDocumentsByCreator() {
        return documentRepository.countDocumentsByCreator()
                .stream()
                .collect(Collectors.toMap(
                        row -> (String) row[0],
                        row -> (Long) row[1]
                ));
    }

    public Map<String, Long> getDocumentsByPeriod(LocalDate startDate, LocalDate endDate) {
        List<Document> documents = documentRepository.findByDateCreationBetween(startDate, endDate);
        return documents.stream()
                .collect(Collectors.groupingBy(
                        d -> d.getDateCreation().toString(),
                        Collectors.counting()
                ));
    }

    @Override
    public List<Document> searchDocuments(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            log.warn("Mot-clé vide, retour de tous les documents");
            return documentRepository.findAll();
        }
        log.info("Recherche de documents avec le mot-clé : {}", keyword);
        return documentRepository.findByTitleContainingIgnoreCaseOrContentContainingIgnoreCase(keyword, keyword);
    }

    @Override
    public Version getDocumentVersion(Long documentId, Long versionNumber) {
        if (documentId == null || versionNumber == null) {
            throw new IllegalArgumentException("L'ID du document et le numéro de version ne peuvent pas être null.");
        }

        log.info("Récupération de la version {} pour le document ID : {}", versionNumber, documentId);
        return versionServices.getVersionByDocumentAndNumber(documentId, versionNumber);
    }

    @Override
    public List<Version> getDocumentVersions(Long documentId) {
        if (documentId == null) {
            throw new IllegalArgumentException("L'ID du document ne peut pas être null.");
        }

        log.info("Récupération de toutes les versions pour le document ID : {}", documentId);
        return versionServices.getVersionsByDocument(documentId);
    }

}
