package tn.esprit.examen.nomPrenomClasseExamen.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.examen.nomPrenomClasseExamen.dto.MeetingRequest;
import tn.esprit.examen.nomPrenomClasseExamen.dto.MeetingResponseDTO;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Meeting;
import tn.esprit.examen.nomPrenomClasseExamen.entities.MeetingStatus;
import tn.esprit.examen.nomPrenomClasseExamen.entities.UserEntity;
import tn.esprit.examen.nomPrenomClasseExamen.services.MeetingService;
import jakarta.mail.MessagingException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RequestMapping("/api")
@RestController
public class MeetController {

    private static final Logger logger = LoggerFactory.getLogger(MeetController.class);

    private final MeetingService meetService;

    public MeetController(MeetingService meetService) {
        this.meetService = meetService;
    }

    @PostMapping("/create-meeting")
    public ResponseEntity<?> createMeeting(@RequestBody MeetingRequest meetingRequest) {
        logger.info("Received request to create meeting: {}", meetingRequest);
        try {
            Meeting meeting = meetService.createMeeting(meetingRequest);
            logger.info("Meeting created successfully: {}", meeting);
            return ResponseEntity.ok(meeting);
        } catch (MessagingException e) {
            logger.error("MessagingException while creating meeting: ", e);
            return ResponseEntity.status(500).body("Erreur lors de l'envoi des emails : " + e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error while creating meeting: ", e);
            return ResponseEntity.status(500).body("Erreur interne : " + e.getMessage());
        }
    }

    @GetMapping("/meetings")
    public ResponseEntity<List<Meeting>> getAllMeetings() {
        logger.info("Fetching all meetings");
        try {
            List<Meeting> meetings = meetService.getAllMeetings();
            logger.info("Successfully fetched {} meetings", meetings.size());
            return ResponseEntity.ok(meetings);
        } catch (Exception e) {
            logger.error("Error fetching all meetings: ", e);
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/meetings/{id}")
    public ResponseEntity<Meeting> getMeetingById(@PathVariable Long id) {
        logger.info("Fetching meeting with ID: {}", id);
        try {
            Optional<Meeting> meeting = meetService.getMeetingById(id);
            return meeting.map(ResponseEntity::ok)
                    .orElseGet(() -> {
                        logger.warn("Meeting with ID {} not found", id);
                        return ResponseEntity.status(404).body(null);
                    });
        } catch (Exception e) {
            logger.error("Error fetching meeting with ID {}: ", id, e);
            return ResponseEntity.status(500).body(null);
        }
    }

    @PutMapping("/meetings/{id}")
    public ResponseEntity<Meeting> updateMeeting(@PathVariable Long id, @RequestBody Meeting meeting) {
        logger.info("Updating meeting with ID: {}", id);
        try {
            Meeting updatedMeeting = meetService.updateMeeting(id, meeting);
            logger.info("Meeting with ID {} updated successfully: {}", id, updatedMeeting);
            return ResponseEntity.ok(updatedMeeting);
        } catch (Exception e) {
            logger.error("Error updating meeting with ID {}: ", id, e);
            return ResponseEntity.status(500).body(null);
        }
    }

    @DeleteMapping("/meetings/{id}")
    public ResponseEntity<Void> deleteMeeting(@PathVariable Long id) {
        logger.info("Deleting meeting with ID: {}", id);
        try {
            meetService.deleteMeeting(id);
            logger.info("Meeting with ID {} deleted successfully", id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error deleting meeting with ID {}: ", id, e);
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping("/meetings/{meetingId}/assign-user/{userId}")
    public ResponseEntity<Meeting> assignUserToMeeting(@PathVariable Long meetingId, @PathVariable String userId) {
        logger.info("Assigning user {} to meeting {}", userId, meetingId);
        try {
            Meeting updatedMeeting = meetService.assignUserToMeeting(meetingId, userId);
            logger.info("User {} assigned to meeting {} successfully: {}", userId, meetingId, updatedMeeting);
            return ResponseEntity.ok(updatedMeeting);
        } catch (Exception e) {
            logger.error("Error assigning user {} to meeting {}: ", userId, meetingId, e);
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/meetings/user/{userId}")
    public ResponseEntity<List<Meeting>> getMeetingsByUserId(@PathVariable String userId) {
        logger.info("Fetching meetings for user: {}", userId);
        try {
            List<Meeting> meetings = meetService.getMeetingsByUserId(userId);
            logger.info("Successfully fetched {} meetings for user {}", meetings.size(), userId);
            return ResponseEntity.ok(meetings);
        } catch (Exception e) {
            logger.error("Error fetching meetings for user {}: ", userId, e);
            return ResponseEntity.status(500).body(null);
        }
    }

    @PutMapping("/meetings/{meetingId}/status")
    public ResponseEntity<Meeting> updateMeetingStatus(@PathVariable Long meetingId, @RequestParam MeetingStatus newStatus) {
        logger.info("Updating status of meeting {} to {}", meetingId, newStatus);
        try {
            Meeting updatedMeeting = meetService.updateMeetingStatus(meetingId, newStatus);
            logger.info("Status of meeting {} updated to {} successfully: {}", meetingId, newStatus, updatedMeeting);
            return ResponseEntity.ok(updatedMeeting);
        } catch (Exception e) {
            logger.error("Error updating status of meeting {}: ", meetingId, e);
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/clients")
    public ResponseEntity<List<UserEntity>> getClients() {
        logger.info("Fetching all users with ROLE_CLIENT");
        try {
            List<UserEntity> clients = meetService.getClients();
            logger.info("Successfully fetched {} clients", clients.size());
            return ResponseEntity.ok(clients);
        } catch (Exception e) {
            logger.error("Error fetching clients: ", e);
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/current-user")
    public ResponseEntity<List<MeetingResponseDTO>> getMeetingsByCurrentUser() {
        List<Meeting> meetings = meetService.getMeetingsByCurrentUser();
        System.out.println("Meetings retrieved: " + meetings); // Debug
        List<MeetingResponseDTO> meetingDTOs = meetings.stream()
                .map(MeetingResponseDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(meetingDTOs);
    }
}