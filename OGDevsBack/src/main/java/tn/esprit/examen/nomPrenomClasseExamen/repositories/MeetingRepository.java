package tn.esprit.examen.nomPrenomClasseExamen.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Meeting;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Project;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Ticket;
import tn.esprit.examen.nomPrenomClasseExamen.entities.UserEntity;

import java.util.List;

@Repository
public interface MeetingRepository extends JpaRepository<Meeting, Long> {
    List<Meeting> findByClientId(String clientId);
    List<Meeting> findByClient(UserEntity client);
}