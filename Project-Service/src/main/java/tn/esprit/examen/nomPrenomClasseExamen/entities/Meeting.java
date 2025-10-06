package tn.esprit.examen.nomPrenomClasseExamen.entities;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "meetingid")
public class Meeting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long meetingid;

    @Enumerated(EnumType.STRING)
    MeetingStatus meetingStatus;

    String meetingDate;

    String meetingTime;

    Integer meetingDuration;

    String meetingLink;

    String password;

    @ManyToOne(fetch = FetchType.EAGER)
    UserEntity client;
}

