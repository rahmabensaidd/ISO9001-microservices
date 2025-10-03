package tn.esprit.examen.nomPrenomClasseExamen.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Document;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Version;

import java.util.List;

public interface VersionRepository extends JpaRepository<Version, Long> {
    List<Version> findByDocument(Document document);
    Version findByDocumentAndNumeroVersion(Document document, Long numeroVersion);
}
