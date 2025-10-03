package tn.esprit.examen.nomPrenomClasseExamen.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Candidate;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Interview;
import tn.esprit.examen.nomPrenomClasseExamen.entities.JobOffer;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.CandidateRepository;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.InterviewRepository;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.JobOfferRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RequiredArgsConstructor
@Slf4j
@Service
public class InterviewServices implements IInterviewServices {

    private final InterviewRepository interviewRepository;
    private final JobOfferRepository jobOfferRepository;
    private final CandidateRepository candidateRepository;
    private final EmailService emailService;

    @Override
    public Interview createInterview(Interview interview) {
        log.info("Creating interview: {}", interview);
        validateInterview(interview);
        Interview savedInterview = interviewRepository.save(interview);

        // Send interview scheduling email to the candidate
        if (savedInterview.getCandidate() != null && savedInterview.getCandidate().getEmail() != null) {
            String candidateName = savedInterview.getCandidate().getFirstName() + " " + savedInterview.getCandidate().getLastName();
            String jobOfferTitle = savedInterview.getJobOffer() != null ? savedInterview.getJobOffer().getTitle() : "Offre d'emploi";
            emailService.sendInterviewSchedulingEmail(
                    savedInterview.getCandidate().getEmail(),
                    candidateName,
                    jobOfferTitle,
                    savedInterview.getInterviewDate()
            );
            log.info("Interview scheduling email sent to: {}", savedInterview.getCandidate().getEmail());
        } else {
            log.warn("No candidate email found for interview: {}", savedInterview.getIdInterview());
        }

        return savedInterview;
    }

    @Override
    public Interview updateInterview(Long id, Interview interview) {
        if (!interviewRepository.existsById(id)) {
            throw new IllegalArgumentException("Interview avec ID " + id + " n'existe pas.");
        }
        interview.setIdInterview(id);
        log.info("Updating interview with id {}: {}", id, interview);
        validateInterview(interview);
        Interview updatedInterview = interviewRepository.save(interview);

        // Send interview scheduling email to the candidate for updates
        if (updatedInterview.getCandidate() != null && updatedInterview.getCandidate().getEmail() != null) {
            String candidateName = updatedInterview.getCandidate().getFirstName() + " " + updatedInterview.getCandidate().getLastName();
            String jobOfferTitle = updatedInterview.getJobOffer() != null ? updatedInterview.getJobOffer().getTitle() : "Offre d'emploi";
            emailService.sendInterviewSchedulingEmail(
                    updatedInterview.getCandidate().getEmail(),
                    candidateName,
                    jobOfferTitle,
                    updatedInterview.getInterviewDate()
            );
            log.info("Interview scheduling email sent for updated interview to: {}", updatedInterview.getCandidate().getEmail());
        } else {
            log.warn("No candidate email found for updated interview: {}", updatedInterview.getIdInterview());
        }

        return updatedInterview;
    }

    @Override
    public Optional<Interview> getInterviewById(Long id) {
        log.info("Fetching interview with id: {}", id);
        return interviewRepository.findById(id);
    }

    @Override
    public List<Interview> getAllInterviews() {
        List<Interview> interviews = interviewRepository.findAll();
        log.info("Retrieved all interviews: {}", interviews);
        return interviews;
    }

    @Override
    public void deleteInterview(Long id) {
        if (!interviewRepository.existsById(id)) {
            throw new IllegalArgumentException("Interview avec ID " + id + " n'existe pas.");
        }
        log.info("Deleting interview with id: {}", id);
        interviewRepository.deleteById(id);
    }

    @Override
    public List<LocalDateTime> getAvailableSlots(LocalDate startDate) {
        LocalDate endDate = startDate.plusDays(7);
        List<LocalDateTime> occupiedSlots = getOccupiedSlots(startDate);
        List<LocalDateTime> availableSlots = new ArrayList<>();

        for (LocalDate date = startDate; date.isBefore(endDate); date = date.plusDays(1)) {
            for (int hour = 9; hour < 17; hour++) {
                LocalDateTime slot = date.atStartOfDay().plusHours(hour);
                if (!occupiedSlots.contains(slot)) {
                    availableSlots.add(slot);
                }
            }
        }
        log.info("Available slots for week starting {}: {}", startDate, availableSlots);
        return availableSlots;
    }

    private List<LocalDateTime> getOccupiedSlots(LocalDate startDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = startDate.plusDays(7).atStartOfDay();
        List<Interview> interviews = interviewRepository.findByInterviewDateBetween(start, end);
        List<LocalDateTime> occupiedSlots = new ArrayList<>();
        for (Interview interview : interviews) {
            occupiedSlots.add(interview.getInterviewDate());
        }
        log.info("Occupied slots for week starting {}: {}", startDate, occupiedSlots);
        return occupiedSlots;
    }

    private void validateInterview(Interview interview) {
        if (interview.getJobOffer() != null && !jobOfferRepository.existsById(interview.getJobOffer().getId())) {
            throw new IllegalArgumentException("L'offre d'emploi avec ID " + interview.getJobOffer().getId() + " n'existe pas.");
        }
        if (interview.getCandidate() != null && !candidateRepository.existsById(interview.getCandidate().getId())) {
            throw new IllegalArgumentException("Le candidat avec ID " + interview.getCandidate().getId() + " n'existe pas.");
        }
    }
}