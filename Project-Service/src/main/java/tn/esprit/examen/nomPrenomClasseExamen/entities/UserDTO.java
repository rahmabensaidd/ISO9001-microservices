package tn.esprit.examen.nomPrenomClasseExamen.entities;

import com.fasterxml.jackson.annotation.JsonProperty;

public class UserDTO {

    @JsonProperty("id") // Ajouter cette annotation pour être explicite sur le nom dans le JSON
    private String id;

    @JsonProperty("username")
    private String username;

    @JsonProperty("email")
    private String email;

    // Constructeur avec tous les champs
    public UserDTO(String id, String username, String email) {
        this.id = id;
        this.username = username;
        this.email = email;
    }

    // Constructeur qui prend une entité UserEntity et la transforme en UserDTO
    public UserDTO(UserEntity developer) {
        this.id = developer.getId();  // Associe l'ID de l'utilisateur
        this.username = developer.getUsername();  // Associe le nom d'utilisateur
        this.email = developer.getEmail();  // Associe l'email de l'utilisateur
    }

    // Getters et Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
