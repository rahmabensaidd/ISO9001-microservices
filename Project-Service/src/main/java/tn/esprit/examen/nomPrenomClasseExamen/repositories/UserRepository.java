package tn.esprit.examen.nomPrenomClasseExamen.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.examen.nomPrenomClasseExamen.entities.UserEntity;

import java.util.Optional;

public interface UserRepository  extends JpaRepository<UserEntity, String> {

    Optional<UserEntity> findByEmail(String email);
}