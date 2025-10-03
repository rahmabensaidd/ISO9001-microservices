package tn.esprit.examen.nomPrenomClasseExamen.services;

import tn.esprit.examen.nomPrenomClasseExamen.entities.Poste;
import java.util.List;

public interface IPosteService {
    Poste createPoste(Poste poste);
    Poste getPosteById(Long id);
    List<Poste> getAllPostes();
    Poste updatePoste(Long id, Poste poste);
    void deletePoste(Long id);
    Poste assignUserToPoste(Long posteId, String userId) ;

    }