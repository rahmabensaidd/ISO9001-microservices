package tn.esprit.examen.nomPrenomClasseExamen.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.examen.nomPrenomClasseExamen.entities.ChatRoom;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Message;

import java.util.List;
import java.util.Optional;

public interface MessageRepository extends JpaRepository<Message, Long> {
    Optional<Message> findTopByChatRoomOrderByCreatedAtDesc(ChatRoom chatRoom);
    List<Message> findByChatRoomOrderByCreatedAtDesc(ChatRoom chatRoom);
    List<Message> findTop10ByChatRoomAndIdLessThanEqualOrderByCreatedAtDesc(ChatRoom chatRoom, Long messageId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Message m WHERE m.chatRoom = :chatRoom")
    void deleteByChatRoom(@Param("chatRoom") ChatRoom chatRoom);
}