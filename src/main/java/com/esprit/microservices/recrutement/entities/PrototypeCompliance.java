package com.esprit.microservices.recrutement.entities;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Set;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level= AccessLevel.PRIVATE)
@Entity
public class PrototypeCompliance {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long prototypeCompliance_id;
    private String name;
    private boolean approoved;

    @OneToMany(mappedBy = "prototypeCompliance")
    Set<Prototype>prototypes;
    @OneToMany(mappedBy = "prototypeCompliance")
    Set<Feedback>feedbacks;
}
