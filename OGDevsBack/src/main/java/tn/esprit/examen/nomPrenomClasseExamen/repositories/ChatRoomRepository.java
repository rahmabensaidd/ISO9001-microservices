package tn.esprit.examen.nomPrenomClasseExamen.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tn.esprit.examen.nomPrenomClasseExamen.entities.ChatRoom;
import tn.esprit.examen.nomPrenomClasseExamen.entities.UserEntity;

import java.util.List;
import java.util.Optional;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {

    List<ChatRoom> findByUsersContaining(UserEntity user);

    Optional<ChatRoom> findByUsersContainingAndUsersContainingAndNameIsNull(UserEntity user1, UserEntity user2);

    // Add a query to check if a user is in a chat room
    @Query("SELECT COUNT(c) > 0 FROM ChatRoom c JOIN c.users u WHERE c.id = :chatRoomId AND u.id = :userId")
    boolean existsByIdAndUsersId(@Param("chatRoomId") Long chatRoomId, @Param("userId") String userId);
}