package tn.esprit.examen.nomPrenomClasseExamen.dto;

import java.util.List;

public class ChatRoomCreationRequest {
    private String name;
    private List<String> userIds;

    // Getters and setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<String> getUserIds() {
        return userIds;
    }

    public void setUserIds(List<String> userIds) {
        this.userIds = userIds;
    }
}