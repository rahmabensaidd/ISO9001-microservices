package tn.esprit.examen.nomPrenomClasseExamen.services;

import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.examen.nomPrenomClasseExamen.dto.ContractClientDTO;
import tn.esprit.examen.nomPrenomClasseExamen.entities.ContractClient;
import tn.esprit.examen.nomPrenomClasseExamen.entities.UserEntity;
import tn.esprit.examen.nomPrenomClasseExamen.entities.ContractClient.ContractStatus;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.ContractClientRepository;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.UserEntityRepository;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class ContractClientServiceImpl implements ContractClientService {

    private final ContractClientRepository contractClientRepository;
    private final UserEntityRepository userEntityRepository;

    public ContractClientServiceImpl(ContractClientRepository contractClientRepository, UserEntityRepository userEntityRepository) {
        this.contractClientRepository = contractClientRepository;
        this.userEntityRepository = userEntityRepository;
    }

    @Transactional
    @Override
    public ContractClientDTO createContract(ContractClientDTO contractDTO) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<UserEntity> userOpt = userEntityRepository.findById(userId);
        if (!userOpt.isPresent()) {
            log.error("Utilisateur non trouvé : userId={}", userId);
            throw new RuntimeException("Utilisateur connecté non trouvé (ID: " + userId + ").");
        }

        UserEntity user = userOpt.get();
        boolean isAdmin = user.getRoles().stream()
                .anyMatch(role -> "ROLE_ADMIN".equals(role.getRoleName()));
        if (!isAdmin) {
            log.error("Accès refusé : ROLE_ADMIN requis : userId={}", userId);
            throw new RuntimeException("Accès refusé : ROLE_ADMIN requis.");
        }

        Optional<UserEntity> clientOpt = userEntityRepository.findById(contractDTO.getClientId());
        if (!clientOpt.isPresent()) {
            log.error("Client non trouvé : clientId={}", contractDTO.getClientId());
            throw new RuntimeException("Client non trouvé (ID: " + contractDTO.getClientId() + ").");
        }

        UserEntity client = clientOpt.get();
        ContractClient contract = new ContractClient();
        contract.setContractNumber(contractDTO.getContractNumber());
        contract.setTitle(contractDTO.getTitle());
        contract.setValue(contractDTO.getValue());
        contract.setStartDate(LocalDate.parse(contractDTO.getStartDate()));
        contract.setEndDate(LocalDate.parse(contractDTO.getEndDate()));
        contract.setStatus(ContractStatus.valueOf(contractDTO.getStatus()));
        contract.setClient(client);
        contract.setSignature(contractDTO.getSignature()); // Allow signature during creation (admin only)

        ContractClient savedContract = contractClientRepository.save(contract);
        log.info("Contrat créé : contractId={}", savedContract.getId());
        return new ContractClientDTO(savedContract);
    }

    @Override
    public List<ContractClientDTO> getAllContracts() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<UserEntity> userOpt = userEntityRepository.findById(userId);
        if (!userOpt.isPresent()) {
            log.error("Utilisateur non trouvé : userId={}", userId);
            throw new RuntimeException("Utilisateur connecté non trouvé (ID: " + userId + ").");
        }

        UserEntity user = userOpt.get();
        boolean isAdmin = user.getRoles().stream()
                .anyMatch(role -> "ROLE_ADMIN".equals(role.getRoleName()));

        List<ContractClient> contracts;
        if (isAdmin) {
            contracts = contractClientRepository.findAll();
        } else {
            contracts = contractClientRepository.findByClientId(userId);
        }

        return contracts.stream()
                .map(ContractClientDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    public ContractClientDTO getContractById(Long id) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<UserEntity> userOpt = userEntityRepository.findById(userId);
        if (!userOpt.isPresent()) {
            log.error("Utilisateur non trouvé : userId={}", userId);
            throw new RuntimeException("Utilisateur connecté non trouvé (ID: " + userId + ").");
        }

        UserEntity user = userOpt.get();
        boolean isAdmin = user.getRoles().stream()
                .anyMatch(role -> "ROLE_ADMIN".equals(role.getRoleName()));
        boolean isClient = user.getRoles().stream()
                .anyMatch(role -> "ROLE_CLIENT".equals(role.getRoleName()));

        ContractClient contract = contractClientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contrat non trouvé (ID: " + id + ")."));

        if (!isAdmin && !(isClient && contract.getClient().getId().equals(userId))) {
            log.error("Accès refusé : utilisateur non autorisé : userId={}", userId);
            throw new RuntimeException("Accès refusé : vous n'êtes pas autorisé à consulter ce contrat.");
        }

        return new ContractClientDTO(contract);
    }

    @Transactional
    @Override
    public ContractClientDTO updateContract(Long id, ContractClientDTO contractDTO) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<UserEntity> userOpt = userEntityRepository.findById(userId);
        if (!userOpt.isPresent()) {
            log.error("Utilisateur non trouvé : userId={}", userId);
            throw new RuntimeException("Utilisateur connecté non trouvé (ID: " + userId + ").");
        }

        UserEntity user = userOpt.get();
        boolean isAdmin = user.getRoles().stream()
                .anyMatch(role -> "ROLE_ADMIN".equals(role.getRoleName()));
        boolean isClient = user.getRoles().stream()
                .anyMatch(role -> "ROLE_CLIENT".equals(role.getRoleName()));

        ContractClient contract = contractClientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contrat non trouvé (ID: " + id + ")."));

        // Check if the user is authorized
        if (!isAdmin && !(isClient && contract.getClient().getId().equals(userId))) {
            log.error("Accès refusé : utilisateur non autorisé : userId={}", userId);
            throw new RuntimeException("Accès refusé : vous n'êtes pas autorisé à modifier ce contrat.");
        }

        // Admins can update all fields
        if (isAdmin) {
            Optional<UserEntity> clientOpt = userEntityRepository.findById(contractDTO.getClientId());
            if (!clientOpt.isPresent()) {
                log.error("Client non trouvé : clientId={}", contractDTO.getClientId());
                throw new RuntimeException("Client non trouvé (ID: " + contractDTO.getClientId() + ").");
            }
            contract.setContractNumber(contractDTO.getContractNumber());
            contract.setTitle(contractDTO.getTitle());
            contract.setValue(contractDTO.getValue());
            if (contractDTO.getStartDate() != null) {
                contract.setStartDate(LocalDate.parse(contractDTO.getStartDate()));
            }
            if (contractDTO.getEndDate() != null) {
                contract.setEndDate(LocalDate.parse(contractDTO.getEndDate()));
            }
            if (contractDTO.getStatus() != null) {
                contract.setStatus(ContractStatus.valueOf(contractDTO.getStatus()));
            }
            contract.setClient(clientOpt.get());
            contract.setSignature(contractDTO.getSignature());
        } else if (isClient) {
            // Clients can only update the signature field
            if (contractDTO.getSignature() == null && contract.getSignature() != null) {
                log.error("Signature absente ou nulle dans la requête : userId={}", userId);
                throw new RuntimeException("La signature ne peut pas être supprimée par le client.");
            }
            contract.setSignature(contractDTO.getSignature());
        }

        ContractClient updatedContract = contractClientRepository.save(contract);
        log.info("Contrat mis à jour : contractId={}, userId={}", updatedContract.getId(), userId);
        return new ContractClientDTO(updatedContract);
    }
    @Transactional
    @Override
    public void deleteContract(Long id) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<UserEntity> userOpt = userEntityRepository.findById(userId);
        if (!userOpt.isPresent()) {
            log.error("Utilisateur non trouvé : userId={}", userId);
            throw new RuntimeException("Utilisateur connecté non trouvé (ID: " + userId + ").");
        }

        UserEntity user = userOpt.get();
        boolean isAdmin = user.getRoles().stream()
                .anyMatch(role -> "ROLE_ADMIN".equals(role.getRoleName()));
        if (!isAdmin) {
            log.error("Accès refusé : ROLE_ADMIN requis : userId={}", userId);
            throw new RuntimeException("Accès refusé : ROLE_ADMIN requis.");
        }

        ContractClient contract = contractClientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contrat non trouvé (ID: " + id + ")."));
        contractClientRepository.delete(contract);
        log.info("Contrat supprimé : contractId={}", id);
    }

    @Override
    public Map<String, Long> getContractsByStatus() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<UserEntity> userOpt = userEntityRepository.findById(userId);
        if (!userOpt.isPresent()) {
            log.error("Utilisateur non trouvé : userId={}", userId);
            throw new RuntimeException("Utilisateur connecté non trouvé (ID: " + userId + ").");
        }

        UserEntity user = userOpt.get();
        boolean isAdmin = user.getRoles().stream()
                .anyMatch(role -> "ROLE_ADMIN".equals(role.getRoleName()));
        if (!isAdmin) {
            log.error("Accès refusé : ROLE_ADMIN requis : userId={}", userId);
            throw new RuntimeException("Accès refusé : ROLE_ADMIN requis.");
        }

        List<ContractClient> contracts = contractClientRepository.findAll();
        return contracts.stream()
                .collect(Collectors.groupingBy(
                        contract -> contract.getStatus().name(),
                        Collectors.counting()
                ));
    }

    @Override
    public Map<String, Long> getContractsByClient() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<UserEntity> userOpt = userEntityRepository.findById(userId);
        if (!userOpt.isPresent()) {
            log.error("Utilisateur non trouvé : userId={}", userId);
            throw new RuntimeException("Utilisateur connecté non trouvé (ID: " + userId + ").");
        }

        UserEntity user = userOpt.get();
        boolean isAdmin = user.getRoles().stream()
                .anyMatch(role -> "ROLE_ADMIN".equals(role.getRoleName()));
        if (!isAdmin) {
            log.error("Accès refusé : ROLE_ADMIN requis : userId={}", userId);
            throw new RuntimeException("Accès refusé : ROLE_ADMIN requis.");
        }

        List<ContractClient> contracts = contractClientRepository.findAll();
        return contracts.stream()
                .collect(Collectors.groupingBy(
                        contract -> contract.getClient().getId(),
                        Collectors.counting()
                ));
    }

    @Override
    public List<ContractClientDTO> getContractsByEcheance(LocalDate startDate, LocalDate endDate) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<UserEntity> userOpt = userEntityRepository.findById(userId);
        if (!userOpt.isPresent()) {
            log.error("Utilisateur non trouvé : userId={}", userId);
            throw new RuntimeException("Utilisateur connecté non trouvé (ID: " + userId + ").");
        }

        UserEntity user = userOpt.get();
        boolean isAdmin = user.getRoles().stream()
                .anyMatch(role -> "ROLE_ADMIN".equals(role.getRoleName()));
        if (!isAdmin) {
            log.error("Accès refusé : ROLE_ADMIN requis : userId={}", userId);
            throw new RuntimeException("Accès refusé : ROLE_ADMIN requis.");
        }

        List<ContractClient> contracts = contractClientRepository.findByEndDateBetween(startDate, endDate);
        return contracts.stream()
                .map(ContractClientDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    public Map<Long, Map<String, Object>> analyzeContractsPerformance() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<UserEntity> userOpt = userEntityRepository.findById(userId);
        if (!userOpt.isPresent()) {
            log.error("Utilisateur non trouvé : userId={}", userId);
            throw new RuntimeException("Utilisateur connecté non trouvé (ID: " + userId + ").");
        }

        UserEntity user = userOpt.get();
        boolean isAdmin = user.getRoles().stream()
                .anyMatch(role -> "ROLE_ADMIN".equals(role.getRoleName()));
        if (!isAdmin) {
            log.error("Accès refusé : ROLE_ADMIN requis : userId={}", userId);
            throw new RuntimeException("Accès refusé : ROLE_ADMIN requis.");
        }

        List<ContractClient> contracts = contractClientRepository.findAll();
        Map<Long, Map<String, Object>> performanceAnalysis = new HashMap<>();
        for (ContractClient contract : contracts) {
            Map<String, Object> analysis = new HashMap<>();
            analysis.put("averageScore", new Random().nextDouble() * 5);
            analysis.put("alert", analysis.get("averageScore") instanceof Double && (Double) analysis.get("averageScore") < 2.5 ? "Performance faible" : "Performance acceptable");
            List<Map<String, Object>> scoreHistory = new ArrayList<>();
            for (int i = 0; i < 5; i++) {
                Map<String, Object> scoreEntry = new HashMap<>();
                scoreEntry.put("date", LocalDate.now().minusDays(i).toString());
                scoreEntry.put("score", new Random().nextDouble() * 5);
                scoreHistory.add(scoreEntry);
            }
            analysis.put("scoreHistory", scoreHistory);
            performanceAnalysis.put(contract.getId(), analysis);
        }

        return performanceAnalysis;
    }

    @Override
    public List<ContractClient> getContractsByCurrentUser() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<UserEntity> userOpt = userEntityRepository.findById(userId);
        if (!userOpt.isPresent()) {
            log.error("Utilisateur non trouvé : userId={}", userId);
            throw new RuntimeException("Utilisateur connecté non trouvé (ID: " + userId + ").");
        }
        UserEntity client = userOpt.get();
        List<ContractClient> contracts = contractClientRepository.findByClient(client);
        log.info("Contrats récupérés pour l'utilisateur courant : userId={}, nombre={}", userId, contracts.size());
        return contracts;
    }
}