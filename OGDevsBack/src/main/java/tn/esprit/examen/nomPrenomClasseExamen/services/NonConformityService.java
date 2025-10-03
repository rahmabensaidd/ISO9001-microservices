package tn.esprit.examen.nomPrenomClasseExamen.services;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import tn.esprit.examen.nomPrenomClasseExamen.entities.*;
import tn.esprit.examen.nomPrenomClasseExamen.exceptions.EntityNotFoundException;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.NonConformityRepository;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.IndicatorRepository;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.UserEntityRepository;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NonConformityService implements INonConformityService {

    private final NonConformityRepository nonConformityRepository;
    private final IndicatorRepository indicatorRepository;
    private final IIndicatorServices indicatorServices;
    private final UserEntityRepository userEntityRepository;
    private static final String UPLOAD_DIR = "Uploads/nonconformities/";

    @Override
    public Non_Conformity addNonConformityManually(Non_Conformity nonConformity) {
        if (nonConformity.getDateCreated() == null) {
            nonConformity.setDateCreated(LocalDate.now());
        }
        if (nonConformity.getStatus() == null) {
            nonConformity.setStatus("OPEN");
        }

        Long indicatorId = nonConformity.getIndicator() != null ? nonConformity.getIndicator().getIdIndicateur() : null;
        if (indicatorId != null) {
            Indicator indicator = indicatorRepository.findById(indicatorId)
                    .orElseThrow(() -> new IllegalArgumentException("Indicator not found with ID: " + indicatorId));
            nonConformity.setIndicator(indicator);
        }

        String userId = extractUserIdFromJwt();
        UserEntity detectedBy = userEntityRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));
        nonConformity.setDetectedBy(detectedBy);
        nonConformity.setDateDetected(LocalDate.now());

        nonConformity.setActionTaken(null);
        nonConformity.setFixDate(null);
        nonConformity.setFixedBy(null);

        if (indicatorId != null) {
            indicatorServices.updateIndicatorValue("IND-MAG-02");
        }

        return nonConformityRepository.save(nonConformity);
    }

    @Override
    public Non_Conformity addNonConformityByIndicator(Non_Conformity nonConformity) {
        if (nonConformity.getDateCreated() == null) {
            nonConformity.setDateCreated(LocalDate.now());
        }
        if (nonConformity.getStatus() == null) {
            nonConformity.setStatus("OPEN");
        }

        Long indicatorId = nonConformity.getIndicator() != null ? nonConformity.getIndicator().getIdIndicateur() : null;
        if (indicatorId == null) {
            throw new IllegalArgumentException("Valid indicator ID must be provided for the non-conformity.");
        }
        Indicator indicator = indicatorRepository.findById(indicatorId)
                .orElseThrow(() -> new IllegalArgumentException("Indicator not found with ID: " + indicatorId));
        nonConformity.setIndicator(indicator);

        nonConformity.setSource(NonConformitySource.INDICATORS);

        String userId = extractUserIdFromJwt();
        UserEntity detectedBy = userEntityRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));
        nonConformity.setDetectedBy(detectedBy);
        nonConformity.setDateDetected(LocalDate.now());

        nonConformity.setActionTaken(null);
        nonConformity.setFixDate(null);
        nonConformity.setFixedBy(null);

        return nonConformityRepository.save(nonConformity);
    }

    @Override
    @Transactional
    public void deleteNonConformity(Long idNonConformity) {
        if (!nonConformityRepository.existsById(idNonConformity)) {
            throw new IllegalArgumentException("Non-conformity not found: " + idNonConformity);
        }
        nonConformityRepository.deleteById(idNonConformity);
    }

    @Override
    public List<NonConformityDTO> getAllNonConformities() {
        return nonConformityRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public NonConformityDTO fixNonConformity(Long id, String actionTaken, LocalDate fixDate, List<MultipartFile> attachments) {
        Non_Conformity nonConformity = nonConformityRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Non-conformity not found with id: " + id));

        String userId = extractUserIdFromJwt();
        UserEntity fixedBy = userEntityRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));

        nonConformity.setStatus("FIXED");
        nonConformity.setActionTaken(actionTaken);
        nonConformity.setFixDate(fixDate);
        nonConformity.setFixedBy(fixedBy);

        if (attachments != null && !attachments.isEmpty()) {
            List<String> attachmentPaths = saveAttachments(attachments, id);
            nonConformity.setAttachments(attachmentPaths);
        }

        Non_Conformity updatedNonConformity = nonConformityRepository.save(nonConformity);
        return mapToDTO(updatedNonConformity);
    }

    @Override
    public Non_Conformity addNonConformityFromFile(String description, List<String> aiSuggestions, List<String> selectedProposals) {
        Non_Conformity nonConformity = new Non_Conformity();
        nonConformity.setDescription(description);
        nonConformity.setSource(NonConformitySource.AUDIT); // Changed from FILE_UPLOAD to AUDIT
        nonConformity.setDateCreated(LocalDate.now());
        nonConformity.setStatus("OPEN");
        nonConformity.setAiSuggestions(aiSuggestions);
        nonConformity.setSelectedProposals(selectedProposals);

        String userId = extractUserIdFromJwt();
        UserEntity detectedBy = userEntityRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));
        nonConformity.setDetectedBy(detectedBy);
        nonConformity.setDateDetected(LocalDate.now());

        nonConformity.setActionTaken(null);
        nonConformity.setFixDate(null);
        nonConformity.setFixedBy(null);

        return nonConformityRepository.save(nonConformity);
    }

    private String extractUserIdFromJwt() {
        Jwt jwt = (Jwt) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return jwt.getSubject();
    }

    private List<String> saveAttachments(List<MultipartFile> attachments, Long nonConformityId) {
        List<String> paths = new ArrayList<>();
        Path uploadPath = Paths.get(UPLOAD_DIR, nonConformityId.toString(), "fixes").toAbsolutePath();

        try {
            Files.createDirectories(uploadPath);

            for (MultipartFile file : attachments) {
                String originalFileName = file.getOriginalFilename();
                if (originalFileName == null || originalFileName.isEmpty()) {
                    throw new IllegalArgumentException("Invalid file name");
                }

                String fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
                String uniqueFileName = UUID.randomUUID().toString() + fileExtension;
                Path filePath = uploadPath.resolve(uniqueFileName);

                if (!filePath.normalize().startsWith(uploadPath)) {
                    throw new SecurityException("Invalid file path");
                }

                Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                paths.add(filePath.toString());
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to store attachments", e);
        }

        return paths;
    }

    @Override
    public NonConformityDTO mapToDTO(Non_Conformity nc) {
        NonConformityDTO dto = new NonConformityDTO();
        dto.setIdNonConformity(nc.getIdNonConformity());
        dto.setSource(nc.getSource());
        dto.setDescription(nc.getDescription());
        dto.setDateCreated(nc.getDateCreated());
        dto.setType(nc.getType());
        dto.setStatus(nc.getStatus());
        dto.setActionTaken(nc.getActionTaken());
        dto.setFixDate(nc.getFixDate());
        dto.setDetectedBy(nc.getDetectedBy() != null ? nc.getDetectedBy().getUsername() : null);
        dto.setDateDetected(nc.getDateDetected());
        dto.setFixedBy(nc.getFixedBy() != null ? nc.getFixedBy().getUsername() : null);
        dto.setIsEffective(nc.getIsEffective());
        dto.setAttachments(nc.getAttachments());
        dto.setAiSuggestions(nc.getAiSuggestions());
        dto.setSelectedProposals(nc.getSelectedProposals());
        if (nc.getIndicator() != null) {
            dto.setIndicatorId(nc.getIndicator().getIdIndicateur());
            IndicatorDTO indicatorDTO = new IndicatorDTO();
            indicatorDTO.setIdIndicateur(nc.getIndicator().getIdIndicateur());
            indicatorDTO.setCode(nc.getIndicator().getCode());
            indicatorDTO.setLibelle(nc.getIndicator().getLibelle());
            indicatorDTO.setFrequence(nc.getIndicator().getFrequence());
            indicatorDTO.setUnite(nc.getIndicator().getUnite());
            indicatorDTO.setCible(nc.getIndicator().getCible());
            List<Non_Conformity> nonConformities = nonConformityRepository.findByIndicator(nc.getIndicator());
            long totalActions = nonConformities.size();
            double currentValue;
            if ("IND-MAG-01".equals(nc.getIndicator().getCode())) {
                long openActions = nonConformities.stream()
                        .filter(n -> "OPEN".equalsIgnoreCase(n.getStatus()))
                        .count();
                currentValue = totalActions > 0 ? ((double) openActions / totalActions) * 100 : 0.0;
            } else {
                long completedActions = nonConformities.stream()
                        .filter(n -> "FIXED".equalsIgnoreCase(n.getStatus()))
                        .count();
                currentValue = totalActions > 0 ? ((double) completedActions / totalActions) * 100 : 0.0;
            }
            System.out.println("Indicator: " + nc.getIndicator().getCode() + ", Total Actions: " + totalActions + ", Current Value: " + currentValue);
            indicatorDTO.setCurrentValue(currentValue);
            indicatorDTO.setStatus(currentValue >= nc.getIndicator().getCible() ? "OK" : "CRITICAL");
            indicatorDTO.setActif(nc.getIndicator().getActif());
            indicatorDTO.setMethodeCalcul(null);
            dto.setIndicator(indicatorDTO);
        }
        return dto;
    }
}