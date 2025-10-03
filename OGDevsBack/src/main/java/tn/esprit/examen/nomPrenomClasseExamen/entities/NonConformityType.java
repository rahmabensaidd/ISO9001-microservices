package tn.esprit.examen.nomPrenomClasseExamen.entities;

public enum NonConformityType {
    BUG("Bug"),
    PERFORMANCE("Performance"),
    SECURITY("Sécurité"),
    COMPATIBILITY("Compatibilité"),
    OTHERS("Autres");

    private final String displayName;

    NonConformityType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
