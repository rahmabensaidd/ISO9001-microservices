package tn.esprit.examen.nomPrenomClasseExamen.services;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendAcceptanceEmail(String toEmail, String candidateName, String jobOfferTitle) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Congratulations! You Have Been Accepted for the Job Offer");
        message.setText(
                "Dear " + candidateName + ",\n\n" +
                        "We are pleased to inform you that you have been accepted for the position associated with the job offer: " + jobOfferTitle + ".\n" +

                        "Best regards,\n" +
                        "The Recruitment Team"
        );
        message.setFrom("alabbr55@gmail.com"); // Must match spring.mail.username
        try {
            mailSender.send(message);
            log.info("Acceptance email sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send acceptance email to {}: {}", toEmail, e.getMessage(), e);
        }
    }

    public void sendApplicationConfirmationEmail(String toEmail, String candidateName, String jobOfferTitle) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Confirmation de votre candidature");
        message.setText(
                "Dear " + candidateName + ",\n\n" +
                        "We confirm the receipt of your application for the job offer: " + jobOfferTitle + ".\n" +
                        "Your application is currently under review. We will contact you soon if your profile is selected.\n\n" +
                        "Best regards,\n" +
                        "The Recruitment Team"
        );
        message.setFrom("alabbr55@gmail.com"); // Doit correspondre à spring.mail.username
        try {
            mailSender.send(message);
            log.info("Application confirmation email sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send application confirmation email to {}: {}", toEmail, e.getMessage(), e);
        }
    }

    public void sendInterviewSchedulingEmail(String toEmail, String candidateName, String jobOfferTitle, LocalDateTime interviewDate) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Invitation à un entretien d'embauche");
        String formattedDate = interviewDate.format(DateTimeFormatter.ofPattern("dd MMMM yyyy à HH:mm"));
        message.setText(
                "Dear " + candidateName + ",\n\n" +
                        "We are pleased to invite you to a job interview for the position associated with the job offer: " + jobOfferTitle + ".\n" +
                        "Interview Details:\n" +
                        "- **Date and Time**: " + formattedDate + "\n" +
                        "- **Location**: To be confirmed (further details will be provided soon)\n\n" +
                        "Best regards,\n" +
                        "The Recruitment Team"
        );
        message.setFrom("alabbr55@gmail.com"); // Must match spring.mail.username
        try {
            mailSender.send(message);
            log.info("Interview scheduling email sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send interview scheduling email to {}: {}", toEmail, e.getMessage(), e);
        }
    }
}