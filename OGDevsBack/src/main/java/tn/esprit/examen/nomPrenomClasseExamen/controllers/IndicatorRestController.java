package tn.esprit.examen.nomPrenomClasseExamen.controllers;

import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Indicator;
import tn.esprit.examen.nomPrenomClasseExamen.entities.IndicatorDTO;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Report;
import tn.esprit.examen.nomPrenomClasseExamen.services.IIndicatorServices;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/indicators")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class IndicatorRestController {

    private final IIndicatorServices indicatorServices;

    // --- Méthodes existantes pour Indicators (inchangées) ---

    @PostMapping
    public ResponseEntity<Indicator> createIndicator(@RequestBody Indicator indicator) {
        Indicator createdIndicator = indicatorServices.createIndicator(indicator);
        return ResponseEntity.ok(createdIndicator);
    }

    @PostMapping("/create-and-update")
    public String createAndUpdateIndicator() {
        Indicator indicator = new Indicator();
        indicator.setCode("IND-MAG-02");
        indicator.setLibelle("Taux de réalisations des actions correctives");
        indicator.setUnite("%");
        indicator.setCible(80.0);
        indicator.setFrequence("Mensuelle");
        indicator.setActif(String.valueOf(true));

        Indicator createdIndicator = indicatorServices.createIndicator(indicator);
        indicatorServices.updateIndicatorValue("IND-MAG-02");
        return "Indicator created and updated successfully with ID: " + createdIndicator.getIdIndicateur();
    }

    @PutMapping("/update/{indicatorCode}")
    public void updateIndicatorValue(@PathVariable String indicatorCode) {
        indicatorServices.updateIndicatorValue(indicatorCode);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Indicator> modifyIndicator(@PathVariable Long id, @RequestBody Indicator indicator) {
        try {
            Indicator updatedIndicator = indicatorServices.updateIndicator(id, indicator);
            return ResponseEntity.ok(updatedIndicator);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new Indicator());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Indicator> fetchIndicatorById(@PathVariable Long id) {
        return indicatorServices.getIndicatorById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<Indicator>> fetchAllIndicators() {
        try {
            List<Indicator> indicators = indicatorServices.getAllIndicators();
            return ResponseEntity.ok(indicators);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ArrayList<>());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeIndicator(@PathVariable Long id) {
        try {
            indicatorServices.deleteIndicator(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/trends")
    public ResponseEntity<Map<String, List<Double>>> fetchIndicatorTrends() {
        try {
            Map<String, List<Double>> trends = indicatorServices.getIndicatorTrends();
            return ResponseEntity.ok(trends);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new HashMap<>());
        }
    }

    @PostMapping("/upload/json")
    public ResponseEntity<List<Indicator>> importJsonIndicators(@RequestBody List<Indicator> indicators) {
        try {
            if (indicators == null || indicators.isEmpty()) {
                return ResponseEntity.badRequest().body(new ArrayList<>());
            }
            List<Indicator> savedIndicators = indicatorServices.createMultipleIndicators(indicators);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedIndicators);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ArrayList<>());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ArrayList<>());
        }
    }

    @PostMapping(value = "/upload/csv", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<List<Indicator>> importCsvIndicators(@RequestParam("file") MultipartFile file) {
        if (isInvalidFile(file)) {
            return ResponseEntity.badRequest().body(new ArrayList<>());
        }
        try {
            List<Indicator> indicators = parseCsvIndicators(file);
            List<Indicator> savedIndicators = indicatorServices.createMultipleIndicators(indicators);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedIndicators);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ArrayList<>());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ArrayList<>());
        }
    }

    @PostMapping(value = "/upload/pdf", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<List<Indicator>> importPdfIndicators(@RequestParam("file") MultipartFile file) {
        if (isInvalidFile(file)) {
            return ResponseEntity.badRequest().body(new ArrayList<>());
        }
        try {
            List<Indicator> indicators = parsePdfIndicators(file);
            List<Indicator> savedIndicators = indicatorServices.createMultipleIndicators(indicators);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedIndicators);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ArrayList<>());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ArrayList<>());
        }
    }

    @GetMapping(value = "/report", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> generateReport(@RequestParam String period) {
        try {
            if (isInvalidPeriod(period)) {
                return ResponseEntity.badRequest().body("Période invalide");
            }
            String report = indicatorServices.generatePeriodicReport(period);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur lors de la génération du rapport : " + e.getMessage());
        }
    }

    // --- Méthodes pour Reports ---

    @PostMapping("/reports")
    public ResponseEntity<Report> addReport(@RequestBody Report report) {
        try {
            if (report == null || report.getTitle() == null || report.getTitle().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new Report() {
                    { setContent("Le titre du rapport ne peut pas être nul ou vide"); }
                });
            }
            if (report.getDateCreation() == null) {
                report.setDateCreation(new Date());
            }
            if (report.getCreatedBy() == null) {
                report.setCreatedBy("Utilisateur Actuel");
            }
            if (report.getImpactLevel() == null) {
                report.setImpactLevel("Moyen");
            }
            if (report.getStatut() == null) {
                report.setStatut("FINAL");
            }

            // Les indicateurs sont déjà dans report.getIndicators(), pas besoin de les inclure dans content
            System.out.println("Received Report: " + report);
            Report createdReport = indicatorServices.createReport(report);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdReport);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new Report() {
                { setContent("Données invalides : " + e.getMessage()); }
            });
        } catch (Exception e) {
            System.err.println("Error creating report: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new Report() {
                { setContent("Une erreur interne s’est produite lors de la création du rapport : " + e.getMessage()); }
            });
        }
    }

    @GetMapping("/reports")
    public ResponseEntity<List<Report>> fetchAllReports() {
        try {
            List<Report> reports = indicatorServices.getAllReports();
            return ResponseEntity.ok(reports);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ArrayList<>());
        }
    }

    // Ajout de la méthode pour mettre à jour un rapport
    @PutMapping("/reports/{id}")
    public ResponseEntity<Report> updateReport(@PathVariable Long id, @RequestBody Report report) {
        try {
            report.setId(id); // Assurez-vous que l'ID correspond
            Report updatedReport = indicatorServices.updateReport(report);
            return ResponseEntity.ok(updatedReport);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.err.println("Error updating report: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new Report() {
                { setContent("Une erreur interne s’est produite lors de la mise à jour du rapport : " + e.getMessage()); }
            });
        }
    }

    // Ajout de la méthode pour supprimer un rapport
    @DeleteMapping("/reports/{id}")
    public ResponseEntity<Void> deleteReport(@PathVariable Long id) {
        try {
            indicatorServices.deleteReport(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.err.println("Error deleting report: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // --- Méthodes utilitaires (inchangées) ---

    private List<Indicator> parseCsvIndicators(MultipartFile file) throws IOException {
        List<Indicator> indicators = new ArrayList<>();
        try (BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String line;
            boolean firstLine = true;
            while ((line = br.readLine()) != null) {
                if (firstLine) {
                    firstLine = false;
                    continue;
                }
                String[] parts = line.split(",");
                if (parts.length >= 7 && parts[0].startsWith("IND-")) {
                    Indicator indicator = new Indicator();
                    indicator.setCode(parts[0].trim());
                    indicator.setLibelle(parts[1].trim());
                    indicator.setMethodeCalcul(parts[2].trim());
                    indicator.setFrequence(parts[3].trim());
                    indicator.setUnite(parts[4].trim());
                    indicator.setCible(parseDoubleValue(parts[5]));
                    indicator.setCurrentValue(parseOptionalDouble(parts[6]));
                    indicator.setActif("Oui");
                    indicators.add(indicator);
                }
            }
        }
        return indicators;
    }

    private List<Indicator> parsePdfIndicators(MultipartFile file) throws IOException {
        List<Indicator> indicators = new ArrayList<>();
        try (PDDocument document = PDDocument.load(file.getInputStream())) {
            PDFTextStripper pdfStripper = new PDFTextStripper();
            String text = pdfStripper.getText(document);
            String[] lines = text.split("\n");

            for (String line : lines) {
                if (line.contains("IND-")) {
                    String cleanedLine = line.trim().replaceAll("\\s+", " ");
                    String[] parts = cleanedLine.split("\\s+");
                    if (parts.length >= 7) {
                        Indicator indicator = new Indicator();
                        indicator.setCode(parts[0]);
                        int libelleEndIndex = -1;
                        for (int i = 1; i < parts.length - 5; i++) {
                            if (parts[i].matches("Mensuelle|Annuelle")) {
                                libelleEndIndex = i;
                                break;
                            }
                        }
                        if (libelleEndIndex == -1) libelleEndIndex = parts.length - 5;
                        indicator.setLibelle(String.join(" ", Arrays.copyOfRange(parts, 1, libelleEndIndex)));
                        indicator.setFrequence(parts[libelleEndIndex]);
                        indicator.setUnite(parts[libelleEndIndex + 1]);
                        indicator.setCible(parseDoubleValue(parts[libelleEndIndex + 2]));
                        indicator.setCurrentValue(parseOptionalDouble(parts[libelleEndIndex + 3]));
                        indicator.setActif("Oui");
                        indicators.add(indicator);
                    }
                }
            }
        }
        return indicators;
    }

    private boolean isInvalidIndicator(Indicator indicator) {
        return indicator == null || indicator.getCode() == null || indicator.getCode().trim().isEmpty() ||
                !indicator.getCode().startsWith("IND-") || indicator.getFrequence() == null ||
                !indicator.getFrequence().matches("Mensuelle|Annuelle");
    }

    private boolean isInvalidPeriod(String period) {
        return period == null || !period.trim().matches("Mensuelle|Annuelle");
    }

    private boolean isInvalidFile(MultipartFile file) {
        return file == null || file.isEmpty() || (!file.getOriginalFilename().endsWith(".csv") &&
                !file.getOriginalFilename().endsWith(".pdf"));
    }

    private Double parseDoubleValue(String value) {
        if (value == null || value.trim().isEmpty()) return null;
        try {
            return Double.parseDouble(value.replace("%", "").trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private Double parseOptionalDouble(String value) {
        return "N/A".equals(value.trim()) || value.trim().isEmpty() ? null : parseDoubleValue(value);
    }
    @GetMapping("/process/{processId}")
    public List<IndicatorDTO> getIndicatorsForProcess(@PathVariable Long processId) {
        return indicatorServices.getIndicatorsForProcess(processId);
    }
}
