package tn.esprit.examen.nomPrenomClasseExamen.entities;

import jakarta.persistence.Entity;


public class Phasesugg {

    private String name;
    private String description;

    // Constructeurs
    public Phasesugg() {
    }

    public Phasesugg(String name, String description) {
        this.name = name;
        this.description = description;
    }

    // Getters et Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}