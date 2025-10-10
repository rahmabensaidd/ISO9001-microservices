package com.esprit.microservice.documentservice.services;



import com.esprit.microservice.documentservice.entities.Version;

import java.util.List;
import java.util.Optional;

public interface IVersionServices {

    Version createVersion(Version version);

    Version updateVersion(Long id, Version version);

    Optional<Version> getVersionById(Long id);

    List<Version> getAllVersions();

    void deleteVersion(Long id);

    // Nouvelles méthodes
    List<Version> getVersionsByDocument(Long documentId);

    Version getVersionByDocumentAndNumber(Long documentId, Long versionNumber);
}
