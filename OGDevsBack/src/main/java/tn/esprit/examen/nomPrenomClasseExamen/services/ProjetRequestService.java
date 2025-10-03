package tn.esprit.examen.nomPrenomClasseExamen.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;
import tn.esprit.examen.nomPrenomClasseExamen.entities.*;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.*;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service

public class ProjetRequestService {

    private final ProjetRequestRepository projetRequestRepository;
    private final UserEntityRepository userEntityRepository;
    private final ProjectRepository projectRepository;
    private final IndicatorRepository indicatorRepository;
    private final UserRepository userRepositoryy;

    public ProjetRequestService(
            ProjetRequestRepository projetRequestRepository,
            UserEntityRepository userEntityRepository,
            ProjectRepository projectRepository,
            IndicatorRepository indicatorRepository, UserRepository userRepositoryy
    ) {
        this.projetRequestRepository = projetRequestRepository;
        this.userEntityRepository = userEntityRepository;
        this.projectRepository = projectRepository;
        this.indicatorRepository = indicatorRepository;
        this.userRepositoryy = userRepositoryy;
    }

    private Double calculerHeuresPrevues(LocalDate startDate, LocalDate endDate) {
        long days = ChronoUnit.DAYS.between(startDate, endDate) + 1;
        double workingDays = days * 5.0 / 7.0;
        double estimatedHours = Math.round(workingDays) * 8.0;
        return estimatedHours / 2.0;
    }

    @Transactional
    public String createProjetRequest(Map<String, Object> projetRequestData) {
        Object budgetObj = projetRequestData.get("budgetProposedByClient");
        String desiredStartDateStr = (String) projetRequestData.get("desiredStartDate");
        String desiredEndDateStr = (String) projetRequestData.get("desiredEndDate");
        String description = (String) projetRequestData.get("description");

        double budgetProposedByClient = budgetObj instanceof Number ?
                ((Number) budgetObj).doubleValue() :
                Double.parseDouble(budgetObj.toString());
        LocalDate desiredStartDate = LocalDate.parse(desiredStartDateStr);
        LocalDate desiredEndDate = LocalDate.parse(desiredEndDateStr);

        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<UserEntity> userOpt = userEntityRepository.findById(userId);
        if (!userOpt.isPresent()) {
            log.error("Utilisateur non trouvé : userId={}", userId);
            return "Erreur : Utilisateur connecté non trouvé (ID: " + userId + ").";
        }

        UserEntity client = userOpt.get();
        boolean isClient = client.getRoles().stream()
                .anyMatch(role -> "ROLE_CLIENT".equals(role.getRoleName()));
        if (!isClient) {
            log.error("L'utilisateur n'a pas le rôle ROLE_CLIENT : userId={}", userId);
            return "Erreur : L'utilisateur connecté n'est pas un client (ROLE_CLIENT requis).";
        }

        ProjetRequest projetRequest = new ProjetRequest();
        projetRequest.setEmail(client.getEmail());
        projetRequest.setBudgetProposedByClient(budgetProposedByClient);
        projetRequest.setDesiredStartDate(desiredStartDate);
        projetRequest.setDesiredEndDate(desiredEndDate);
        projetRequest.setDescription(description != null ? description : "");
        projetRequest.setStatut(StatutRequestProjet.EN_ATTENTE);
        projetRequest.setHeuresPrevues(calculerHeuresPrevues(desiredStartDate, desiredEndDate));
        projetRequest.setClient(client);

        try {
            projetRequestRepository.save(projetRequest);
            log.info("ProjetRequest créé avec succès : id={}", projetRequest.getId());
            return "ProjetRequest créé avec succès avec ID : " + projetRequest.getId();
        } catch (Exception e) {
            log.error("Erreur lors de la sauvegarde de ProjetRequest : {}", e.getMessage());
            return "Erreur : Échec de la création de ProjetRequest : " + e.getMessage();
        }
    }

