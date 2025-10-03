package tn.esprit.examen.nomPrenomClasseExamen.services;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Prototype;
import java.util.List;

public interface IPrototypeService {
    Prototype addPrototype(Prototype prototype);
    Prototype updatePrototype(Long prototypeId, Prototype prototype);
    void deletePrototype(Long prototypeId);
    Prototype getPrototypeById(Long prototypeId);
    List<Prototype> getAllPrototypes();
}
