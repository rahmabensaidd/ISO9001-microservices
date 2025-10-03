package tn.esprit.examen.nomPrenomClasseExamen.services;

import tn.esprit.examen.nomPrenomClasseExamen.dto.ContractClientDTO;
import tn.esprit.examen.nomPrenomClasseExamen.entities.ContractClient;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface ContractClientService {
    ContractClientDTO createContract(ContractClientDTO contractDTO);
    List<ContractClientDTO> getAllContracts();
    ContractClientDTO getContractById(Long id);
    ContractClientDTO updateContract(Long id, ContractClientDTO contractDTO);
    void deleteContract(Long id);
    Map<String, Long> getContractsByStatus();
    Map<String, Long> getContractsByClient();
    List<ContractClientDTO> getContractsByEcheance(LocalDate startDate, LocalDate endDate);
    Map<Long, Map<String, Object>> analyzeContractsPerformance();

    List<ContractClient> getContractsByCurrentUser();
}