package tn.esprit.examen.nomPrenomClasseExamen.controllers;


import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Version;
import tn.esprit.examen.nomPrenomClasseExamen.services.IVersionServices;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/versions")
@RequiredArgsConstructor
public class VersionRestController {

    private final IVersionServices versionServices;

    @PostMapping
    public ResponseEntity<Version> createVersion(@RequestBody Version version) {
        Version createdVersion = versionServices.createVersion(version);
        return new ResponseEntity<>(createdVersion, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Version> updateVersion(@PathVariable Long id, @RequestBody Version version) {
        try {
            Version updatedVersion = versionServices.updateVersion(id, version);
            return new ResponseEntity<>(updatedVersion, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Version> getVersionById(@PathVariable Long id) {
        Optional<Version> version = versionServices.getVersionById(id);
        return version.map(ResponseEntity::ok).orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping
    public ResponseEntity<List<Version>> getAllVersions() {
        List<Version> versions = versionServices.getAllVersions();
        return new ResponseEntity<>(versions, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVersion(@PathVariable Long id) {
        try {
            versionServices.deleteVersion(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}