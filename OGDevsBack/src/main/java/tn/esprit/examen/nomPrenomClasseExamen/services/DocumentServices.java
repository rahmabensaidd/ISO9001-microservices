package tn.esprit.examen.nomPrenomClasseExamen.services;

import lombok.RequiredArgsConstructor;
import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.apache.pdfbox.text.PDFTextStripper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Document;
import tn.esprit.examen.nomPrenomClasseExamen.entities.TypeDocument;
import tn.esprit.examen.nomPrenomClasseExamen.entities.UserEntity;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Version;
import tn.esprit.examen.nomPrenomClasseExamen.entities.StatutDocument;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.DocumentationRepository;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.UserRepository;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class DocumentServices implements IDocumentServices {

    private final DocumentationRepository documentRepository;
    private final UserRepository userRepository;
    private final IVersionServices versionServices;
    private static final Logger log = LoggerFactory.getLogger(DocumentServices.class);
    private static final String UPLOAD_DIR = "C:\\Uploads\\";
    private static final String TESSDATA_PATH;

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
                log.error("Failed to extract tessdata to temporary directory", e);
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

    @Override
    public Document createDocument(Document document) {
        validateDocument(document);
        document.setDateCreation(LocalDate.now());
        if (document.getCategory() == null) {
            document.setCategory("Files"); // Ensure category is set to "Files"
        }
        log.info("Création du document : {}", document.getTitle());

        Document savedDocument = documentRepository.save(document);

        Version initialVersion = new Version();
        initialVersion.setDocument(savedDocument);
        initialVersion.setContenu(savedDocument.getContent());
        initialVersion.setModifiePar(savedDocument.getCreatedBy() != null
                ? savedDocument.getCreatedBy().getUsername()
                : "Système");
        initialVersion.setModificationDetails("Document créé");
        versionServices.createVersion(initialVersion);

        return savedDocument;
    }

    @Override
    public Document updateDocument(Long id, Document document) {
        if (id == null || !documentRepository.existsById(id)) {
            throw new IllegalArgumentException("Document avec l'ID " + id + " n'existe pas.");
        }
        Document existingDocument = documentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Document non trouvé avec l'ID : " + id));

        Version newVersion = new Version();
        newVersion.setDocument(existingDocument);
        newVersion.setContenu(existingDocument.getContent());
        // Safely handle createdBy
        String modifiedBy = "Système";
        if (document.getCreatedBy() != null) {
            if (document.getCreatedBy().getUsername() != null) {
                modifiedBy = document.getCreatedBy().getUsername();
            } else if (document.getCreatedBy().getId() != null) {
                Optional<UserEntity> userOptional = userRepository.findById(document.getCreatedBy().getId());
                modifiedBy = userOptional.map(UserEntity::getUsername).orElse("Système");
            }
        }
        newVersion.setModifiePar(modifiedBy);
        newVersion.setModificationDetails("Mise à jour du document");
        versionServices.createVersion(newVersion);

        document.setId(id);
        if (document.getCategory() == null) {
            document.setCategory(existingDocument.getCategory() != null ? existingDocument.getCategory() : "Files");
        }
        validateDocument(document);
        log.info("Mise à jour du document ID : {}", id);
        return documentRepository.save(document);
    }

    @Override
    public Optional<Document> getDocumentById(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("L'ID ne peut pas être null.");
        }
        log.info("Récupération du document ID : {}", id);
        return documentRepository.findById(id);
    }

    @Override
    public List<Document> getAllDocuments() {
        log.info("Récupération de tous les documents");
        List<Document> documents = documentRepository.findAll();
        return documents.stream()
                .filter(doc -> doc.getCategory() == null || !"Archive".equals(doc.getCategory()))
                .collect(Collectors.toList());
    }

    @Override
    public List<Document> getArchivedDocuments() {
        log.info("Récupération de tous les documents archivés");
        return documentRepository.findByCategory("Archive");
    }

    @Override
    public List<Version> getDocumentVersions(Long documentId) {
        if (documentId == null) {
            log.error("L'ID du document ne peut pas être null.");
            throw new IllegalArgumentException("L'ID du document ne peut pas être null.");
        }
        log.info("Récupération des versions du document ID : {}", documentId);
        return versionServices.getVersionsByDocument(documentId);
    }

    @Override
    public Version getDocumentVersion(Long documentId, Long versionNumber) {
        if (documentId == null || versionNumber == null) {
            log.error("L'ID du document et le numéro de version ne peuvent pas être null.");
            throw new IllegalArgumentException("L'ID du document et le numéro de version ne peuvent pas être null.");
        }
        log.info("Récupération de la version {} du document ID : {}", versionNumber, documentId);
        return versionServices.getVersionByDocumentAndNumber(documentId, versionNumber);
    }

    @Override
    public void deleteDocument(Long id) {
        if (id == null || !documentRepository.existsById(id)) {
            throw new IllegalArgumentException("Document avec l'ID " + id + " n'existe pas.");
        }
        log.info("Suppression du document ID : {}", id);
        documentRepository.deleteById(id);
    }

    @Override
    public Document uploadAndSummarize(MultipartFile file, String userId, Map<String, Object> config)
            throws IOException, TesseractException {
        if (file == null) {
            log.error("Le fichier est null");
            throw new IllegalArgumentException("Le fichier ne peut pas être null.");
        }
        if (file.isEmpty()) {
            log.error("Le fichier est vide - Nom : {}", file.getOriginalFilename());
            throw new IllegalArgumentException("Le fichier est vide.");
        }

        log.info("Fichier reçu - Nom : {}, Taille : {} octets, Type : {}",
                file.getOriginalFilename(), file.getSize(), file.getContentType());

        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path uploadDirPath = Paths.get(UPLOAD_DIR);

        if (!Files.exists(uploadDirPath)) {
            Files.createDirectories(uploadDirPath);
            log.info("Répertoire créé : {}", uploadDirPath);
        } else {
            log.info("Répertoire prêt : {}", uploadDirPath);
        }

        Path filePath = uploadDirPath.resolve(fileName);
        File tempFile = null;
        try {
            tempFile = filePath.toFile();
            log.info("Sauvegarde temporaire dans : {}", filePath);
            file.transferTo(tempFile);
            log.info("Fichier sauvegardé : {}", filePath);

            String extractedText = extractTextFromFile(tempFile, file.getContentType(), config);
            log.info("Texte extrait (100 premiers caractères) : {}",
                    extractedText.length() > 100 ? extractedText.substring(0, 100) : extractedText);

            Document document = new Document();
            document.setTitle(file.getOriginalFilename());
            document.setContent(extractedText);
            document.setDateCreation(LocalDate.now());
            document.setCategory("Files");
            document.setType(determineDocumentType(extractedText, config));

            if (userId != null && !userId.isEmpty()) {
                UserEntity user = userRepository.findById(userId)
                        .orElseThrow(() -> new IllegalArgumentException("User with ID " + userId + " not found"));
                document.setCreatedBy(user);
            } else {
                document.setCreatedBy(null);
            }

            if (extractedText != null && !extractedText.trim().isEmpty()) {
                populateDocumentFields(document, extractedText, config);
            } else {
                log.warn("Texte vide, champs spécifiques non remplis");
            }

            log.info("Sauvegarde du document : {}", document.getTitle());
            Document savedDocument = documentRepository.save(document);

            Version initialVersion = new Version();
            initialVersion.setDocument(savedDocument);
            initialVersion.setContenu(savedDocument.getContent());
            initialVersion.setModifiePar(savedDocument.getCreatedBy() != null
                    ? savedDocument.getCreatedBy().getUsername()
                    : "Système");
            initialVersion.setModificationDetails("Document créé via upload");
            versionServices.createVersion(initialVersion);

            return savedDocument;
        } catch (IOException e) {
            log.error("Erreur d'entrée/sortie lors du traitement du fichier {}: {}", file.getOriginalFilename(), e.getMessage(), e);
            throw e;
        } catch (TesseractException e) {
            log.error("Erreur OCR lors du traitement du fichier {}: {}", file.getOriginalFilename(), e.getMessage(), e);
            throw e;
        } finally {
            if (tempFile != null && tempFile.exists()) {
                try {
                    Files.delete(filePath);
                    log.info("Fichier temporaire supprimé : {}", filePath);
                } catch (IOException e) {
                    log.warn("Échec de la suppression du fichier temporaire {}: {}", filePath, e.getMessage());
                }
            }
        }
    }

    @Override
    public List<Document> searchDocuments(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            log.warn("Mot-clé vide, retour de tous les documents");
            return documentRepository.findAll();
        }
        log.info("Recherche avec mot-clé : {}", keyword);
        return documentRepository.findByTitleContainingIgnoreCaseOrContentContainingIgnoreCase(keyword, keyword);
    }

    @Override
    public Document archiveDocument(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("L'ID ne peut pas être null.");
        }
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Document non trouvé avec l'ID : " + id));
        document.setContent(document.getContent() + " [ARCHIVÉ]");
        document.setCategory("Archive");

        Version archiveVersion = new Version();
        archiveVersion.setDocument(document);
        archiveVersion.setContenu(document.getContent());
        archiveVersion.setModifiePar(document.getCreatedBy() != null
                ? document.getCreatedBy().getUsername()
                : "Système");
        archiveVersion.setModificationDetails("Document archivé");
        versionServices.createVersion(archiveVersion);

        log.info("Archivage du document ID : {}", id);
        return documentRepository.save(document);
    }

    @Override
    public Document unarchiveDocument(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("L'ID ne peut pas être null.");
        }
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Document non trouvé avec l'ID : " + id));
        if (!"Archive".equals(document.getCategory())) {
            throw new IllegalStateException("Le document n'est pas archivé.");
        }
        document.setContent(document.getContent().replace(" [ARCHIVÉ]", ""));
        document.setCategory("Files");

        Version unarchiveVersion = new Version();
        unarchiveVersion.setDocument(document);
        unarchiveVersion.setContenu(document.getContent());
        unarchiveVersion.setModifiePar(document.getCreatedBy() != null
                ? document.getCreatedBy().getUsername()
                : "Système");
        unarchiveVersion.setModificationDetails("Document désarchivé");
        versionServices.createVersion(unarchiveVersion);

        log.info("Désarchivage du document ID : {}", id);
        return documentRepository.save(document);
    }

    private String extractTextFromFile(File tempFile, String contentType, Map<String, Object> config)
            throws IOException, TesseractException {
        if ("application/pdf".equals(contentType)) {
            try (PDDocument pdfDocument = PDDocument.load(tempFile)) {
                if (!pdfDocument.isEncrypted()) {
                    PDFTextStripper stripper = new PDFTextStripper();
                    String text = stripper.getText(pdfDocument);
                    if (text != null && !text.trim().isEmpty()) {
                        log.info("Texte extrait via PDFTextStripper : {} caractères", text.length());
                        return text;
                    }
                    log.info("Aucun texte natif extrait, passage à l'OCR");
                }

                PDFRenderer pdfRenderer = new PDFRenderer(pdfDocument);
                List<BufferedImage> images = new ArrayList<>();
                boolean removeBlankPages = config != null && config.containsKey("removeBlankPages")
                        && (Boolean) config.get("removeBlankPages");

                log.info("Traitement PDF - Pages : {}", pdfDocument.getNumberOfPages());
                for (int page = 0; page < pdfDocument.getNumberOfPages(); page++) {
                    BufferedImage image = pdfRenderer.renderImageWithDPI(page, 600);
                    if (image == null) {
                        log.warn("Page {} non rendue, ignorée", page + 1);
                        continue;
                    }
                    if (!removeBlankPages || !isBlankPage(image)) {
                        images.add(image);
                    }
                }

                if (images.isEmpty()) {
                    log.error("Aucune page valide trouvée dans le PDF");
                    throw new IOException("Aucune page avec du contenu détecté.");
                }

                Tesseract tesseract = new Tesseract();
                log.info("Configuration Tesseract - TESSDATA_PATH : {}", TESSDATA_PATH);
                tesseract.setDatapath(TESSDATA_PATH);
                tesseract.setLanguage("eng");

                if (!new File(TESSDATA_PATH).exists()) {
                    log.error("Dossier tessdata introuvable : {}", TESSDATA_PATH);
                    throw new TesseractException("Chemin tessdata invalide : " + TESSDATA_PATH);
                }

                StringBuilder textBuilder = new StringBuilder();
                for (int i = 0; i < images.size(); i++) {
                    try {
                        String pageText = tesseract.doOCR(images.get(i));
                        if (pageText == null || pageText.trim().isEmpty()) {
                            log.warn("Aucun texte extrait de la page {}", i + 1);
                            continue;
                        }
                        textBuilder.append(pageText).append("\n");
                        log.info("Page {} traitée - Texte : {} caractères", i + 1, pageText.length());
                    } catch (TesseractException e) {
                        log.error("Erreur OCR pour la page {} : {}", i + 1, e.getMessage(), e);
                    }
                }

                String result = textBuilder.toString();
                if (result.trim().isEmpty()) {
                    log.warn("Aucun texte extrait via OCR, retour de chaîne vide");
                    return "";
                }
                log.info("Texte total extrait : {} caractères", result.length());
                return result;
            }
        } else {
            BufferedImage image = ImageIO.read(tempFile);
            if (image == null) {
                log.error("Impossible de lire l'image : {}", tempFile.getName());
                throw new IOException("Fichier image invalide : " + tempFile.getName());
            }

            Tesseract tesseract = new Tesseract();
            log.info("Configuration Tesseract - TESSDATA_PATH : {}", TESSDATA_PATH);
            tesseract.setDatapath(TESSDATA_PATH);
            tesseract.setLanguage("eng");

            if (!new File(TESSDATA_PATH).exists()) {
                log.error("Dossier tessdata introuvable : {}", TESSDATA_PATH);
                throw new TesseractException("Chemin tessdata invalide : " + TESSDATA_PATH);
            }

            String extractedText = tesseract.doOCR(image);
            if (extractedText == null || extractedText.trim().isEmpty()) {
                log.warn("Aucun texte extrait de l'image, retour de chaîne vide");
                return "";
            }
            log.info("Texte extrait de l'image : {} caractères", extractedText.length());
            return extractedText;
        }
    }

    private boolean isBlankPage(BufferedImage image) {
        if (image == null) {
            log.error("Image null lors de la vérification des pages blanches");
            return true;
        }
        int width = image.getWidth();
        int height = image.getHeight();
        int whitePixelCount = 0;
        int totalPixels = width * height;

        for (int x = 0; x < width; x++) {
            for (int y = 0; y < height; y++) {
                int rgb = image.getRGB(x, y);
                if (rgb == -1 || (Math.abs((rgb & 0xFF) - 255) < 10
                        && Math.abs(((rgb >> 8) & 0xFF) - 255) < 10
                        && Math.abs(((rgb >> 16) & 0xFF) - 255) < 10)) {
                    whitePixelCount++;
                }
            }
        }
        return whitePixelCount > totalPixels * 0.98;
    }

    private void validateDocument(Document document) {
        if (document == null) {
            throw new IllegalArgumentException("Le document ne peut pas être null.");
        }
        if (document.getTitle() == null || document.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Le titre du document est requis.");
        }
    }

    private TypeDocument determineDocumentType(String text, Map<String, Object> config) {
        if (text == null || text.trim().isEmpty()) {
            log.info("Texte null ou vide, type par défaut : AUTRE");
            return TypeDocument.AUTRE;
        }
        String lowerText = text.toLowerCase();
        if (lowerText.contains("salaire") || lowerText.contains("paie")) {
            log.info("Type détecté : FICHE_PAIE");
            return TypeDocument.FICHE_PAIE;
        } else if (lowerText.contains("contrat")) {
            log.info("Type détecté : CONTRAT");
            return TypeDocument.CONTRAT;
        } else if (lowerText.contains("poste")) {
            log.info("Type détecté : FICHE_POSTE");
            return TypeDocument.FICHE_POSTE;
        } else if (lowerText.contains("processus") || lowerText.contains("technique")) {
            log.info("Type détecté : PROCESSUS_TECHNIQUE");
            return TypeDocument.PROCESSUS_REALISATION;
        }
        log.info("Type par défaut : AUTRE");
        return TypeDocument.AUTRE;
    }

    private void populateDocumentFields(Document document, String text, Map<String, Object> config) {
        String lowerText = text.toLowerCase();
        switch (document.getType()) {
            case FICHE_PAIE:
                document.setEmploye(extractField(lowerText, "nom|employe|employee"));
                document.setSalaireBrut(extractDouble(lowerText, "salaire brut|gross salary"));
                document.setSalaireNet(extractDouble(lowerText, "salaire net|net salary"));
                document.setCotisationsSociales(extractDouble(lowerText, "cotisations sociales|social contributions"));
                document.setPeriode(extractField(lowerText, "periode|period"));
                break;
            case FICHE_POSTE:
                document.setObjectifs(extractField(lowerText, "objectifs|objectives"));
                document.setPolyvalence(extractField(lowerText, "polyvalence|versatility"));
                document.setExperiences(extractField(lowerText, "experiences|experience"));
                document.setFormation(extractField(lowerText, "formation|training"));
                document.setExigenceDePoste(extractField(lowerText, "exigence|requirements"));
                document.setTaches(extractList(lowerText, "taches|tasks"));
                document.setCodeProcessus(extractField(lowerText, "code processus|process code"));
                break;
            case CONTRAT:
                document.setTypeContrat(extractField(lowerText, "type contrat|contract type"));
                document.setDateDebut(extractDate(lowerText, "date debut|start date"));
                document.setDateFin(extractDate(lowerText, "date fin|end date"));
                document.setSalaire(extractDouble(lowerText, "salaire|salary"));
                break;
            case PROCESSUS_REALISATION:
                document.setDesignation(extractField(lowerText, "designation"));
                document.setAxe(extractField(lowerText, "axe|axis"));
                document.setPilote(extractField(lowerText, "pilote|pilot"));
                document.setOperations(extractList(lowerText, "operations"));
                document.setPredecesseurs(extractList(lowerText, "predecesseurs|predecessors"));
                document.setSuccesseurs(extractList(lowerText, "successeurs|successors"));
                break;
            default:
                break;
        }
    }

    private String extractField(String text, String fieldPattern) {
        String[] patterns = fieldPattern.split("\\|");
        for (String pattern : patterns) {
            String regex = "(?i)" + pattern + ":\\s*([\\w\\s][^\\n]*)";
            java.util.regex.Pattern p = java.util.regex.Pattern.compile(regex);
            java.util.regex.Matcher m = p.matcher(text);
            if (m.find()) {
                String value = m.group(1).trim();
                log.info("Champ {} extrait : {}", pattern, value);
                return value;
            }
        }
        log.debug("Champ {} non trouvé", fieldPattern);
        return "";
    }

    private Double extractDouble(String text, String fieldPattern) {
        String[] patterns = fieldPattern.split("\\|");
        for (String pattern : patterns) {
            String regex = "(?i)" + pattern + ":\\s*([\\d,.]+)";
            java.util.regex.Pattern p = java.util.regex.Pattern.compile(regex);
            java.util.regex.Matcher m = p.matcher(text);
            if (m.find()) {
                try {
                    String value = m.group(1).replace(",", ".");
                    Double result = Double.parseDouble(value);
                    log.info("Champ {} extrait : {}", pattern, result);
                    return result;
                } catch (NumberFormatException e) {
                    log.warn("Échec de l'extraction de {} : {}", pattern, e.getMessage());
                }
            }
        }
        log.debug("Champ {} non trouvé", fieldPattern);
        return null;
    }

    private LocalDate extractDate(String text, String fieldPattern) {
        String[] patterns = fieldPattern.split("\\|");
        for (String pattern : patterns) {
            String regex = "(?i)" + pattern + ":\\s*(\\d{2}/\\d{2}/\\d{4}|\\d{4}-\\d{2}-\\d{2})";
            java.util.regex.Pattern p = java.util.regex.Pattern.compile(regex);
            java.util.regex.Matcher m = p.matcher(text);
            if (m.find()) {
                try {
                    String dateStr = m.group(1);
                    if (dateStr.contains("/")) {
                        java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("dd/MM/yyyy");
                        java.util.Date date = sdf.parse(dateStr);
                        return java.time.LocalDate.ofInstant(date.toInstant(), java.time.ZoneId.systemDefault());
                    } else {
                        return java.time.LocalDate.parse(dateStr);
                    }
                } catch (Exception e) {
                    log.warn("Échec de l'extraction de {} : {}", pattern, e.getMessage());
                }
            }
        }
        log.debug("Date {} non trouvée", fieldPattern);
        return null;
    }

    private List<String> extractList(String text, String fieldPattern) {
        String[] patterns = fieldPattern.split("\\|");
        for (String pattern : patterns) {
            String regex = "(?i)" + pattern + ":\\s*([\\s\\S]*?)(?:\\n\\n|\\z)";
            java.util.regex.Pattern p = java.util.regex.Pattern.compile(regex);
            java.util.regex.Matcher m = p.matcher(text);
            if (m.find()) {
                String value = m.group(1).trim();
                List<String> items = java.util.Arrays.stream(value.split("\\n|-\\s"))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .collect(java.util.stream.Collectors.toList());
                log.info("Liste {} extraite : {}", pattern, items);
                return items;
            }
        }
        log.debug("Liste {} non trouvée", fieldPattern);
        return new ArrayList<>();
    }
    // Statistiques : Nombre de documents par type

    public Map<TypeDocument, Long> getDocumentsByType() {
        List<Object[]> results = documentRepository.countDocumentsByType();
        Map<TypeDocument, Long> stats = new HashMap<>();
        for (Object[] result : results) {
            stats.put((TypeDocument) result[0], (Long) result[1]);
        }
        log.info("Statistiques par type : {}", stats);
        return stats;
    }

    // Statistiques : Nombre de documents par catégorie
    public Map<String, Long> getDocumentsByCategory() {
        List<Object[]> results = documentRepository.countDocumentsByCategory();
        Map<String, Long> stats = new HashMap<>();
        for (Object[] result : results) {
            stats.put(result[0] != null ? (String) result[0] : "Non défini", (Long) result[1]);
        }
        log.info("Statistiques par catégorie : {}", stats);
        return stats;
    }

    // Statistiques : Nombre de documents par mois de création
    public Map<String, Long> getDocumentsByCreationMonth() {
        List<Object[]> results = documentRepository.countDocumentsByCreationMonth();
        Map<String, Long> stats = new HashMap<>();
        for (Object[] result : results) {
            stats.put((String) result[0], (Long) result[1]);
        }
        log.info("Statistiques par mois de création : {}", stats);
        return stats;
    }

    // Statistiques : Moyenne des salaires bruts (FICHE_PAIE)

    public Double getAverageGrossSalary() {
        Double average = documentRepository.findAverageGrossSalaryByType(TypeDocument.FICHE_PAIE);
        log.info("Moyenne des salaires bruts : {}", average);
        return average != null ? average : 0.0;
    }

    // Statistiques : Documents par utilisateur créateur

    public Map<String, Long> getDocumentsByCreator() {
        List<Object[]> results = documentRepository.countDocumentsByCreator();
        Map<String, Long> stats = new HashMap<>();
        for (Object[] result : results) {
            stats.put((String) result[0], (Long) result[1]);
        }
        log.info("Statistiques par créateur : {}", stats);
        return stats;
    }

    // Statistiques : Documents par période
    public Map<String, Long> getDocumentsByPeriod(LocalDate startDate, LocalDate endDate) {
        List<Document> documents = documentRepository.findByDateCreationBetween(startDate, endDate);
        Map<String, Long> stats = documents.stream()
                .collect(Collectors.groupingBy(
                        doc -> doc.getDateCreation().toString(),
                        Collectors.counting()));
        log.info("Statistiques par période : {}", stats);
        return stats;
    }
}
