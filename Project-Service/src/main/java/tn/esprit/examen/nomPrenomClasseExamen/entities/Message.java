package tn.esprit.examen.nomPrenomClasseExamen.entities;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.io.Serializable;
import java.util.Date;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Message implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne
    @JoinColumn(name = "chatroom_id")
    ChatRoom chatRoom;

    @ManyToOne
    @JoinColumn(name = "user_id")
    UserEntity sender;

    String content;

    @Lob
    byte[] attachment;

    @Temporal(TemporalType.TIMESTAMP)
    Date createdAt;

    boolean seen;
}