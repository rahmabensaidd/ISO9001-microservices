package tn.esprit.examen.nomPrenomClasseExamen.entities;

public enum TypeDocument {
    FICHE_PAIE("Fiche de Paie"),
    FICHE_POSTE("Fiche de Poste"),
    CONTRAT("Contrat"),
    PROCESSUS_REALISATION("Processus de Réalisation Technique"),
    AUTRE("Autre");

    private final String label;

    TypeDocument(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}