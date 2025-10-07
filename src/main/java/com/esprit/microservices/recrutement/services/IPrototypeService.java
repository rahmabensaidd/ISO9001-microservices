package com.esprit.microservices.recrutement.services;
import com.esprit.microservices.recrutement.entities.Prototype;
import java.util.List;

public interface IPrototypeService {
    Prototype addPrototype(Prototype prototype);
    Prototype updatePrototype(Long prototypeId, Prototype prototype);
    void deletePrototype(Long prototypeId);
    Prototype getPrototypeById(Long prototypeId);
    List<Prototype> getAllPrototypes();
}