    @Transactional(readOnly = true)
    public Optional<ProjetRequest> getProjetRequestById(Long id) {
        Optional<ProjetRequest> projetRequestOpt = projetRequestRepository.findById(id);
        if (!projetRequestOpt.isPresent()) {
            log.debug("ProjetRequest non trouvé : id={}", id);
            return Optional.empty();
        }

        ProjetRequest projetRequest = projetRequestOpt.get();
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<UserEntity> userOpt = userEntityRepository.findById(userId);
        if (!userOpt.isPresent()) {
            log.error("Utilisateur non trouvé pour getProjetRequestById : userId={}", userId);
            throw new RuntimeException("Utilisateur connecté non trouvé (ID: " + userId + ").");
        }

        UserEntity currentUser = userOpt.get();
        boolean isAdmin = currentUser.getRoles().stream()
                .anyMatch(role -> "ROLE_ADMIN".equals(role.getRoleName()));
        if (!isAdmin && !projetRequest.getClient().getId().equals(currentUser.getId())) {
            log.error("Utilisateur non autorisé à accéder au ProjetRequest : userId={}, projetRequestId={}", userId, id);
            return Optional.empty();
        }

        return projetRequestOpt;
    }

    @Transactional(readOnly = true)
    public List<ProjetRequest> getAllProjetRequestsForAdmin() {
        List<ProjetRequest> projetRequests = projetRequestRepository.findAll();
        log.info("Tous les ProjetRequests listés pour l'admin : {}", projetRequests.size());
        return projetRequests;
    }

