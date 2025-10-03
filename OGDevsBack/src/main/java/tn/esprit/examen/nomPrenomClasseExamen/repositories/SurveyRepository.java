package tn.esprit.examen.nomPrenomClasseExamen.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Survey;
import java.time.LocalDateTime;
import java.util.List;

public interface SurveyRepository extends JpaRepository<Survey, Long> {
    // Trouver les sondages par ID de l'utilisateur qui les a remplis
    List<Survey> findByFilledById(String userId);

    // Trouver les sondages par plage de dates
    List<Survey> findByResponseDateBetween(LocalDateTime start, LocalDateTime end);

    // Compter le nombre de sondages soumis par un utilisateur (pour la gamification)
    @Query("SELECT COUNT(s) FROM Survey s WHERE s.filledBy.id = :userId")
    long countByFilledById(@Param("userId") String userId);

    // Trouver les sondages avec un sentiment spécifique (pour l'analyse avancée)
    @Query("SELECT s FROM Survey s WHERE s.sentiment = :sentiment")
    List<Survey> findBySentiment(@Param("sentiment") String sentiment);

    // Trouver les sondages avec feedback non vide (optionnel pour l'analyse)
    @Query("SELECT s FROM Survey s WHERE s.feedback IS NOT NULL AND TRIM(s.feedback) != ''")
    List<Survey> findWithFeedback();
}