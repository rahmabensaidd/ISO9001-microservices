package tn.esprit.examen.nomPrenomClasseExamen.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import tn.esprit.examen.nomPrenomClasseExamen.entities.*;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Process;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class IndicatorServices implements IIndicatorServices {

    private final IndicatorRepository indicatorRepository;
    private final ReportRepository reportRepository;
    private final ProcessRepository processRepository;
    private final NonConformityRepository nonConformityRepository;
    private final UserEntityRepository userEntityRepository;
    private final NotificationService notificationService;

    @Override
    public Indicator createIndicator(Indicator indicator) {
        return indicatorRepository.save(indicator);
    }

    @Override
    public void updateIndicatorValue(String indicatorCode) {
        Indicator indicator = indicatorRepository.findByCode(indicatorCode);
        if (indicator == null) {
            throw new IllegalArgumentException("Indicator with code " + indicatorCode + " does not exist.");
        }
        else {
            // Simplified calculation for other indicators
            List<Non_Conformity> nonConformities = nonConformityRepository.findByIndicator(indicator);
            long totalActions = nonConformities.size();
            long openActions = nonConformities.stream()
                    .filter(nc -> "OPEN".equalsIgnoreCase(nc.getStatus()))
                    .count();
            double currentValue = totalActions > 0 ? ((double) openActions / totalActions) * 100 : 0.0;
            log.info("Indicator: {}, Total Actions: {}, Open Actions: {}, Current Value: {}",
                    indicator.getCode(), totalActions, openActions, currentValue);
            indicator.setCurrentValue(currentValue);
            indicatorRepository.save(indicator);
        }
        updateIndicatorCorrectiveActionsValue(indicator);
        updateIndicatorNonConfCurrentValue(indicator);

    }

    private void updateIndicatorNonConfCurrentValue(Indicator indicator) {
        List<Non_Conformity> nonConformities = nonConformityRepository.findByIndicator(indicator);
        long totalActions = nonConformities.size();
        long openActions = nonConformities.stream()
                .filter(nc -> "OPEN".equalsIgnoreCase(nc.getStatus()))
                .count();
        double currentValue = (totalActions > 0) ? ((double) openActions / totalActions) * 100 : 0.0;
        System.out.println("Indicator: " + indicator.getCode() + ", Total Actions: " + totalActions + ", Open Actions: " + openActions + ", Current Value: " + currentValue);

        // Update currentValue in the Indicator entity
        indicator.setCurrentValue(currentValue);
        indicatorRepository.save(indicator);

        // Check if currentValue > cible
        Double cible = indicator.getCible();
        if (cible != null && currentValue > cible && openActions > 0) {
            // Check for existing automatic non-conformity
            Optional<Non_Conformity> existingNonConformity = nonConformityRepository.findBySourceAndIndicatorCodeAndStatusOpen(NonConformitySource.INDICATORS, indicator.getCode());
            if (!existingNonConformity.isPresent()) {
                // No existing non-conformity, create a new one
                Non_Conformity nc = new Non_Conformity();
                nc.setSource(NonConformitySource.INDICATORS);
                nc.setType(NonConformityType.OTHERS);
                nc.setDescription("High percentage of open non-conformities (" + String.format("%.2f%%", currentValue) + "), with " + openActions + " non-conformities unfixed.");
                nc.setDateCreated(LocalDate.now());
                nc.setStatus("OPEN");
                nc.setIndicator(indicator);
                nonConformityRepository.save(nc);
                log.info("Created automatic non-conformity for Indicator: {}", indicator.getCode());
                // Send email notification to admins
                String message = String.format(
                        "Alerte: High percentage of open non-conformities (%.2f%%), with %d non-conformities unfixed.",
                        currentValue,
                        openActions);
                log.info("Notification envoyée aux admins: {}", message);
                notifyAdmins(message, "NonConformityExceedance");
            } else {
                // Non-conformity already exists, skip creation
                log.info("Existing automatic non-conformity found for Indicator: {}, skipping creation", indicator.getCode());
            }

        }
    }

    private void updateIndicatorCorrectiveActionsValue(Indicator indicator) {
        List<Non_Conformity> nonConformities = nonConformityRepository.findByIndicator(indicator);
        long totalActions = nonConformities.size();
        long completedActions = nonConformities.stream()
                .filter(nc -> "FIXED".equalsIgnoreCase(nc.getStatus()))
                .count();
        double currentValue = (totalActions > 0) ? ((double) completedActions / totalActions) * 100 : 0.0;
        System.out.println("Indicator: " + indicator.getCode() + ", Total Actions: " + totalActions + ", Completed Actions: " + completedActions + ", Current Value: " + currentValue);

        // Update currentValue in the Indicator entity
        indicator.setCurrentValue(currentValue);
        indicatorRepository.save(indicator);

        // Check if currentValue < cible
        Double cible = indicator.getCible();
        if (cible != null && currentValue < cible && totalActions > 0) {
            // Check for existing automatic non-conformity
            Optional<Non_Conformity> existingNonConformity = nonConformityRepository.findBySourceAndIndicatorCodeAndStatusOpen(NonConformitySource.INDICATORS, indicator.getCode());
            if (!existingNonConformity.isPresent()) {
                // No existing non-conformity, create a new one
                Non_Conformity nc = new Non_Conformity();
                nc.setSource(NonConformitySource.INDICATORS);
                nc.setType(NonConformityType.PERFORMANCE);
                nc.setDescription("Low rate of completed corrective actions (" + String.format("%.2f%%", currentValue) + ") below target (" + String.format("%.2f%%", cible) + ").");
                nc.setDateCreated(LocalDate.now());
                nc.setStatus("OPEN");
                nc.setIndicator(indicator);
                nonConformityRepository.save(nc);
                log.info("Created automatic non-conformity for Indicator: {}", indicator.getCode());
                // Send email notification to admins

                String message = String.format(
                        "Alerte: Low rate of completed corrective actions (%.2f%%) below target (%.2f%%).",
                        currentValue,
                        cible);
                log.info("Notification envoyée aux admins: {}", message);
                notifyAdmins(message, "CorrectiveActionUnderperformance");
            } else {
                // Non-conformity already exists, skip creation
                log.info("Existing automatic non-conformity found for Indicator: {}, skipping creation", indicator.getCode());
            }

        }
    }

    private void notifyAdmins(String message, String type) {
        List<UserEntity> admins = userEntityRepository.findAdminsWithRoles();
        for (UserEntity admin : admins) {
            log.info("Sending notification to admin {}: {}", admin.getId(), message);
            notificationService.sendNotification(admin.getId(), message, type);
        }
    }

    @Override
    public Indicator updateIndicator(Long id, Indicator indicator) {
        if (!indicatorRepository.existsById(id)) {
            throw new IllegalArgumentException("Indicator with id " + id + " does not exist.");
        }
        indicator.setIdIndicateur(id);
        return indicatorRepository.save(indicator);
    }

    @Override
    public Optional<Indicator> getIndicatorById(Long id) {
        return indicatorRepository.findById(id);
    }

    @Override
    public List<Indicator> getAllIndicators() {
        return indicatorRepository.findAll();
    }

    @Override
    public void deleteIndicator(Long id) {
        if (!indicatorRepository.existsById(id)) {
            throw new IllegalArgumentException("Indicator with id " + id + " does not exist.");
        }
        indicatorRepository.deleteById(id);
    }

    @Override
    public Map<String, List<Double>> getIndicatorTrends() {
        List<Indicator> indicators = indicatorRepository.findAll();
        Map<String, List<Double>> trends = new HashMap<>();

        for (Indicator indicator : indicators) {
            List<Double> values = new ArrayList<>();
            if (indicator.getCurrentValue() != null) {
                values.add(indicator.getCurrentValue());
                values.add(indicator.getCurrentValue() * 0.95); // -5%
                values.add(indicator.getCurrentValue() * 1.05); // +5%
            } else {
                values.add(0.0); // Default value if no data
            }
            trends.put(indicator.getCode(), values);
        }
        return trends;
    }

    @Override
    public String generatePeriodicReport(String period) {
        List<Indicator> indicators = indicatorRepository.findAll();
        StringBuilder report = new StringBuilder("Rapport " + period + " : ");

        List<Indicator> filteredIndicators = indicators.stream()
                .filter(ind -> ind.getFrequence().equalsIgnoreCase(period))
                .collect(Collectors.toList());

        if (filteredIndicators.isEmpty()) {
            return "Aucun indicateur disponible pour la période : " + period;
        }

        for (Indicator indicator : filteredIndicators) {
            report.append(indicator.getCode())
                    .append(" = ")
                    .append(indicator.getCurrentValue() != null ? indicator.getCurrentValue() : "N/A")
                    .append(indicator.getUnite())
                    .append(" (Cible: ")
                    .append(indicator.getCible() != null ? indicator.getCible() : "N/A")
                    .append(indicator.getUnite())
                    .append("), ");
        }

        if (report.length() > 2) {
            report.setLength(report.length() - 2);
        }

        return report.toString();
    }

    @Override
    public List<Indicator> createMultipleIndicators(List<Indicator> indicators) {
        if (indicators == null || indicators.isEmpty()) {
            throw new IllegalArgumentException("La liste des indicateurs ne peut pas être vide ou nulle.");
        }
        return indicatorRepository.saveAll(indicators);
    }

    @Override
    public Report createReport(Report report) {
        if (report == null) {
            throw new IllegalArgumentException("Le rapport ne peut pas être nul.");
        }
        if (report.getTitle() == null || report.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Le titre du rapport ne peut pas être nul ou vide.");
        }
        if (report.getDateCreation() == null) {
            report.setDateCreation(new Date());
        }
        if (report.getCreatedBy() == null) {
            report.setCreatedBy("Utilisateur");
        }
        if (report.getImpactLevel() == null) {
            report.setImpactLevel("Moyen");
        }
        if (report.getStatut() == null) {
            report.setStatut("FINAL");
        }
        log.info("Saving Report: {}", report);
        try {
            return reportRepository.save(report);
        } catch (Exception e) {
            log.error("Error saving report: {}", e.getMessage(), e);
            throw new RuntimeException("Erreur lors de l’enregistrement du rapport : " + e.getMessage(), e);
        }
    }

    @Override
    public List<Report> getAllReports() {
        return reportRepository.findAll();
    }

    @Override
    public Report updateReport(Report report) {
        if (report == null || report.getId() == null) {
            throw new IllegalArgumentException("Le rapport ou son ID ne peut pas être nul.");
        }
        if (!reportRepository.existsById(report.getId())) {
            throw new IllegalArgumentException("Rapport avec l'id " + report.getId() + " n'existe pas.");
        }
        if (report.getTitle() == null || report.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Le titre du rapport ne peut pas être nul ou vide.");
        }
        if (report.getDateCreation() == null) {
            report.setDateCreation(new Date());
        }
        if (report.getCreatedBy() == null) {
            report.setCreatedBy("Utilisateur");
        }
        if (report.getImpactLevel() == null) {
            report.setImpactLevel("Moyen");
        }
        if (report.getStatut() == null) {
            report.setStatut("FINAL");
        }
        log.info("Updating Report: {}", report);
        try {
            return reportRepository.save(report);
        } catch (Exception e) {
            log.error("Error updating report: {}", e.getMessage(), e);
            throw new RuntimeException("Erreur lors de la mise à jour du rapport : " + e.getMessage(), e);
        }
    }

    @Override
    public void deleteReport(Long id) {
        if (id == null || !reportRepository.existsById(id)) {
            throw new IllegalArgumentException("Rapport avec l'id " + id + " n'existe pas.");
        }
        try {
            reportRepository.deleteById(id);
            log.info("Deleted Report with id: {}", id);
        } catch (Exception e) {
            log.error("Error deleting report: {}", e.getMessage(), e);
            throw new RuntimeException("Erreur lors de la suppression du rapport : " + e.getMessage(), e);
        }
    }

    @Override
    public List<IndicatorDTO> getIndicatorsForProcess(Long processId) {
        Optional<Process> process = processRepository.findById(processId);
        if (!process.isPresent()) {
            throw new IllegalArgumentException("Process with id " + processId + " does not exist.");
        }

        List<Indicator> indicators = indicatorRepository.findAll().stream()
                .filter(ind -> ind.getObjective() != null && ind.getObjective().getProcess() != null
                        && ind.getObjective().getProcess().getId().equals(processId))
                .collect(Collectors.toList());

        return indicators.stream()
                .map(ind -> {
                    IndicatorDTO dto = new IndicatorDTO();
                    dto.setIdIndicateur(ind.getIdIndicateur());
                    dto.setCode(ind.getCode());
                    dto.setLibelle(ind.getLibelle());
                    dto.setFrequence(ind.getFrequence());
                    dto.setUnite(ind.getUnite());
                    dto.setCible(ind.getCible());
                    List<Non_Conformity> nonConformities = nonConformityRepository.findByIndicator(ind);
                    long totalActions = nonConformities.size();
                    long completedActions = nonConformities.stream()
                            .filter(nc -> "FIXED".equalsIgnoreCase(nc.getStatus()))
                            .count();
                    double currentValue = totalActions > 0 ? ((double) completedActions / totalActions) * 100 : 0.0;
                    log.info("Indicator: {}, Total Actions: {}, Completed Actions: {}, Current Value: {}",
                            ind.getCode(), totalActions, completedActions, currentValue);
                    dto.setCurrentValue(currentValue);
                    dto.setStatus(currentValue >= ind.getCible() ? "OK" : "CRITICAL");
                    dto.setActif(ind.getActif());
                    dto.setMethodeCalcul(null);
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<IndicatorDTO> getAllIndicatorsDTO() {
        return indicatorRepository.findAll().stream()
                .map(ind -> {
                    IndicatorDTO dto = new IndicatorDTO();
                    dto.setIdIndicateur(ind.getIdIndicateur());
                    dto.setCode(ind.getCode());
                    dto.setLibelle(ind.getLibelle());
                    dto.setFrequence(ind.getFrequence());
                    dto.setUnite(ind.getUnite());
                    dto.setCible(ind.getCible());
                    List<Non_Conformity> nonConformities = nonConformityRepository.findByIndicator(ind);
                    long totalActions = nonConformities.size();
                    long completedActions = nonConformities.stream()
                            .filter(nc -> "FIXED".equalsIgnoreCase(nc.getStatus()))
                            .count();
                    double currentValue = totalActions > 0 ? ((double) completedActions / totalActions) * 100 : 0.0;
                    log.info("Indicator: {}, Total Actions: {}, Completed Actions: {}, Current Value: {}",
                            ind.getCode(), totalActions, completedActions, currentValue);
                    dto.setCurrentValue(currentValue);
                    dto.setStatus(currentValue >= ind.getCible() ? "OK" : "CRITICAL");
                    dto.setActif(ind.getActif());
                    dto.setMethodeCalcul(null);
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public void recalculateAllIndicators() {
        List<Indicator> indicators = indicatorRepository.findAll();
        for (Indicator indicator : indicators) {
            updateIndicatorValue(indicator.getCode());
        }
    }

    @Scheduled(fixedDelay = 60000) // Runs every minute
    public void scheduledRecalculateAllIndicators() {
        log.info("Running scheduled recalculation of all indicators at {}", new Date());
        recalculateAllIndicators();
    }
}
