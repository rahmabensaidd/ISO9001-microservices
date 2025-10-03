package tn.esprit.examen.nomPrenomClasseExamen.repositories;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tn.esprit.examen.nomPrenomClasseExamen.entities.UserEntity;

import java.util.List;
import java.util.Optional;

public interface UserEntityRepository extends JpaRepository<UserEntity, String> {
    @Query("SELECT u FROM UserEntity u WHERE u.poste.id = :posteId")
    Optional<UserEntity> findByPosteId(@Param("posteId") Long posteId);
    Optional<UserEntity> findByUsername(String username);
    @Query("SELECT u FROM UserEntity u LEFT JOIN FETCH u.roles")
    List<UserEntity> findAllWithRoles();

    List<UserEntity> findAll();
    @Query("SELECT DISTINCT u FROM UserEntity u JOIN FETCH u.roles r WHERE r.roleName = 'ROLE_ADMIN'")
    List<UserEntity> findAdminsWithRoles();
    @Query("SELECT u FROM UserEntity u WHERE LOWER(u.username) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(u.phoneNumber) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<UserEntity> searchByUsernameOrEmailOrPhoneNumber(@Param("query") String query);
    @Query("SELECT u FROM UserEntity u JOIN u.roles r WHERE r.roleName = :roleName")
    List<UserEntity> findByRole(String roleName);

}
