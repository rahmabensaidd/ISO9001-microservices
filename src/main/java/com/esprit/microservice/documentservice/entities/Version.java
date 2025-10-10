package com.esprit.microservice.documentservice.entities;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level= AccessLevel.PRIVATE)
@Entity
public class Version  implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    private Long numeroVersion;
    private LocalDate dateCreation;
    private String contenu;
    private String modifiePar;
    private String modificationDetails;
    @ManyToOne
    private Document document;
    @Enumerated(EnumType.STRING)
    private StatutDocument statut;
}

