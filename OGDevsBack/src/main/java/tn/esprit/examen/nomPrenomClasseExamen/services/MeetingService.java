package tn.esprit.examen.nomPrenomClasseExamen.services;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import tn.esprit.examen.nomPrenomClasseExamen.dto.MeetingRequest;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Meeting;
import tn.esprit.examen.nomPrenomClasseExamen.entities.MeetingStatus;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Project;
import tn.esprit.examen.nomPrenomClasseExamen.entities.UserEntity;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.MeetingRepository;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.ProjectRepository;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.UserEntityRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MeetingService {
    private static final String JITSI_DOMAIN = "https://meet.jit.si/";
    private final MeetingRepository meetingRepository;
    private final UserEntityRepository userRepository;
    private final JavaMailSender mailSender;
    private final ProjectRepository projectRepository;

    public Meeting createMeeting(MeetingRequest meetingRequest) throws MessagingException {
        validateDateAndTime(meetingRequest.getDate(), meetingRequest.getTime());
        String meetingId = meetingRequest.getTitle()
                .replaceAll("[^a-zA-Z0-9]", "") + "-" + UUID.randomUUID().toString().substring(0, 8);
        String meetingLink = JITSI_DOMAIN + meetingId;

        Meeting meeting = new Meeting();
        meeting.setMeetingStatus(MeetingStatus.PLANNED);
        meeting.setMeetingDate(meetingRequest.getDate());
        meeting.setMeetingTime(meetingRequest.getTime());
        meeting.setMeetingDuration(meetingRequest.getDuration());
        meeting.setMeetingLink(meetingLink);
        meeting.setPassword(meetingRequest.getPassword());

        if (meetingRequest.getClientId() != null && !meetingRequest.getClientId().isEmpty()) {
            UserEntity client = userRepository.findById(meetingRequest.getClientId())
                    .orElseThrow(() -> new RuntimeException("Client not found with id: " + meetingRequest.getClientId()));
            meeting.setClient(client);
            client.getMeetings().add(meeting);
            userRepository.save(client);
        }

        Meeting savedMeeting = meetingRepository.save(meeting);

        if (meetingRequest.getClientId() != null && !meetingRequest.getClientId().isEmpty()) {
            UserEntity client = userRepository.findById(meetingRequest.getClientId())
                    .orElseThrow(() -> new RuntimeException("Client not found for email sending"));
            sendMeetingEmail(meetingRequest, meetingLink, client.getEmail());
        }

        return savedMeeting;
    }

    private void validateDateAndTime(String date, String time) {
        try {
            LocalDate meetingDate = LocalDate.parse(date, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            if (meetingDate.isBefore(LocalDate.now())) {
                throw new IllegalArgumentException("Meeting date must be in the future");
            }
            LocalTime.parse(time, DateTimeFormatter.ofPattern("HH:mm"));
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("Invalid date or time format. Use 'yyyy-MM-dd' for date and 'HH:mm' for time");
        }
    }

    private void sendMeetingEmail(MeetingRequest meetingRequest, String meetingLink, String clientEmail) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setSubject("Invitation à la réunion : " + meetingRequest.getTitle());
        helper.setFrom("noreply@coconsult.fr");
        helper.setTo(clientEmail);

        String emailContent = "<!DOCTYPE html>" +
                "<html lang='fr'>" +
                "<head>" +
                "<meta charset='UTF-8'>" +
                "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                "<style>" +
                "body { font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }" +
                ".container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }" +
                ".header { background-color: #28a745; padding: 20px; text-align: center; }" +
                ".header img { max-width: 150px; height: auto; }" +
                ".content { padding: 20px; }" +
                ".content h2 { color: #333333; font-size: 24px; margin-top: 0; }" +
                ".content p { color: #555555; font-size: 16px; line-height: 1.5; margin: 10px 0; }" +
                ".content a { color: #28a745; text-decoration: none; font-weight: bold; }" +
                ".content a:hover { text-decoration: underline; }" +
                ".details { background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0; }" +
                ".details p { margin: 8px 0; }" +
                ".footer { background-color: #e9ecef; padding: 10px; text-align: center; font-size: 14px; color: #777777; }" +
                "@media only screen and (max-width: 600px) { .container { margin: 10px; } .header img { max-width: 120px; } .content h2 { font-size: 20px; } .content p { font-size: 14px; } }" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<div class='container'>" +
                "<div class='header'>" +
                "<img src='https://www.coconsult.fr/wp-content/uploads/2023/07/cropped-coconsultlogo_flood2__3_-1.png' alt='Coconsult Logo' style='max-width: 150px; height: auto;'>" +
                "</div>" +
                "<div class='content'>" +
                "<h2>Invitation à une réunion</h2>" +
                "<p>Bonjour,</p>" +
                "<p>Vous êtes invité(e) à une réunion intitulée : <strong>" + meetingRequest.getTitle() + "</strong></p>" +
                "<div class='details'>" +
                "<p><strong>Date :</strong> " + meetingRequest.getDate() + "</p>" +
                "<p><strong>Heure :</strong> " + meetingRequest.getTime() + "</p>" +
                "<p><strong>Durée :</strong> " + meetingRequest.getDuration() + " minutes</p>" +
                "<p><strong>Lien de la réunion :</strong> <a href='" + meetingLink + "'>" + meetingLink + "</a></p>";
        if (meetingRequest.getPassword() != null && !meetingRequest.getPassword().isEmpty()) {
            emailContent += "<p><strong>Mot de passe :</strong> " + meetingRequest.getPassword() + "</p>";
        }
        emailContent += "</div>" +
                "<p>Merci de rejoindre la réunion à l'heure indiquée.</p>" +
                "<p>Cordialement,<br>L'équipe Coconsult</p>" +
                "</div>" +
                "<div class='footer'>" +
                "<p>© 2025 Coconsult. Tous droits réservés.</p>" +
                "</div>" +
                "</div>" +
                "</body>" +
                "</html>";

        helper.setText(emailContent, true);
        mailSender.send(message);
    }

    private void sendMeetingUpdateEmail(Meeting meeting, String clientEmail) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setSubject("Mise à jour de la réunion");
        helper.setFrom("noreply@coconsult.fr");
        helper.setTo(clientEmail);

        String emailContent = "<!DOCTYPE html>" +
                "<html lang='fr'>" +
                "<head>" +
                "<meta charset='UTF-8'>" +
                "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                "<style>" +
                "body { font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }" +
                ".container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }" +
                ".header { background-color: #28a745; padding: 20px; text-align: center; }" +
                ".header img { max-width: 150px; height: auto; }" +
                ".content { padding: 20px; }" +
                ".content h2 { color: #333333; font-size: 24px; margin-top: 0; }" +
                ".content p { color: #555555; font-size: 16px; line-height: 1.5; margin: 10px 0; }" +
                ".content a { color: #28a745; text-decoration: none; font-weight: bold; }" +
                ".content a:hover { text-decoration: underline; }" +
                ".details { background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0; }" +
                ".details p { margin: 8px 0; }" +
                ".footer { background-color: #e9ecef; padding: 10px; text-align: center; font-size: 14px; color: #777777; }" +
                "@media only screen and (max-width: 600px) { .container { margin: 10px; } .header img { max-width: 120px; } .content h2 { font-size: 20px; } .content p { font-size: 14px; } }" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<div class='container'>" +
                "<div class='header'>" +
                "<img src='https://www.coconsult.fr/wp-content/uploads/2023/07/cropped-coconsultlogo_flood2__3_-1.png' alt='Coconsult Logo' style='max-width: 150px; height: auto;'>" +
                "</div>" +
                "<div class='content'>" +
                "<h2>Mise à jour de la réunion</h2>" +
                "<p>Bonjour,</p>" +
                "<p>Les détails de votre réunion ont été mis à jour. Veuillez vérifier les informations ci-dessous :</p>" +
                "<div class='details'>" +
                "<p><strong>Statut :</strong> " + meeting.getMeetingStatus() + "</p>" +
                "<p><strong>Date :</strong> " + meeting.getMeetingDate() + "</p>" +
                "<p><strong>Heure :</strong> " + meeting.getMeetingTime() + "</p>" +
                "<p><strong>Durée :</strong> " + meeting.getMeetingDuration() + " minutes</p>" +
                "<p><strong>Lien de la réunion :</strong> <a href='" + meeting.getMeetingLink() + "'>" + meeting.getMeetingLink() + "</a></p>";
        if (meeting.getPassword() != null && !meeting.getPassword().isEmpty()) {
            emailContent += "<p><strong>Mot de passe :</strong> " + meeting.getPassword() + "</p>";
        }
        emailContent += "</div>" +
                "<p>Merci de rejoindre la réunion à l'heure indiquée.</p>" +
                "<p>Cordialement,<br>L'équipe Coconsult</p>" +
                "</div>" +
                "<div class='footer'>" +
                "<p>© 2025 Coconsult. Tous droits réservés.</p>" +
                "</div>" +
                "</div>" +
                "</body>" +
                "</html>";

        helper.setText(emailContent, true);
        mailSender.send(message);
    }

    public List<Meeting> getAllMeetings() {
        List<Meeting> meetings = meetingRepository.findAll();
        List<Meeting> simplifiedMeetings = new ArrayList<>();
        for (Meeting meeting : meetings) {
            Meeting simplified = new Meeting();
            simplified.setMeetingid(meeting.getMeetingid());
            simplified.setMeetingStatus(meeting.getMeetingStatus());
            simplified.setMeetingDate(meeting.getMeetingDate());
            simplified.setMeetingTime(meeting.getMeetingTime());
            simplified.setMeetingDuration(meeting.getMeetingDuration());
            simplified.setMeetingLink(meeting.getMeetingLink());
            simplified.setPassword(meeting.getPassword());
            if (meeting.getClient() != null) {
                UserEntity simplifiedClient = new UserEntity();
                simplifiedClient.setId(meeting.getClient().getId());
                simplifiedClient.setUsername(meeting.getClient().getUsername());
                simplified.setClient(simplifiedClient);
            }
            simplifiedMeetings.add(simplified);
        }
        return simplifiedMeetings;
    }

    public Optional<Meeting> getMeetingById(Long id) {
        return meetingRepository.findById(id);
    }

    public Meeting updateMeeting(Long id, Meeting meeting) throws MessagingException {
        Meeting existingMeeting = meetingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Meeting not found with id: " + id));
        existingMeeting.setMeetingStatus(meeting.getMeetingStatus());
        existingMeeting.setMeetingDate(meeting.getMeetingDate());
        existingMeeting.setMeetingTime(meeting.getMeetingTime());
        existingMeeting.setMeetingDuration(meeting.getMeetingDuration());
        existingMeeting.setPassword(meeting.getPassword());
        if (meeting.getClient() != null && meeting.getClient().getId() != null) {
            UserEntity client = userRepository.findById(meeting.getClient().getId())
                    .orElseThrow(() -> new RuntimeException("Client not found with id: " + meeting.getClient().getId()));
            existingMeeting.setClient(client);
            if (!client.getMeetings().contains(existingMeeting)) {
                client.getMeetings().add(existingMeeting);
                userRepository.save(client);
            }
        }
        Meeting updatedMeeting = meetingRepository.save(existingMeeting);
        if (updatedMeeting.getClient() != null && updatedMeeting.getClient().getEmail() != null) {
            sendMeetingUpdateEmail(updatedMeeting, updatedMeeting.getClient().getEmail());
        }
        return updatedMeeting;
    }

    public void deleteMeeting(Long id) {
        meetingRepository.deleteById(id);
    }

    public Meeting assignUserToMeeting(Long meetingId, String userId) {
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new RuntimeException("Meeting not found with id: " + meetingId));
        UserEntity client = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        meeting.setClient(client);
        client.getMeetings().add(meeting);
        userRepository.save(client);
        return meetingRepository.save(meeting);
    }

    public List<Meeting> getMeetingsByUserId(String userId) {
        return meetingRepository.findByClientId(userId);
    }

    public Meeting updateMeetingStatus(Long meetingId, MeetingStatus newStatus) {
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new RuntimeException("Meeting not found with id: " + meetingId));
        meeting.setMeetingStatus(newStatus);
        return meetingRepository.save(meeting);
    }

    public List<UserEntity> getClients() {
        return userRepository.findByRole("ROLE_CLIENT");
    }

    public List<Meeting> getMeetingsByCurrentUser() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<UserEntity> userOpt = userRepository.findById(userId);
        if (!userOpt.isPresent()) {
            throw new RuntimeException("Utilisateur connecté non trouvé dans la base de données (ID: " + userId + ").");
        }
        UserEntity client = userOpt.get();
        return meetingRepository.findByClient(client);
    }
}