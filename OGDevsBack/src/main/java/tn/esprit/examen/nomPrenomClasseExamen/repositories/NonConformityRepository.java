// NonConformityRepository.java
package tn.esprit.examen.nomPrenomClasseExamen.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Indicator;
import tn.esprit.examen.nomPrenomClasseExamen.entities.NonConformitySource;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Non_Conformity;

import java.util.List;
import java.util.Optional;

public interface NonConformityRepository extends JpaRepository<Non_Conformity, Long> {
    List<Non_Conformity> findByIndicatorIdIndicateur(Long indicatorId);
    List<Non_Conformity> findByIndicator (Indicator ind);
    @Query("SELECT nc FROM Non_Conformity nc WHERE nc.source = :source AND nc.indicator.code = :indicatorCode AND nc.status = 'OPEN'")
    Optional<Non_Conformity> findBySourceAndIndicatorCodeAndStatusOpen(@Param("source") NonConformitySource source, @Param("indicatorCode") String indicatorCode);


    @Query("SELECT COUNT(nc) FROM Non_Conformity nc WHERE nc.actionTaken IS NOT NULL AND nc.actionTaken != '' AND nc.status = 'CLOSED'")
    long countByActionTakenNotNullAndStatus(String status);
}


