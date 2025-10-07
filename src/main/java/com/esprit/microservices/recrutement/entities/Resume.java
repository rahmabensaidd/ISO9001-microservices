package com.esprit.microservices.recrutement.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;

@Entity
@Data
public class Resume {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String candidateId;
    private String fullName;
    private String email;
    private String phone;
    private String address;
    private String education;
    private String experience;
    private String skills;
    private String templateStyle;
    private String photo; // Base64 string for the uploaded photo
    private String linkedIn; // URL for LinkedIn profile
    private String languages; // Format: "Français:Avancé,Anglais:Intermédiaire"
    private String interests; // Format: "Lecture,Football,Voyages"
    private String technicalSkills; // Format: "HTML:90%,Java:80%,Python:70%"
}