package tn.esprit.examen.nomPrenomClasseExamen.services;

import tn.esprit.examen.nomPrenomClasseExamen.dto.SearchResultDTO;
import java.util.List;

public interface ISearchService {
    List<SearchResultDTO> searchAll(String query);
}