    @Transactional(readOnly = true)
    public List<ProjetRequest> getProjetRequestsByCurrentUser() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<UserEntity> userOpt = userEntityRepository.findById(userId);
        if (!userOpt.isPresent()) {
            log.error("Utilisateur non trouvé pour getProjetRequestsByCurrentUser : userId={}", userId);
            throw new RuntimeException("Utilisateur connecté non trouvé (ID: " + userId + ").");
        }
        UserEntity client = userOpt.get();
        return projetRequestRepository.findByClient(client);
    }

    @Transactional
    public String updateProjetRequest(Long id, Map<String, Object> projetRequestData) {
        Optional<ProjetRequest> projetRequestOpt = projetRequestRepository.findById(id);
        if (!projetRequestOpt.isPresent()) {
            return "Erreur : ProjetRequest avec ID " + id + " non trouvé.";
        }

        ProjetRequest projetRequest = projetRequestOpt.get();
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<UserEntity> userOpt = userEntityRepository.findById(userId);
        if (!userOpt.isPresent()) {
            return "Erreur : Utilisateur connecté non trouvé (ID: " + userId + ").";
        }

        UserEntity currentUser = userOpt.get();
        if (!projetRequest.getClient().getId().equals(currentUser.getId())) {
            return "Erreur : Vous n'êtes pas autorisé à modifier ce ProjetRequest.";
        }

        Object budgetObj = projetRequestData.get("budgetProposedByClient");
        String desiredStartDateStr = (String) projetRequestData.get("desiredStartDate");
        String desiredEndDateStr = (String) projetRequestData.get("desiredEndDate");
        String description = (String) projetRequestData.get("description");

        boolean recalculerHeures = false;
        if (budgetObj != null) {
            double budget = budgetObj instanceof Number ?
                    ((Number) budgetObj).doubleValue() :
                    Double.parseDouble(budgetObj.toString());
            projetRequest.setBudgetProposedByClient(budget);
        }

        if (desiredStartDateStr != null) {
            LocalDate desiredStartDate = LocalDate.parse(desiredStartDateStr);
            projetRequest.setDesiredStartDate(desiredStartDate);
            recalculerHeures = true;
        }

        if (desiredEndDateStr != null) {
            LocalDate desiredEndDate = LocalDate.parse(desiredEndDateStr);
            projetRequest.setDesiredEndDate(desiredEndDate);
            recalculerHeures = true;
        }

        if (description != null) {
            projetRequest.setDescription(description);
        }

        if (recalculerHeures) {
            projetRequest.setHeuresPrevues(calculerHeuresPrevues(
                    projetRequest.getDesiredStartDate(),
                    projetRequest.getDesiredEndDate()));
        }

        try {
            projetRequestRepository.save(projetRequest);
            return "ProjetRequest avec ID " + id + " mis à jour avec succès !";
        } catch (Exception e) {
            log.error("Erreur lors de la mise à jour de ProjetRequest : id={}, erreur={}", id, e.getMessage());
            return "Erreur : Échec de la mise à jour de ProjetRequest : " + e.getMessage();
        }
    }

    @Transactional
    public String updateProjetRequestForAdmin(Long id, Map<String, Object> projetRequestData) {
        Optional<ProjetRequest> projetRequestOpt = projetRequestRepository.findById(id);
        if (!projetRequestOpt.isPresent()) {
            return "Erreur : ProjetRequest avec ID " + id + " non trouvé.";
        }

        ProjetRequest projetRequest = projetRequestOpt.get();
        Object budgetObj = projetRequestData.get("budgetProposedByClient");
        String desiredStartDateStr = (String) projetRequestData.get("desiredStartDate");
        String desiredEndDateStr = (String) projetRequestData.get("desiredEndDate");
        String description = (String) projetRequestData.get("description");
        String statutStr = (String) projetRequestData.get("statut");

        boolean recalculerHeures = false;
        if (budgetObj != null) {
            double budget = budgetObj instanceof Number ?
                    ((Number) budgetObj).doubleValue() :
                    Double.parseDouble(budgetObj.toString());
            projetRequest.setBudgetProposedByClient(budget);
        }

        if (desiredStartDateStr != null) {
            LocalDate desiredStartDate = LocalDate.parse(desiredStartDateStr);
            projetRequest.setDesiredStartDate(desiredStartDate);
            recalculerHeures = true;
        }

        if (desiredEndDateStr != null) {
            LocalDate desiredEndDate = LocalDate.parse(desiredEndDateStr);
            projetRequest.setDesiredEndDate(desiredEndDate);
            recalculerHeures = true;
        }

        if (description != null) {
            projetRequest.setDescription(description);
        }

        if (statutStr != null) {
            StatutRequestProjet statut = StatutRequestProjet.valueOf(statutStr.toUpperCase());
            projetRequest.setStatut(statut);
        }

        if (recalculerHeures) {
            projetRequest.setHeuresPrevues(calculerHeuresPrevues(
                    projetRequest.getDesiredStartDate(),
                    projetRequest.getDesiredEndDate()));
        }

        try {
            projetRequestRepository.save(projetRequest);
            log.info("ProjetRequest avec ID {} mis à jour par l'admin.", id);
            return "ProjetRequest avec ID " + id + " mis à jour avec succès par l'admin !";
        } catch (Exception e) {
            log.error("Erreur lors de la mise à jour de ProjetRequest : id={}, erreur={}", id, e.getMessage());
            return "Erreur : Échec de la mise à jour de ProjetRequest : " + e.getMessage();
        }
    }

    @Transactional
    public String deleteProjetRequest(Long id) {
        Optional<ProjetRequest> projetRequestOpt = projetRequestRepository.findById(id);
        if (!projetRequestOpt.isPresent()) {
            return "Erreur : ProjetRequest avec ID " + id + " non trouvé.";
        }

        ProjetRequest projetRequest = projetRequestOpt.get();
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<UserEntity> userOpt = userEntityRepository.findById(userId);
        if (!userOpt.isPresent()) {
            return "Erreur : Utilisateur connecté non trouvé (ID: " + userId + ").";
        }

        UserEntity currentUser = userOpt.get();
        if (!projetRequest.getClient().getId().equals(currentUser.getId())) {
            return "Erreur : Vous n'êtes pas autorisé à supprimer ce ProjetRequest.";
        }

        try {
            projetRequestRepository.deleteById(id);
            return "ProjetRequest avec ID " + id + " supprimé avec succès !";
        } catch (Exception e) {
            log.error("Erreur lors de la suppression de ProjetRequest : id={}, erreur={}", id, e.getMessage());
            return "Erreur : Échec de la suppression de ProjetRequest : " + e.getMessage();
        }
    }

    @Transactional
    public String deleteProjetRequestForAdmin(Long id) {
        Optional<ProjetRequest> projetRequestOpt = projetRequestRepository.findById(id);
        if (!projetRequestOpt.isPresent()) {
            return "Erreur : ProjetRequest avec ID " + id + " non trouvé.";
        }

        try {
            projetRequestRepository.deleteById(id);
            log.info("ProjetRequest avec ID {} supprimé par l'admin.", id);
            return "ProjetRequest avec ID " + id + " supprimé avec succès par l'admin !";
        } catch (Exception e) {
            log.error("Erreur lors de la suppression de ProjetRequest : id={}, erreur={}", id, e.getMessage());
            return "Erreur : Échec de la suppression de ProjetRequest : " + e.getMessage();
        }
    }

    @Transactional
    public String acceptProjetRequest(Long id, String email) {
        Optional<ProjetRequest> projetRequestOpt = projetRequestRepository.findById(id);
        UserEntity Responsable=userRepositoryy.findByEmail(email).orElse(null);
        String clientname=projetRequestOpt.get().getClient().getUsername();
        if (!projetRequestOpt.isPresent()) {
            return "Erreur : ProjetRequest avec ID " + id + " non trouvé.";
        }

        ProjetRequest projetRequest = projetRequestOpt.get();
        projetRequest.setStatut(StatutRequestProjet.ACCEPTEE);
        Project project = new Project();

        project.setName("Project from client " +clientname);
        project.setDescription(projetRequest.getDescription());
        project.setStart_Date(projetRequest.getDesiredStartDate());
        project.setExpected_endDate(projetRequest.getDesiredEndDate());
        project.setClient(projetRequest.getClient());
        project.setHeuresRealisees(0.0);
        project.setResponsable(Responsable);

        try {
            projetRequestRepository.save(projetRequest);
            projectRepository.save(project);
            log.info("ProjetRequest accepté et Project créé : projetRequestId={}, projectId={}", id, project.getIdProjet());
            return "ProjetRequest avec ID " + id + " accepté et Project créé avec succès !";
        } catch (Exception e) {
            log.error("Erreur lors de l'acceptation de ProjetRequest : id={}, erreur={}", id, e.getMessage());
            return "Erreur : Échec de l'acceptation de ProjetRequest : " + e.getMessage();
        }
    }

    @Transactional
    public List<ProjectStatsDTO> getProjectStats() {
        List<Project> projects = projectRepository.findAll();
        List<ProjectStatsDTO> stats = projects.stream()
                .map(project -> {
                    UserEntity client = project.getClient();
                    if (client == null) return null;
                    Optional<ProjetRequest> projetRequestOpt = projetRequestRepository
                            .findByClientAndStatut(client, StatutRequestProjet.ACCEPTEE)
                            .stream()
                            .filter(pr -> project.getName().contains("Projet depuis requête " + pr.getId()))
                            .findFirst();
                    if (projetRequestOpt.isPresent()) {
                        ProjetRequest projetRequest = projetRequestOpt.get();
                        double tauxIndRet02 = projetRequest.getHeuresPrevues() != null && projetRequest.getHeuresPrevues() > 0 ?
                                project.getHeuresRealisees() / projetRequest.getHeuresPrevues() * 100 : 0.0;
                        return new ProjectStatsDTO(
                                project.getIdProjet(),
                                project.getName(),
                                projetRequest.getHeuresPrevues(),
                                project.getHeuresRealisees(),
                                tauxIndRet02
                        );
                    }
                    return null;
                })
                .filter(dto -> dto != null)
                .collect(Collectors.toList());

        if (!stats.isEmpty()) {
            double averageTauxIndRet02 = stats.stream()
                    .mapToDouble(ProjectStatsDTO::tauxIndRet02)
                    .average()
                    .orElse(0.0);
            Indicator indicator = indicatorRepository.findByCode("IND-RET-02");
            if (indicator != null) {
                indicator.setCurrentValue(averageTauxIndRet02);
                try {
                    indicatorRepository.save(indicator);
                    log.info("Indicateur IND-RET-02 mis à jour : currentValue={}", averageTauxIndRet02);
                } catch (Exception e) {
                    log.error("Erreur lors de la mise à jour de l'indicateur IND-RET-02 : {}", e.getMessage());
                }
            } else {
                log.warn("Indicateur IND-RET-02 non trouvé dans la base");
            }
        }

        return stats;
    }

    public record ProjectStatsDTO(
            Long id,
            String name,
            Double heuresPrevues,
            Double heuresRealisees,
            Double tauxIndRet02
    ) {}
}