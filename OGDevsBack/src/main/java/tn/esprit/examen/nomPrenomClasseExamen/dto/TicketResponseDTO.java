package tn.esprit.examen.nomPrenomClasseExamen.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import tn.esprit.examen.nomPrenomClasseExamen.entities.TicketStatus;
import tn.esprit.examen.nomPrenomClasseExamen.entities.TicketType;

import java.time.LocalDateTime;

@Data
@Getter
@Setter
public class TicketResponseDTO {
    private Long id;
    private String title;
    private String description;
    private LocalDateTime createdAt;
    private String status;
    private String type;

    public TicketResponseDTO(tn.esprit.examen.nomPrenomClasseExamen.entities.Ticket ticket) {
        this.id = ticket.getId();
        this.title = ticket.getTitle();
        this.description = ticket.getDescription();
        this.createdAt = ticket.getCreatedAt();
        this.status = ticket.getStatus() != null ? ticket.getStatus().name() : null;
        this.type = ticket.getType() != null ? ticket.getType().name() : null;
    }
}