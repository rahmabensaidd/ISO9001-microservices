package tn.esprit.examen.nomPrenomClasseExamen.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Poste;
import tn.esprit.examen.nomPrenomClasseExamen.entities.UserEntity;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.PosteRepository;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.UserEntityRepository;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PosteServices implements IPosteService {

    private final PosteRepository posteRepository;
    private final UserEntityRepository userEntityRepository;

    @Override
    public Poste createPoste(Poste poste) {
        return posteRepository.save(poste);
    }

    @Override
    public Poste getPosteById(Long id) {
        return posteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Poste not found with id: " + id));
    }

    @Override
    public List<Poste> getAllPostes() {
        return posteRepository.findAll();
    }

    @Override
    public Poste updatePoste(Long id, Poste poste) {
        Poste existingPoste = getPosteById(id);
        existingPoste.setMission(poste.getMission());
        existingPoste.setSalaire(poste.getSalaire());
        return posteRepository.save(existingPoste);
    }

    @Override
    public void deletePoste(Long id) {
        Poste poste = getPosteById(id);

        // Dissociate from UserEntity
        Optional<UserEntity> userWithPoste = userEntityRepository.findByPosteId(id);
        if (userWithPoste.isPresent()) {
            UserEntity user = userWithPoste.get();
            user.setPoste(null); // Remove the reference
            userEntityRepository.save(user);
        }

        posteRepository.delete(poste);
    }

    @Override
    public Poste assignUserToPoste(Long posteId, String userId) {
        Poste poste = posteRepository.findById(posteId)
                .orElseThrow(() -> new RuntimeException("Poste not found with id: " + posteId));
        UserEntity user = userEntityRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        Optional<UserEntity> existingUserWithPoste = userEntityRepository.findByPosteId(posteId);
        if (existingUserWithPoste.isPresent()) {
            UserEntity existingUser = existingUserWithPoste.get();
            existingUser.setPoste(null);
            userEntityRepository.save(existingUser);
        }
        poste.setUserEntity(user);
        user.setPoste(poste);
        userEntityRepository.save(user);
        return posteRepository.save(poste);
    }
}