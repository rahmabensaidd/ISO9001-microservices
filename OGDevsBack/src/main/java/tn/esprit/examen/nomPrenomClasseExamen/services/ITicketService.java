package tn.esprit.examen.nomPrenomClasseExamen.services;

import tn.esprit.examen.nomPrenomClasseExamen.entities.Ticket;
import java.util.List;

public interface ITicketService {
    Ticket addTicket(Ticket ticket);
    Ticket updateTicket(Long ticketId, Ticket ticket);
    void deleteTicket(Long ticketId);
    Ticket getTicketById(Long ticketId);
    List<Ticket> getAllTickets();
}
