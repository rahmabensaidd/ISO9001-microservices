package com.esprit.microservices.recrutement.controllers;


import com.esprit.microservices.recrutement.entities.Prototype;
import com.esprit.microservices.recrutement.services.IPrototypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prototype")
@RequiredArgsConstructor
public class PrototypeRestController {

    private final IPrototypeService prototypeService;

    @PostMapping("/add")
    public ResponseEntity<Prototype> addPrototype(@RequestBody Prototype prototype) {
        return ResponseEntity.ok(prototypeService.addPrototype(prototype));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Prototype> updatePrototype(@PathVariable Long id, @RequestBody Prototype prototype) {
        Prototype updatedPrototype = prototypeService.updatePrototype(id, prototype);
        return updatedPrototype != null ? ResponseEntity.ok(updatedPrototype) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deletePrototype(@PathVariable Long id) {
        prototypeService.deletePrototype(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Prototype> getPrototypeById(@PathVariable Long id) {
        Prototype prototype = prototypeService.getPrototypeById(id);
        return prototype != null ? ResponseEntity.ok(prototype) : ResponseEntity.notFound().build();
    }

    @GetMapping("/all")
    public ResponseEntity<List<Prototype>> getAllPrototypes() {
        return ResponseEntity.ok(prototypeService.getAllPrototypes());
    }
}