package tn.esprit.examen.nomPrenomClasseExamen.controllers;

import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.examen.nomPrenomClasseExamen.dto.ContractClientDTO;
import tn.esprit.examen.nomPrenomClasseExamen.entities.ContractClient;
import tn.esprit.examen.nomPrenomClasseExamen.services.ContractClientService;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/contracts")
public class ContractClientController {

    private final ContractClientService contractClientService;

    public ContractClientController(ContractClientService contractClientService) {
        this.contractClientService = contractClientService;
    }

    @PostMapping
    public ResponseEntity<ContractClientDTO> createContract(@RequestBody ContractClientDTO contractDTO) {
        log.debug("Requête pour créer un contrat : {}", contractDTO);
        ContractClientDTO createdContract = contractClientService.createContract(contractDTO);
        log.info("Contrat créé avec succès : ID={}", createdContract.getId());
        return ResponseEntity.ok(createdContract);
    }

    @GetMapping
    public ResponseEntity<List<ContractClientDTO>> getAllContracts() {
        log.debug("Requête pour récupérer les contrats");
        List<ContractClientDTO> contracts = contractClientService.getAllContracts();
        log.info("Contrats récupérés : nombre={}", contracts.size());
        return ResponseEntity.ok(contracts);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContractClientDTO> getContractById(@PathVariable Long id) {
        log.debug("Requête pour récupérer le contrat ID : {}", id);
        ContractClientDTO contract = contractClientService.getContractById(id);
        log.info("Contrat récupéré avec succès : ID={}", id);
        return ResponseEntity.ok(contract);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContractClientDTO> updateContract(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        log.debug("Requête pour mettre à jour le contrat ID : {} avec données : {}", id, updates);
        try {
            ContractClientDTO contractDTO = contractClientService.getContractById(id);
            if (contractDTO == null) {
                log.error("Contrat non trouvé : ID={}", id);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            // Update only provided fields
            if (updates.containsKey("signature")) {
                contractDTO.setSignature((String) updates.get("signature"));
                log.debug("Mise à jour de la signature pour le contrat ID : {}", id);
            } else {
                log.error("Signature absente dans la requête pour le contrat ID : {}", id);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
            }

            // For admins, allow updating other fields
            if (updates.containsKey("contractNumber")) {
                contractDTO.setContractNumber((String) updates.get("contractNumber"));
            }
            if (updates.containsKey("title")) {
                contractDTO.setTitle((String) updates.get("title"));
            }
            if (updates.containsKey("value")) {
                contractDTO.setValue(((Number) updates.get("value")).doubleValue());
            }
            if (updates.containsKey("startDate")) {
                contractDTO.setStartDate((String) updates.get("startDate"));
            }
            if (updates.containsKey("endDate")) {
                contractDTO.setEndDate((String) updates.get("endDate"));
            }
            if (updates.containsKey("status")) {
                contractDTO.setStatus((String) updates.get("status"));
            }
            if (updates.containsKey("clientId")) {
                contractDTO.setClientId((String) updates.get("clientId"));
            }

            ContractClientDTO updatedContract = contractClientService.updateContract(id, contractDTO);
            log.info("Contrat mis à jour avec succès : ID={}", id);
            return ResponseEntity.ok(updatedContract);
        } catch (Exception e) {
            log.error("Erreur lors de la mise à jour du contrat ID : {} - {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContract(@PathVariable Long id) {
        log.debug("Requête pour supprimer le contrat ID : {}", id);
        contractClientService.deleteContract(id);
        log.info("Contrat supprimé avec succès : ID={}", id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/stats/by-status")
    public ResponseEntity<Map<String, Long>> getContractsByStatus() {
        log.debug("Requête pour les statistiques par statut");
        Map<String, Long> stats = contractClientService.getContractsByStatus();
        log.info("Statistiques par statut récupérées : {}", stats);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/stats/by-client")
    public ResponseEntity<Map<String, Long>> getContractsByClient() {
        log.debug("Requête pour les statistiques par client");
        Map<String, Long> stats = contractClientService.getContractsByClient();
        log.info("Statistiques par client récupérées : {}", stats);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/stats/by-echeance")
    public ResponseEntity<List<ContractClientDTO>> getContractsByEcheance(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.debug("Requête pour les contrats par échéance : startDate={}, endDate={}", startDate, endDate);
        List<ContractClientDTO> contracts = contractClientService.getContractsByEcheance(startDate, endDate);
        log.info("Contrats par échéance récupérés : nombre={}", contracts.size());
        return ResponseEntity.ok(contracts);
    }

    @GetMapping("/performance")
    public ResponseEntity<Map<Long, Map<String, Object>>> analyzeContractsPerformance() {
        log.debug("Requête pour l'analyse de performance des contrats");
        Map<Long, Map<String, Object>> performance = contractClientService.analyzeContractsPerformance();
        log.info("Analyse de performance récupérée : nombre de contrats={}", performance.size());
        return ResponseEntity.ok(performance);
    }

    @GetMapping("/current-user")
    public ResponseEntity<List<ContractClientDTO>> getContractsByCurrentUser() {
        try {
            List<ContractClient> contracts = contractClientService.getContractsByCurrentUser();
            log.debug("Contrats récupérés pour l'utilisateur courant : {}", contracts);
            List<ContractClientDTO> contractDTOs = contracts.stream()
                    .map(ContractClientDTO::new)
                    .collect(Collectors.toList());
            log.info("Contrats récupérés pour l'utilisateur courant : nombre={}", contractDTOs.size());
            return ResponseEntity.ok(contractDTOs);
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des contrats pour l'utilisateur courant : {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}