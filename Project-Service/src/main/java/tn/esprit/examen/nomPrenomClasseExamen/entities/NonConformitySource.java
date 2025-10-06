package tn.esprit.examen.nomPrenomClasseExamen.entities;

public enum NonConformitySource {
    CLIENT_COMPLAINT("Réclamation client"),
    AUDIT("Audit"),
    CONTROL_AND_MONITORING("Contrôle et surveillance"),
    INDICATORS("Indicateurs"),
    EXTERNAL_PROVIDERS("Prestataires Externes"),
    OTHERS("Autres");

    private final String displayName;

    NonConformitySource(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
