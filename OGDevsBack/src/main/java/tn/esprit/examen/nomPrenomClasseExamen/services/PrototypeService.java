package tn.esprit.examen.nomPrenomClasseExamen.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Prototype;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.PrototypeRepository;

import java.util.List;
import java.util.Optional;
@Slf4j
@Service
@RequiredArgsConstructor
public class PrototypeService implements IPrototypeService {

    private final PrototypeRepository prototypeRepository;

    @Override
    public Prototype addPrototype(Prototype prototype) {
        return prototypeRepository.save(prototype);
    }

    @Override
    public Prototype updatePrototype(Long prototypeId, Prototype updatedPrototype) {
        Optional<Prototype> existingPrototype = prototypeRepository.findById(prototypeId);
        if (existingPrototype.isPresent()) {
            Prototype prototype = existingPrototype.get();
            prototype.setPrototype_type(updatedPrototype.getPrototype_type());
            prototype.setProject(updatedPrototype.getProject());
            prototype.setPrototypeCompliance(updatedPrototype.getPrototypeCompliance());
            return prototypeRepository.save(prototype);
        }
        return null; // ou lever une exception
    }

    @Override
    public void deletePrototype(Long prototypeId) {
        prototypeRepository.deleteById(prototypeId);
    }

    @Override
    public Prototype getPrototypeById(Long prototypeId) {
        return prototypeRepository.findById(prototypeId).orElse(null);
    }

    @Override
    public List<Prototype> getAllPrototypes() {
        return prototypeRepository.findAll();
    }
}
