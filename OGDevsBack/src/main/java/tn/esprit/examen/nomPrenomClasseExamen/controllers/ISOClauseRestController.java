package tn.esprit.examen.nomPrenomClasseExamen.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.examen.nomPrenomClasseExamen.entities.ISOClause;
import tn.esprit.examen.nomPrenomClasseExamen.services.IISOClauseService;

import java.util.List;

@RestController
@RequestMapping("/api/isoClause")
@RequiredArgsConstructor
public class ISOClauseRestController {

    private final IISOClauseService isoClauseService;

    @PostMapping("/add")
    public ResponseEntity<ISOClause> addISOClause(@RequestBody ISOClause isoClause) {
        return ResponseEntity.ok(isoClauseService.addISOClause(isoClause));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<ISOClause> updateISOClause(@PathVariable Long id, @RequestBody ISOClause isoClause) {
        ISOClause updatedClause = isoClauseService.updateISOClause(id, isoClause);
        return updatedClause != null ? ResponseEntity.ok(updatedClause) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteISOClause(@PathVariable Long id) {
        isoClauseService.deleteISOClause(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ISOClause> getISOClauseById(@PathVariable Long id) {
        ISOClause isoClause = isoClauseService.getISOClauseById(id);
        return isoClause != null ? ResponseEntity.ok(isoClause) : ResponseEntity.notFound().build();
    }

    @GetMapping("/all")
    public ResponseEntity<List<ISOClause>> getAllISOClauses() {
        return ResponseEntity.ok(isoClauseService.getAllISOClauses());
    }
}
