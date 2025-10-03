package tn.esprit.examen.nomPrenomClasseExamen.services;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import tn.esprit.examen.nomPrenomClasseExamen.entities.UserEntity;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.UserEntityRepository;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final SimpMessagingTemplate messagingTemplate;
    private final JavaMailSender mailSender;
    private final UserEntityRepository userEntityRepository;

    @Override
    public void sendNotification(String userId, String message, String type) {
        Optional<UserEntity> userOptional = userEntityRepository.findById(userId);
        if (userOptional.isPresent()) {
            UserEntity user = userOptional.get();
            messagingTemplate.convertAndSend("/topic/notifications/" + userId, message);
            if (user.isEnableEmailNotifications()) {
                sendEmail(user.getEmail(), "Alerte AFC - " + type, message);
            }
        } else {
            System.out.println("Utilisateur avec l'ID " + userId + " non trouvé.");
        }
    }

    private void sendEmail(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        message.setFrom("noreply@yourapp.com");
        mailSender.send(message);
    }
}