package tn.esprit.examen.nomPrenomClasseExamen.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CommentDTO {
    @NotBlank(message = "Comment text is required")
    @Size(max = 500, message = "Comment text must not exceed 500 characters")
    private String text;

    // Getters and setters
    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }
}
