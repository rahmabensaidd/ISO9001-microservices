package tn.esprit.examen.nomPrenomClasseExamen.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Document;
import tn.esprit.examen.nomPrenomClasseExamen.entities.TypeDocument;

import java.util.List;

public interface DocumentationRepository extends JpaRepository<Document, Long> {

    // Recherche par titre ou contenu (déjà existant)
    List<Document> findByTitleContainingIgnoreCaseOrContentContainingIgnoreCase(String title, String content);

    // Recherche par catégorie (déjà existant)
    List<Document> findByCategory(String category);

    // Documents par type
    List<Document> findByType(TypeDocument type);

    // Compter les documents par type
    @Query("SELECT d.type, COUNT(d) FROM Document d GROUP BY d.type")
    List<Object[]> countDocumentsByType();

    // Compter les documents par catégorie
    @Query("SELECT d.category, COUNT(d) FROM Document d GROUP BY d.category")
    List<Object[]> countDocumentsByCategory();

    // Compter les documents par mois de création
    @Query("SELECT CONCAT(FUNCTION('YEAR', d.dateCreation), '-', FUNCTION('MONTH', d.dateCreation)), COUNT(d) " +
            "FROM Document d WHERE d.dateCreation IS NOT NULL GROUP BY FUNCTION('YEAR', d.dateCreation), FUNCTION('MONTH', d.dateCreation)")
    List<Object[]> countDocumentsByCreationMonth();

    // Moyenne des salaires bruts pour les fiches de paie
    @Query("SELECT AVG(d.salaireBrut) FROM Document d WHERE d.type = :type AND d.salaireBrut IS NOT NULL")
    Double findAverageGrossSalaryByType(TypeDocument type);

    // Documents par utilisateur créateur
    @Query("SELECT d.createdBy.username, COUNT(d) FROM Document d WHERE d.createdBy IS NOT NULL GROUP BY d.createdBy.username")
    List<Object[]> countDocumentsByCreator();

    // Documents par période spécifique
    @Query("SELECT d FROM Document d WHERE d.dateCreation BETWEEN :startDate AND :endDate")
    List<Document> findByDateCreationBetween(java.time.LocalDate startDate, java.time.LocalDate endDate);
}
