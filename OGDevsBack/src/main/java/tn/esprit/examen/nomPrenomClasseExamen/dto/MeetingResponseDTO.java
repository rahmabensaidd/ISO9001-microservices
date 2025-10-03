package tn.esprit.examen.nomPrenomClasseExamen.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
public class MeetingResponseDTO {
    private Long meetingid;
    private String meetingStatus;
    private String meetingDate;
    private String meetingTime;
    private Integer meetingDuration;
    private String meetingLink;
    private String password;

    public MeetingResponseDTO(tn.esprit.examen.nomPrenomClasseExamen.entities.Meeting meeting) {
        this.meetingid = meeting.getMeetingid();
        this.meetingStatus = meeting.getMeetingStatus() != null ? meeting.getMeetingStatus().name() : null;
        this.meetingDate = meeting.getMeetingDate();
        this.meetingTime = meeting.getMeetingTime();
        this.meetingDuration = meeting.getMeetingDuration();
        this.meetingLink = meeting.getMeetingLink();
        this.password = meeting.getPassword();
    }
}