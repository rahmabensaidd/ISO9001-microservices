package tn.esprit.examen.nomPrenomClasseExamen.entities;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChatMessage {
    @Enumerated(EnumType.STRING)
    private MessageType type;
    private String content;
    private String sender;

}
