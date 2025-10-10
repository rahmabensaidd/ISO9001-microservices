package com.esprit.microservice.documentservice.repositories;

import com.esprit.microservice.documentservice.entities.Document;
import com.esprit.microservice.documentservice.entities.Version;
import org.springframework.data.jpa.repository.JpaRepository;


import java.util.List;

public interface VersionRepository extends JpaRepository<Version, Long> {
    List<Version> findByDocument(Document document);
    Version findByDocumentAndNumeroVersion(Document document, Long numeroVersion);
}
