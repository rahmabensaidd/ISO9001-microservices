package tn.esprit.examen.nomPrenomClasseExamen.services;

public interface NotificationService {
    void sendNotification(String userId, String message, String type);
}