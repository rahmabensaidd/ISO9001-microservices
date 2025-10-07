package com.esprit.microservices.recrutement.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.esprit.microservices.recrutement.entities.Candidate;
import com.esprit.microservices.recrutement.entities.JobOffer;
import com.esprit.microservices.recrutement.repositories.CandidateRepository;
import com.esprit.microservices.recrutement.repositories.JobOfferRepository;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CandidateServices implements com.esprit.microservices.recrutement.services.ICandidateServices {

    private final CandidateRepository candidateRepository;
    private final JobOfferRepository jobOfferRepository;
    private final RestTemplate restTemplate = new RestTemplate();


    @Override
    public Candidate createCandidate(Candidate candidate) {
        log.info("Creating candidate: {}", candidate);
        return candidateRepository.save(candidate);
    }

    @Override
    public Candidate updateCandidate(Long id, Candidate candidate) {
        if (!candidateRepository.existsById(id)) {
            throw new IllegalArgumentException("Candidate with id " + id + " does not exist.");
        }
        candidate.setId(id);
        log.info("Updating candidate with id {}: {}", id, candidate);
        return candidateRepository.save(candidate);
    }

    @Override
    public Optional<Candidate> getCandidateById(Long id) {
        log.info("Fetching candidate with id: {}", id);
        return candidateRepository.findById(id);
    }

    @Override
    public List<Candidate> getAllCandidates() {
        List<Candidate> candidates = candidateRepository.findAll();
        log.info("Retrieved all candidates: {}", candidates);
        return candidates;
    }

    @Override
    public void deleteCandidate(Long id) {
        if (!candidateRepository.existsById(id)) {
            throw new IllegalArgumentException("Candidate with id " + id + " does not exist.");
        }
        log.info("Deleting candidate with id: {}", id);
        candidateRepository.deleteById(id);
    }

    @Override
    public void assignCandidateToJobOffer(Long candidateId, Long jobOfferId) {
        Optional<Candidate> candidateOpt = candidateRepository.findById(candidateId);
        Optional<JobOffer> jobOfferOpt = jobOfferRepository.findById(jobOfferId);

        if (!candidateOpt.isPresent()) {
            throw new IllegalArgumentException("Candidate with id " + candidateId + " does not exist.");
        }
        if (!jobOfferOpt.isPresent()) {
            throw new IllegalArgumentException("Job Offer with id " + jobOfferId + " does not exist.");
        }

        Candidate candidate = candidateOpt.get();
        JobOffer jobOffer = jobOfferOpt.get();

        jobOffer.getCandidates().add(candidate);

        candidateRepository.save(candidate);
        jobOfferRepository.save(jobOffer);
        log.info("Assigned candidate {} to job offer {}", candidate.getFirstName(), jobOffer.getTitle());
    }

    @Override
    public Candidate acceptCandidate(Long candidateId) {
        log.info("Starting acceptCandidate for candidateId: {}", candidateId);
        try {
            Candidate candidate = getCandidateById(candidateId)
                    .orElseThrow(() -> new IllegalArgumentException("Candidate with id " + candidateId + " does not exist."));
            log.info("Candidate retrieved: {}", candidate);


            return candidate;
        } catch (Exception e) {
            log.error("Error in acceptCandidate: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to accept candidate with id " + candidateId + ": " + e.getMessage(), e);
        }
    }

    @Override
    public List<Candidate> getAllCandidatesSortedByScore(Long jobOfferId) {
        return List.of();
    }

    // Preprocess text
    private String preprocessText(String text) {
        if (text == null) {
            return "";
        }
        String normalized = text.toLowerCase()
                .replaceAll("[àáâãäå]", "a")
                .replaceAll("[èéêë]", "e")
                .replaceAll("[ìíîï]", "i")
                .replaceAll("[òóôõö]", "o")
                .replaceAll("[ùúûü]", "u")
                .replaceAll("[ç]", "c")
                .replaceAll("[^a-z0-9\\s\\.]", " ") // Keep periods for sentence splitting
                .replaceAll("\\s+", " ")
                .trim();
        log.info("Preprocessed text: {}", normalized);
        return normalized;
    }

    // Extract relevant sentences
    private List<String> extractSentences(String text) {
        if (text == null || text.trim().isEmpty()) {
            log.warn("Text is empty; no sentences to extract");
            return Collections.emptyList();
        }
        String[] sentences = text.split("[.!?]");
        List<String> result = Arrays.stream(sentences)
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
        log.info("Extracted sentences: {}", result);
        return result;
    }


}