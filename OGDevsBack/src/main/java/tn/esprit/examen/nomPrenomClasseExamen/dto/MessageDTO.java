package tn.esprit.examen.nomPrenomClasseExamen.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Data
public class MessageDTO {
    private Long id;
    private Long chatRoomId;
    private String chatRoomName;
    private String senderId;
    private String senderUsername;
    private String content;
    private String attachment;
    private String createdAt; // Changed from Date to String
    private boolean seen;
}