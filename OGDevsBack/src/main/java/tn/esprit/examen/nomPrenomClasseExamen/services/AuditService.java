package tn.esprit.examen.nomPrenomClasseExamen.services;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Audit;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.AuditRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditService implements IAuditService {

    private final AuditRepository auditRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public Audit createAudit(Audit audit) {
        Audit savedAudit = auditRepository.save(audit);
        String message = String.format("New audit created ", savedAudit);
        messagingTemplate.convertAndSend("/room/notifications", message);
        return savedAudit;
    }

    @Override
    public Audit updateAudit(Long id, Audit audit) {
        Audit existingAudit = auditRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Audit not found"));
        existingAudit.setTitle(audit.getTitle());
        existingAudit.setDescription(audit.getDescription());
        existingAudit.setStartDate(audit.getStartDate());
        existingAudit.setEndDate(audit.getEndDate());
        existingAudit.setProcess(audit.getProcess());
        existingAudit.setOperation(audit.getOperation());
        Audit updatedAudit = auditRepository.save(existingAudit);
        String message = String.format("Audit updated ", updatedAudit);
        messagingTemplate.convertAndSend("/room/notifications", message);
        return updatedAudit;
    }

    @Override
    public void deleteAudit(Long id) {
        if (!auditRepository.existsById(id)) {
            throw new IllegalArgumentException("Audit not found");
        }
        auditRepository.deleteById(id);
        String message = String.format("Audit deleted ");
        messagingTemplate.convertAndSend("/room/notifications", message);
    }

    @Override
    public Audit getAuditById(Long id) {
        return auditRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Audit  not found"));
    }

    @Override
    public List<Audit> getAllAudits() {
        return auditRepository.findAll();
    }
}