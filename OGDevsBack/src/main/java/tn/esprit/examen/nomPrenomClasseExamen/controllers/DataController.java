package tn.esprit.examen.nomPrenomClasseExamen.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Data;
import tn.esprit.examen.nomPrenomClasseExamen.services.IDataService;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/data")
public class DataController {

    private final IDataService dataService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Data add(@RequestBody Data data) {
        return dataService.addData(data);
    }

    @GetMapping
    public List<Data> getAll() {
        return dataService.getAllData();
    }

    @GetMapping("/{id}")
    public Data getById(@PathVariable Long id) {
        return dataService.getData(id);
    }

    @PutMapping("/{id}")
    public Data update(@PathVariable Long id, @RequestBody Data data) {
        return dataService.updateData(id, data);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public String delete(@PathVariable Long id) {
        try {
            dataService.deleteData(id);
            return "Data avec ID " + id + " supprimé !";
        } catch (Exception e) {
            e.printStackTrace(); // Log l'erreur
            throw new RuntimeException("Erreur lors de la suppression de la donnée avec ID " + id + " : " + e.getMessage());
        }
    }
}