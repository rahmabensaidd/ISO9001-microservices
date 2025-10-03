package tn.esprit.examen.nomPrenomClasseExamen.repositories;
import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Post;
import tn.esprit.examen.nomPrenomClasseExamen.entities.UserEntity;

import java.util.List;


public interface IPostRepository extends JpaRepository<Post, Long> {
    List<Post> findByUserId(String userId);
}

