package com.esprit.microservice.documentservice.repositories;

import com.esprit.microservice.documentservice.entities.Document;
import com.esprit.microservice.documentservice.entities.TypeDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface DocumentationRepository extends JpaRepository<Document, Long> {

    // Recherche par titre ou contenu
    List<Document> findByTitleContainingIgnoreCaseOrContentContainingIgnoreCase(String title, String content);

    // Recherche par catégorie
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
            "FROM Document d WHERE d.dateCreation IS NOT NULL " +
            "GROUP BY FUNCTION('YEAR', d.dateCreation), FUNCTION('MONTH', d.dateCreation)")
    List<Object[]> countDocumentsByCreationMonth();

    // Moyenne des salaires bruts pour les fiches de paie
    @Query("SELECT AVG(d.salaireBrut) FROM Document d WHERE d.type = :type AND d.salaireBrut IS NOT NULL")
    Double findAverageGrossSalaryByType(@Param("type") TypeDocument type);

    // Documents par utilisateur créateur (nouveau champ createdById)
    @Query("SELECT d.createdById, COUNT(d) FROM Document d WHERE d.createdById IS NOT NULL GROUP BY d.createdById")
    List<Object[]> countDocumentsByCreator();

    // Documents créés entre deux dates
    @Query("SELECT d FROM Document d WHERE d.dateCreation BETWEEN :startDate AND :endDate")
    List<Document> findByDateCreationBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
