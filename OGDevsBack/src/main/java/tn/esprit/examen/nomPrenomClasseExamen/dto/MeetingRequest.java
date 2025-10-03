package tn.esprit.examen.nomPrenomClasseExamen.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
public class MeetingRequest {
    private String title;
    private String date;
    private String time;
    private Integer duration;
    private String password;
    private String clientId;


}