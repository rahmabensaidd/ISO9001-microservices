package tn.esprit.examen.nomPrenomClasseExamen.services;

import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Ticket;
import tn.esprit.examen.nomPrenomClasseExamen.entities.TicketStatus;
import tn.esprit.examen.nomPrenomClasseExamen.entities.TicketType;
import tn.esprit.examen.nomPrenomClasseExamen.entities.UserEntity;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.TicketRepository;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.UserEntityRepository;

import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserEntityRepository userEntityRepository;

    public TicketService(TicketRepository ticketRepository, UserEntityRepository userEntityRepository) {
        this.ticketRepository = ticketRepository;
        this.userEntityRepository = userEntityRepository;
    }

    // Créer un ticket pour l'utilisateur connecté
    @Transactional
    public String createTicket(Map<String, Object> ticketData) {
        String title = (String) ticketData.get("title");
        String description = (String) ticketData.get("description");
        String statusStr = (String) ticketData.get("status");
        String typeStr = (String) ticketData.get("type");

        // Vérifier la présence des champs requis
        if (title == null || description == null || statusStr == null || typeStr == null) {
            log.error("Champs requis manquants : title={}, description={}, status={}, type={}",
                    title, description, statusStr, typeStr);
            return "Erreur : Les champs title, description, status et type sont requis.";
        }

        // Convertir les chaînes en enums
        TicketStatus status;
        TicketType type;
        try {
            status = TicketStatus.valueOf(statusStr.toUpperCase());
            type = TicketType.valueOf(typeStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            log.error("Statut ou type invalide : status={}, type={}", statusStr, typeStr);
            return "Erreur : Statut ou type invalide. Statut doit être l'un de OPEN, IN_PROGRESS, CLOSED. Type doit être l'un de REQUEST, INCIDENT, QUESTION.";
        }

        // Récupérer l'utilisateur connecté depuis Spring Security
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        log.debug("Utilisateur connecté : userId={}", userId);

        // Trouver l'utilisateur dans la base de données
        Optional<UserEntity> userOpt = userEntityRepository.findById(userId);
        if (!userOpt.isPresent()) {
            log.error("Utilisateur non trouvé dans la base : userId={}", userId);
            return "Erreur : Utilisateur connecté non trouvé dans la base de données (ID: " + userId + ").";
        }

        UserEntity client = userOpt.get();
        // Vérifier que l'utilisateur a le rôle ROLE_CLIENT
        boolean isClient = client.getRoles().stream()
                .anyMatch(role -> "ROLE_CLIENT".equals(role.getRoleName()));
        if (!isClient) {
            log.error("L'utilisateur n'a pas le rôle ROLE_CLIENT : userId={}", userId);
            return "Erreur : L'utilisateur connecté n'est pas un client (ROLE_CLIENT requis).";
        }

        // Créer le ticket
        Ticket ticket = new Ticket();
        ticket.setTitle(title);
        ticket.setDescription(description);
        ticket.setCreatedAt(LocalDateTime.now());
        ticket.setStatus(status);
        ticket.setType(type);
        ticket.setClient(client);

        // Sauvegarder le ticket
        try {
            ticketRepository.save(ticket);
            log.info("Ticket créé avec succès : ticketId={}", ticket.getId());
            return "Ticket créé avec succès avec ID : " + ticket.getId();
        } catch (Exception e) {
            log.error("Erreur lors de la sauvegarde du ticket : {}", e.getMessage());
            return "Erreur : Échec de la création du ticket : " + e.getMessage();
        }
    }

    // Lister tous les tickets de l'utilisateur connecté
    public List<Ticket> getTicketsByCurrentUser() {
        // Récupérer l'utilisateur connecté depuis Spring Security
        String userId = SecurityContextHolder.getContext().getAuthentication().getName(); // Keycloak retourne le "sub" ici

        // Trouver l'utilisateur dans la base de données
        Optional<UserEntity> userOpt = userEntityRepository.findById(userId);
        if (!userOpt.isPresent()) {
            throw new RuntimeException("Utilisateur connecté non trouvé dans la base de données (ID: " + userId + ").");
        }

        UserEntity client = userOpt.get();
        return ticketRepository.findByClient(client);
    }

    // Mettre à jour un ticket
    @Transactional
    public String updateTicket(Long ticketId, Map<String, Object> ticketData) {
        // Vérifier l'existence du ticket
        Optional<Ticket> ticketOpt = ticketRepository.findById(ticketId);
        if (!ticketOpt.isPresent()) {
            return "Erreur : Ticket avec ID " + ticketId + " non trouvé.";
        }

        Ticket ticket = ticketOpt.get();

        // Vérifier que le ticket appartient à l'utilisateur connecté
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<UserEntity> userOpt = userEntityRepository.findById(userId);
        if (!userOpt.isPresent()) {
            return "Erreur : Utilisateur connecté non trouvé dans la base de données (ID: " + userId + ").";
        }

        UserEntity currentUser = userOpt.get();
        if (!ticket.getClient().getId().equals(currentUser.getId())) {
            return "Erreur : Vous n'êtes pas autorisé à modifier ce ticket.";
        }

        String title = (String) ticketData.get("title");
        String description = (String) ticketData.get("description");
        String statusStr = (String) ticketData.get("status");
        String typeStr = (String) ticketData.get("type");

        if (title != null) ticket.setTitle(title);
        if (description != null) ticket.setDescription(description);
        if (statusStr != null) {
            try {
                TicketStatus status = TicketStatus.valueOf(statusStr.toUpperCase());
                ticket.setStatus(status);
            } catch (IllegalArgumentException e) {
                return "Erreur : Statut invalide. Statut doit être l'un de OPEN, IN_PROGRESS, CLOSED.";
            }
        }
        if (typeStr != null) {
            try {
                TicketType type = TicketType.valueOf(typeStr.toUpperCase());
                ticket.setType(type);
            } catch (IllegalArgumentException e) {
                return "Erreur : Type invalide. Type doit être l'un de REQUEST, INCIDENT, QUESTION.";
            }
        }

        // Sauvegarder les modifications
        ticketRepository.save(ticket);

        return "Ticket avec ID " + ticketId + " mis à jour avec succès !";
    }

    // Supprimer un ticket
    @Transactional
    public String deleteTicket(Long ticketId) {
        // Vérifier l'existence du ticket
        Optional<Ticket> ticketOpt = ticketRepository.findById(ticketId);
        if (!ticketOpt.isPresent()) {
            return "Erreur : Ticket avec ID " + ticketId + " non trouvé.";
        }

        Ticket ticket = ticketOpt.get();

        // Vérifier que le ticket appartient à l'utilisateur connecté
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<UserEntity> userOpt = userEntityRepository.findById(userId);
        if (!userOpt.isPresent()) {
            return "Erreur : Utilisateur connecté non trouvé dans la base de données (ID: " + userId + ").";
        }

        UserEntity currentUser = userOpt.get();
        if (!ticket.getClient().getId().equals(currentUser.getId())) {
            return "Erreur : Vous n'êtes pas autorisé à supprimer ce ticket.";
        }

        // Supprimer le ticket
        ticketRepository.deleteById(ticketId);
        return "Ticket avec ID " + ticketId + " supprimé avec succès !";
    }

    // Lister tous les tickets pour ROLE_ADMIN (avec le nom du client)
    public List<Ticket> getAllTicketsForAdmin() {
        List<Ticket> tickets = ticketRepository.findAll();
        // Récupérer le nom du client pour chaque ticket
        tickets.forEach(ticket -> {
            if (ticket.getClient() != null) {
                ticket.setClient(ticket.getClient()); // Pas besoin de setClientId, car on utilise getClientName() dans le frontend
            }
        });
        log.info("Tous les tickets listés pour l'admin : {}", tickets.size());
        return tickets;
    }

    // Mettre à jour un ticket pour ROLE_ADMIN (sans restriction)
    @Transactional
    public String updateTicketForAdmin(Long ticketId, Map<String, Object> ticketData) {
        // Vérifier l'existence du ticket
        Optional<Ticket> ticketOpt = ticketRepository.findById(ticketId);
        if (!ticketOpt.isPresent()) {
            return "Erreur : Ticket avec ID " + ticketId + " non trouvé.";
        }

        Ticket ticket = ticketOpt.get();

        String title = (String) ticketData.get("title");
        String description = (String) ticketData.get("description");
        String statusStr = (String) ticketData.get("status");
        String typeStr = (String) ticketData.get("type");

        if (title != null) ticket.setTitle(title);
        if (description != null) ticket.setDescription(description);
        if (statusStr != null) {
            try {
                TicketStatus status = TicketStatus.valueOf(statusStr.toUpperCase());
                ticket.setStatus(status);
            } catch (IllegalArgumentException e) {
                return "Erreur : Statut invalide. Statut doit être l'un de OPEN, IN_PROGRESS, CLOSED.";
            }
        }
        if (typeStr != null) {
            try {
                TicketType type = TicketType.valueOf(typeStr.toUpperCase());
                ticket.setType(type);
            } catch (IllegalArgumentException e) {
                return "Erreur : Type invalide. Type doit être l'un de REQUEST, INCIDENT, QUESTION.";
            }
        }

        // Sauvegarder les modifications
        ticketRepository.save(ticket);
        log.info("Ticket avec ID {} mis à jour par l'admin.", ticketId);

        return "Ticket avec ID " + ticketId + " mis à jour avec succès par l'admin !";
    }

    // Supprimer un ticket pour ROLE_ADMIN (sans restriction)
    @Transactional
    public String deleteTicketForAdmin(Long ticketId) {
        // Vérifier l'existence du ticket
        Optional<Ticket> ticketOpt = ticketRepository.findById(ticketId);
        if (!ticketOpt.isPresent()) {
            return "Erreur : Ticket avec ID " + ticketId + " non trouvé.";
        }

        // Supprimer le ticket
        ticketRepository.deleteById(ticketId);
        log.info("Ticket avec ID {} supprimé par l'admin.", ticketId);

        return "Ticket avec ID " + ticketId + " supprimé avec succès par l'admin !";
    }
}