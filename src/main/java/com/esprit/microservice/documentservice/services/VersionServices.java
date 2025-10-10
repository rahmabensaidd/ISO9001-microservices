package com.esprit.microservice.documentservice.services;

import com.esprit.microservice.documentservice.entities.Document;
import com.esprit.microservice.documentservice.entities.StatutDocument;
import com.esprit.microservice.documentservice.entities.Version;
import com.esprit.microservice.documentservice.repositories.DocumentationRepository;
import com.esprit.microservice.documentservice.repositories.VersionRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class VersionServices implements IVersionServices {

    private final VersionRepository versionRepository;
    private final DocumentationRepository documentRepository;
    private static final Logger log = LoggerFactory.getLogger(VersionServices.class);

    @Override
    public Version createVersion(Version version) {
        if (version.getDocument() == null || version.getDocument().getId() == null) {
            log.error("Le document associé à la version est requis et doit avoir un ID valide.");
            throw new IllegalArgumentException("Le document associé à la version est requis et doit avoir un ID valide.");
        }

        // Récupération du document associé
        Document document = documentRepository.findById(version.getDocument().getId())
                .orElseThrow(() -> {
                    log.error("Document avec l'ID {} n'existe pas.", version.getDocument().getId());
                    return new IllegalArgumentException("Document avec l'ID " + version.getDocument().getId() + " n'existe pas.");
                });

        // Détermination du prochain numéro de version
        List<Version> existingVersions = versionRepository.findByDocument(document);
        Long nextVersionNumber = existingVersions.isEmpty() ? 1L : existingVersions.size() + 1L;
        version.setNumeroVersion(nextVersionNumber);

        // Définition des champs par défaut
        version.setDateCreation(LocalDate.now());
        if (version.getContenu() == null) {
            version.setContenu(document.getContent());
        }
        if (version.getModifiePar() == null) {
            version.setModifiePar(document.getCreatedById() != null
                    ? document.getCreatedById()
                    : "Système");
        }
        if (version.getModificationDetails() == null) {
            version.setModificationDetails("Nouvelle version créée");
        }
        if (version.getStatut() == null) {
            version.setStatut(StatutDocument.ACTIF);
        }

        log.info("Création de la version {} pour le document ID : {}", nextVersionNumber, document.getId());
        return versionRepository.save(version);
    }

    @Override
    public Version updateVersion(Long id, Version version) {
        if (!versionRepository.existsById(id)) {
            log.error("Version avec l'ID {} n'existe pas.", id);
            throw new IllegalArgumentException("Version avec l'ID " + id + " n'existe pas.");
        }

        Version existingVersion = versionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Version avec l'ID " + id + " n'existe pas."));

        existingVersion.setContenu(
                version.getContenu() != null ? version.getContenu() : existingVersion.getContenu());
        existingVersion.setModifiePar(
                version.getModifiePar() != null ? version.getModifiePar() : existingVersion.getModifiePar());
        existingVersion.setModificationDetails(
                version.getModificationDetails() != null ? version.getModificationDetails() : "Version mise à jour");
        existingVersion.setStatut(
                version.getStatut() != null ? version.getStatut() : existingVersion.getStatut());
        existingVersion.setDateCreation(LocalDate.now());

        log.info("Mise à jour de la version ID : {}", id);
        return versionRepository.save(existingVersion);
    }

    @Override
    public Optional<Version> getVersionById(Long id) {
        log.info("Récupération de la version ID : {}", id);
        return versionRepository.findById(id);
    }

    @Override
    public List<Version> getAllVersions() {
        log.info("Récupération de toutes les versions");
        return versionRepository.findAll();
    }

    @Override
    public void deleteVersion(Long id) {
        if (!versionRepository.existsById(id)) {
            log.error("Version avec l'ID {} n'existe pas.", id);
            throw new IllegalArgumentException("Version avec l'ID " + id + " n'existe pas.");
        }
        log.info("Suppression de la version ID : {}", id);
        versionRepository.deleteById(id);
    }

    @Override
    public List<Version> getVersionsByDocument(Long documentId) {
        if (documentId == null) {
            log.error("L'ID du document ne peut pas être null.");
            throw new IllegalArgumentException("L'ID du document ne peut pas être null.");
        }

        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("Document avec l'ID " + documentId + " n'existe pas."));

        log.info("Récupération des versions du document ID : {}", documentId);
        return versionRepository.findByDocument(document);
    }

    @Override
    public Version getVersionByDocumentAndNumber(Long documentId, Long versionNumber) {
        if (documentId == null || versionNumber == null) {
            log.error("L'ID du document et le numéro de version ne peuvent pas être null.");
            throw new IllegalArgumentException("L'ID du document et le numéro de version ne peuvent pas être null.");
        }

        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("Document avec l'ID " + documentId + " n'existe pas."));

        Version version = versionRepository.findByDocumentAndNumeroVersion(document, versionNumber);
        if (version == null) {
            log.error("Version {} non trouvée pour le document ID {}.", versionNumber, documentId);
            throw new IllegalArgumentException("Version " + versionNumber + " non trouvée pour le document ID " + documentId);
        }

        log.info("Récupération de la version {} du document ID : {}", versionNumber, documentId);
        return version;
    }
}
