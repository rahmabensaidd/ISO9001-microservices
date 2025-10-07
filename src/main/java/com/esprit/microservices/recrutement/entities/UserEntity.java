package com.esprit.microservices.recrutement.entities;

import com.esprit.microservices.recrutement.entities.Interview;
import com.esprit.microservices.recrutement.entities.JobOffer;
import com.esprit.microservices.recrutement.entities.Training;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import jdk.dynalink.Operation;
import lombok.*;
import lombok.experimental.FieldDefaults;

import javax.management.relation.Role;
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

    @JoinTable(
            name = "customers_roles",
            joinColumns = @JoinColumn(name = "customer_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )

    @OneToMany(fetch = FetchType.LAZY)
    @JsonIgnore
    Set<Interview> interviews;

    @OneToMany(fetch = FetchType.LAZY)
    @JsonIgnore
    Set<JobOffer> jobOffers;

    @OneToMany(mappedBy = "Responsable_RH", fetch = FetchType.LAZY)
    @JsonIgnore
    Set<Training> rh_trainings;


}
