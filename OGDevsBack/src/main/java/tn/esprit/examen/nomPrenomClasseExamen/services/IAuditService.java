package tn.esprit.examen.nomPrenomClasseExamen.services;

import tn.esprit.examen.nomPrenomClasseExamen.entities.Audit;
import java.util.List;

public interface IAuditService {
    Audit createAudit(Audit audit);
    Audit updateAudit(Long id, Audit audit);
    void deleteAudit(Long id);
    Audit getAuditById(Long id);
    List<Audit> getAllAudits();
}