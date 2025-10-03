package tn.esprit.examen.nomPrenomClasseExamen.repositories;

import tn.esprit.examen.nomPrenomClasseExamen.entities.ContractClient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tn.esprit.examen.nomPrenomClasseExamen.entities.UserEntity;

import java.time.LocalDate;
import java.util.List;

public interface ContractClientRepository extends JpaRepository<ContractClient, Long> {

    @Query("SELECT c FROM ContractClient c WHERE c.client.id = :clientId")
    List<ContractClient> findByClientId(@Param("clientId") String clientId);

    List<ContractClient> findByStatus(String status);

    List<ContractClient> findByEndDateBetween(LocalDate startDate, LocalDate endDate);

    @Query("SELECT c FROM ContractClient c WHERE c.endDate BETWEEN :startDate AND :endDate")
    List<ContractClient> findByEcheance(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT c.status, COUNT(c) FROM ContractClient c GROUP BY c.status")
    List<Object[]> countContractsByStatus();

    @Query("SELECT c.client.id, COUNT(c) FROM ContractClient c GROUP BY c.client.id")
    List<Object[]> countContractsByClient();

    boolean existsByContractNumber(String contractNumber);

    List<ContractClient> findByClient(UserEntity client);
}