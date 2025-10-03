package tn.esprit.examen.nomPrenomClasseExamen.services;

import tn.esprit.examen.nomPrenomClasseExamen.entities.Meeting;

import java.util.List;

public interface IMeetingService {
    Meeting createMeeting(Meeting meeting);
    Meeting getMeetingById(Long id);
    List<Meeting> getAllMeetings();
    Meeting updateMeeting(Long id, Meeting meeting);
    void deleteMeeting(Long id);
    Meeting assignUserToMeeting(Long meetingId, String userId);
}