package tn.esprit.examen.nomPrenomClasseExamen.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.examen.nomPrenomClasseExamen.entities.ProjetRequest;
import tn.esprit.examen.nomPrenomClasseExamen.entities.StatutRequestProjet;
import tn.esprit.examen.nomPrenomClasseExamen.entities.UserEntity;

import java.util.List;

public interface ProjetRequestRepository extends JpaRepository<ProjetRequest, Long> {

    // Recherche des ProjetRequest par client (UserEntity)
    List<ProjetRequest> findByClient(UserEntity client);

    // Recherche des ProjetRequest par client et statut
    List<ProjetRequest> findByClientAndStatut(UserEntity client, StatutRequestProjet statut);
}