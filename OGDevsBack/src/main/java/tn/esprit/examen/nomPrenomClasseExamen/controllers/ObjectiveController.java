package tn.esprit.examen.nomPrenomClasseExamen.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.examen.nomPrenomClasseExamen.dto.ObjectiveDTO;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Objective;
import tn.esprit.examen.nomPrenomClasseExamen.services.IObjectivesServices;

import javax.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/Objective")
@CrossOrigin(origins = "http://localhost:4200")
public class ObjectiveController {
    private final IObjectivesServices objectivesServices;

    @PostMapping()
    public ResponseEntity<Objective> addObjective(@Valid @RequestBody Objective o) {
        try {
            Objective savedObjective = objectivesServices.addObjective(o);
            return new ResponseEntity<>(savedObjective, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }
    @PutMapping(value = "/updateObjective/{id}", consumes = {MediaType.APPLICATION_JSON_VALUE, "application/json;charset=UTF-8"}, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Objective> updateObjective(@PathVariable("id") Long id, @Valid @RequestBody Objective objective) {
        try {
            Objective updatedObjective = objectivesServices.updateObjective(id, objective);
            if (updatedObjective != null) {
                return new ResponseEntity<>(updatedObjective, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/getAllObjectivesDTO")
    public ResponseEntity<?> getAllObjectivesDTO() {
        try {
            log.info("Fetching all Objectives DTO");
            List<ObjectiveDTO> objectives = objectivesServices.getAllObjectivesDTO();
            log.info("Fetched {} Objectives DTO", objectives.size());
            return ResponseEntity.ok(objectives);
        } catch (Exception e) {
            log.error("Error fetching all Objectives DTO", e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch objectives: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/getObjectives")
    public ResponseEntity<List<Objective>> getObjectives() {
        List<Objective> objectives = objectivesServices.getAllObjectives();
        return new ResponseEntity<>(objectives, HttpStatus.OK);
    }

    @DeleteMapping(value = "/deleteObjective/{id}")
    public ResponseEntity<Void> deleteObjective(@PathVariable("id") Long id) {
        try {
            objectivesServices.deleteObjective(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
