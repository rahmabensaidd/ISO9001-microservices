package com.esprit.microservices.recrutement.repositories;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.esprit.microservices.recrutement.entities.UserEntity;

import java.util.List;
import java.util.Optional;

public interface UserEntityRepository extends JpaRepository<UserEntity, String> {
/*    Optional<UserEntity> findByPosteId(@Param("posteId") Long posteId);
    Optional<UserEntity> findByUsername(String username);
    List<UserEntity> findAllWithRoles();


    List<UserEntity> findAdminsWithRoles();
    @Query("SELECT u FROM UserEntity u WHERE LOWER(u.username) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(u.phoneNumber) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<UserEntity> searchByUsernameOrEmailOrPhoneNumber(@Param("query") String query);
*/

}
