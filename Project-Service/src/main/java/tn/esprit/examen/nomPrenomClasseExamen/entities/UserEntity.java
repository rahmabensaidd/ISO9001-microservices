package tn.esprit.examen.nomPrenomClasseExamen.entities;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "customers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
public class UserEntity {

    @Id
    String id; // ID de Keycloak

    String username;
    String email;
    boolean enabled;
    LocalDate birthdate;
    String position;
    String education;
    String languages;
    String phoneNumber;

    @Column(nullable = false, columnDefinition = "boolean default true")
    boolean enableWebSocketNotifications = true;

    @Column(nullable = false, columnDefinition = "boolean default true")
    boolean enableEmailNotifications = true;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "customers_roles",
            joinColumns = @JoinColumn(name = "customer_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    @JsonIgnore
    Set<Role> roles = new HashSet<>();

    @OneToMany(fetch = FetchType.LAZY)
    @JsonIgnore
    Set<Interview> interviews;

    @OneToMany(fetch = FetchType.LAZY)
    @JsonIgnore
    Set<JobOffer> jobOffers;

    @OneToMany(mappedBy = "Responsable_RH", fetch = FetchType.LAZY)
    @JsonIgnore
    Set<Training> rh_trainings;

    @ManyToMany(fetch = FetchType.LAZY)
    @JsonIgnore
    Set<Operation> operations;

    @OneToOne(fetch = FetchType.EAGER)
    @JsonIgnore
    Poste poste;

    @OneToMany(mappedBy = "createdBy", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    Set<Document> documents;

    @OneToMany(mappedBy = "client", fetch = FetchType.LAZY)
    @JsonIgnore
    List<Meeting> meetings;

    @OneToMany(mappedBy = "client", fetch = FetchType.LAZY)
    @JsonIgnore
    Set<Ticket> tickets = new HashSet<>();

    @OneToMany(mappedBy = "detectedBy", fetch = FetchType.LAZY)
    @JsonManagedReference("user-detectedBy")
    @JsonIgnore
    List<Non_Conformity> detectedNonConformities;

    @OneToMany(mappedBy = "fixedBy", fetch = FetchType.LAZY)
    @JsonIgnore
    Set<Non_Conformity> nonConformities;

    @Lob
    @Column(name = "profile_photo")
    byte[] profilePhoto;

    @Column(name = "profile_photo_path")
    String profilePhotoPath;

    @OneToMany(mappedBy = "client", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    Set<ProjetRequest> projetRequests = new HashSet<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "user_follows",
            joinColumns = @JoinColumn(name = "follower_id"),
            inverseJoinColumns = @JoinColumn(name = "followed_id")
    )
    @JsonIgnore
    Set<UserEntity> following = new HashSet<>();

    @ManyToMany(fetch = FetchType.LAZY, mappedBy = "following")
    @JsonIgnore
    Set<UserEntity> followers = new HashSet<>();

    public void setProfilePhotoPath(String filePath) {
        this.profilePhotoPath = filePath;
    }
}
