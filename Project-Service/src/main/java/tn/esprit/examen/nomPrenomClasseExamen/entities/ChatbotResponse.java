package tn.esprit.examen.nomPrenomClasseExamen.entities;

public class ChatbotResponse {
    private String response;
    private String error;

    public ChatbotResponse(String response, String error) {
        this.response = response;
        this.error = error;
    }

    // Getters and setters
    public String getResponse() {
        return response;
    }

    public void setResponse(String response) {
        this.response = response;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }
}
