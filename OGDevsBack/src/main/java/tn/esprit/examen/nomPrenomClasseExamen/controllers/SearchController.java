package tn.esprit.examen.nomPrenomClasseExamen.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.examen.nomPrenomClasseExamen.dto.SearchResultDTO;
import tn.esprit.examen.nomPrenomClasseExamen.services.ISearchService;

import java.util.List;

@RestController
@RequestMapping("/search")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class SearchController {

    private final ISearchService searchService;

    @GetMapping
    public ResponseEntity<List<SearchResultDTO>> search(@RequestParam("query") String query) {
        List<SearchResultDTO> results = searchService.searchAll(query);
        return ResponseEntity.ok(results);
    }
}