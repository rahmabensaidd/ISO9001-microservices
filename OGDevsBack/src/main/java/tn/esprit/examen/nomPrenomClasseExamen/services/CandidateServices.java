package tn.esprit.examen.nomPrenomClasseExamen.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Candidate;
import tn.esprit.examen.nomPrenomClasseExamen.entities.JobOffer;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.CandidateRepository;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.JobOfferRepository;

import java.io.ByteArrayInputStream;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.Base64;

@Service
@RequiredArgsConstructor
@Slf4j
public class CandidateServices implements ICandidateServices {

    private final CandidateRepository candidateRepository;
    private final JobOfferRepository jobOfferRepository;
    private final EmailService emailService;
    private final RestTemplate restTemplate = new RestTemplate();
    private static final String SIMILARITY_API_URL = "http://localhost:8000/calculate_similarity"; // Corrected port

    // Weightings for scoring criteria
    private static final double WEIGHT_EXPERIENCE = 0.35;
    private static final double WEIGHT_SKILLS = 0.35;
    private static final double WEIGHT_TOOLS = 0.20;
    private static final double WEIGHT_QUALITIES = 0.10;

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

        candidate.getJobOffers().add(jobOffer);
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

            String jobOfferTitle = candidate.getJobOffers().isEmpty()
                    ? "Unknown Job Offer"
                    : candidate.getJobOffers().iterator().next().getTitle();
            log.info("Job offer title: {}", jobOfferTitle);

            emailService.sendAcceptanceEmail(
                    candidate.getEmail(),
                    candidate.getFirstName() + " " + candidate.getLastName(),
                    jobOfferTitle
            );
            log.info("Acceptance email sent to: {}", candidate.getEmail());

            return candidate;
        } catch (Exception e) {
            log.error("Error in acceptCandidate: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to accept candidate with id " + candidateId + ": " + e.getMessage(), e);
        }
    }

    // Extract text from a Base64-encoded PDF
    private String extractTextFromPDF(String base64EncodedPDF) {
        try {
            if (base64EncodedPDF == null || base64EncodedPDF.trim().isEmpty()) {
                log.warn("Base64-encoded PDF is null or empty");
                return "";
            }
            String base64 = base64EncodedPDF.replace("data:application/pdf;base64,", "").trim();
            byte[] decodedBytes = Base64.getDecoder().decode(base64);
            ByteArrayInputStream byteArrayInputStream = new ByteArrayInputStream(decodedBytes);
            try (PDDocument document = PDDocument.load(byteArrayInputStream)) {
                PDFTextStripper textStripper = new PDFTextStripper();
                String text = textStripper.getText(document);
                log.info("Extracted PDF text: {}", text);
                return text;
            }
        } catch (Exception e) {
            log.error("Error extracting text from PDF: {}", e.getMessage(), e);
            return "";
        }
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

    // Call the Python API for semantic similarity
    private double calculateSemanticSimilarity(List<String> resumeSentences, List<String> jobSentences) {
        try {
            log.info("Sending to FastAPI - Resume sentences: {}", resumeSentences);
            log.info("Sending to FastAPI - Job sentences: {}", jobSentences);
            if (resumeSentences.isEmpty() || jobSentences.isEmpty()) {
                log.warn("Empty sentence lists sent to FastAPI");
                return 0.0;
            }
            Map<String, List<String>> request = new HashMap<>();
            request.put("resume_sentences", resumeSentences);
            request.put("job_sentences", jobSentences);

            HttpEntity<Map<String, List<String>>> requestEntity = new HttpEntity<>(request);
            ResponseEntity<Map> response = restTemplate.exchange(SIMILARITY_API_URL, HttpMethod.POST, requestEntity, Map.class);
            log.info("FastAPI response status: {}", response.getStatusCode());
            log.info("FastAPI response body: {}", response.getBody());

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null && response.getBody().containsKey("similarity")) {
                double similarity = ((Number) response.getBody().get("similarity")).doubleValue();
                log.info("Received similarity score: {}", similarity);
                return similarity;
            } else {
                log.error("Invalid response from FastAPI: {}", response.getBody());
                return 0.0;
            }
        } catch (HttpClientErrorException e) {
            log.error("FastAPI error - Status: {}, Response: {}", e.getStatusCode(), e.getResponseBodyAsString());
            return 0.0;
        } catch (Exception e) {
            log.error("Error calling FastAPI: {}", e.getMessage(), e);
            return 0.0;
        }
    }

    // Calculate a candidate's score relative to a job offer
    public double calculateCandidateScore(Candidate candidate, JobOffer jobOffer) {
        log.info("Calculating score for candidate {} and job offer {}", candidate.getId(), jobOffer.getId());
        if (candidate.getResume() == null || jobOffer.getDescription() == null) {
            log.warn("Resume or job description are null for candidate {} or job offer {}",
                    candidate.getId(), jobOffer.getId());
            return 0.0;
        }

        // Extract and preprocess text
        String resumeText = preprocessText(extractTextFromPDF(candidate.getResume()));
        String jobText = preprocessText(jobOffer.getDescription() + " " + jobOffer.getRequirements());

        if (resumeText.isEmpty()) {
            log.warn("No text extracted from resume for candidate {}", candidate.getId());
            return 0.0;
        }

        // Extract sentences
        List<String> resumeSentences = extractSentences(resumeText);
        List<String> jobSentences = extractSentences(jobText);

        // Calculate sub-scores
        double experienceScore = calculateExperienceScore(resumeSentences, jobSentences);
        double skillsScore = calculateSkillsScore(resumeSentences, jobSentences);
        double toolsScore = calculateToolsScore(resumeSentences, jobSentences);
        double qualitiesScore = calculateQualitiesScore(resumeSentences, jobSentences);

        // Final score
        double finalScore = (experienceScore * WEIGHT_EXPERIENCE) +
                (skillsScore * WEIGHT_SKILLS) +
                (toolsScore * WEIGHT_TOOLS) +
                (qualitiesScore * WEIGHT_QUALITIES);

        log.info("Score for candidate {}: experience={}, skills={}, tools={}, qualities={}, final={}",
                candidate.getId(), experienceScore, skillsScore, toolsScore, qualitiesScore, finalScore);
        return finalScore;
    }

    // Calculate experience score
    private double calculateExperienceScore(List<String> resumeSentences, List<String> jobSentences) {
        List<String> experienceResumeSentences = resumeSentences.stream()
                .filter(s -> s.contains("experience") || s.contains("annee") || s.contains("year"))
                .collect(Collectors.toList());
        List<String> experienceJobSentences = jobSentences.stream()
                .filter(s -> s.contains("experience") || s.contains("annee") || s.contains("year"))
                .collect(Collectors.toList());
        log.info("Experience resume sentences: {}", experienceResumeSentences);
        log.info("Experience job sentences: {}", experienceJobSentences);

        if (experienceResumeSentences.isEmpty() || experienceJobSentences.isEmpty()) {
            // Fall back to raw sentences if no experience-specific sentences are found
            experienceResumeSentences = resumeSentences.isEmpty() ? Collections.emptyList() : resumeSentences;
            experienceJobSentences = jobSentences.isEmpty() ? Collections.emptyList() : jobSentences;
            log.info("Falling back to raw sentences for experience scoring");
        }

        if (experienceResumeSentences.isEmpty() || experienceJobSentences.isEmpty()) {
            log.warn("No sentences available for experience scoring");
            return 0.0;
        }

        // Extract years to adjust the score
        Pattern experiencePattern = Pattern.compile("(\\d+)\\s*(an|annee|year|years)\\b", Pattern.CASE_INSENSITIVE);
        int requiredYears = 0;
        for (String sentence : experienceJobSentences) {
            Matcher matcher = experiencePattern.matcher(sentence);
            if (matcher.find()) {
                requiredYears = Math.max(requiredYears, Integer.parseInt(matcher.group(1)));
            }
        }

        int candidateYears = 0;
        for (String sentence : experienceResumeSentences) {
            Matcher matcher = experiencePattern.matcher(sentence);
            if (matcher.find()) {
                candidateYears = Math.max(candidateYears, Integer.parseInt(matcher.group(1)));
            }
        }

        double yearsScore = requiredYears > 0 ? Math.min((double) candidateYears / requiredYears, 1.0) : 0.5;
        double semanticScore = calculateSemanticSimilarity(experienceResumeSentences, experienceJobSentences);
        return 0.6 * yearsScore + 0.4 * semanticScore;
    }

    // Calculate skills score
    private double calculateSkillsScore(List<String> resumeSentences, List<String> jobSentences) {
        List<String> skillsResumeSentences = resumeSentences.stream()
                .filter(s -> s.contains("competence") || s.contains("creation") || s.contains("developpement") ||
                        s.contains("maille") || s.contains("textile") || s.contains("skill") || s.contains("java") ||
                        s.contains("python") || s.contains("spring"))
                .collect(Collectors.toList());
        List<String> skillsJobSentences = jobSentences.stream()
                .filter(s -> s.contains("competence") || s.contains("creation") || s.contains("developpement") ||
                        s.contains("maille") || s.contains("textile") || s.contains("skill") || s.contains("java") ||
                        s.contains("python") || s.contains("spring"))
                .collect(Collectors.toList());
        log.info("Skills resume sentences: {}", skillsResumeSentences);
        log.info("Skills job sentences: {}", skillsJobSentences);

        if (skillsResumeSentences.isEmpty() || skillsJobSentences.isEmpty()) {
            // Fall back to raw sentences if no skill-specific sentences are found
            skillsResumeSentences = resumeSentences.isEmpty() ? Collections.emptyList() : resumeSentences;
            skillsJobSentences = jobSentences.isEmpty() ? Collections.emptyList() : jobSentences;
            log.info("Falling back to raw sentences for skills scoring");
        }

        if (skillsResumeSentences.isEmpty() || skillsJobSentences.isEmpty()) {
            log.warn("No sentences available for skills scoring");
            return 0.0;
        }

        return calculateSemanticSimilarity(skillsResumeSentences, skillsJobSentences);
    }

    // Calculate tools score
    private double calculateToolsScore(List<String> resumeSentences, List<String> jobSentences) {
        List<String> toolsResumeSentences = resumeSentences.stream()
                .filter(s -> s.contains("lectra") || s.contains("tool") || s.contains("software"))
                .collect(Collectors.toList());
        List<String> toolsJobSentences = jobSentences.stream()
                .filter(s -> s.contains("lectra") || s.contains("tool") || s.contains("software"))
                .collect(Collectors.toList());
        log.info("Tools resume sentences: {}", toolsResumeSentences);
        log.info("Tools job sentences: {}", toolsJobSentences);

        if (toolsResumeSentences.isEmpty() || toolsJobSentences.isEmpty()) {
            // Fall back to raw sentences if no tool-specific sentences are found
            toolsResumeSentences = resumeSentences.isEmpty() ? Collections.emptyList() : resumeSentences;
            toolsJobSentences = jobSentences.isEmpty() ? Collections.emptyList() : jobSentences;
            log.info("Falling back to raw sentences for tools scoring");
        }

        if (toolsResumeSentences.isEmpty() || toolsJobSentences.isEmpty()) {
            log.warn("No sentences available for tools scoring");
            return 0.0;
        }

        return calculateSemanticSimilarity(toolsResumeSentences, toolsJobSentences);
    }

    // Calculate qualities score
    private double calculateQualitiesScore(List<String> resumeSentences, List<String> jobSentences) {
        List<String> qualitiesResumeSentences = resumeSentences.stream()
                .filter(s -> s.contains("creativite") || s.contains("rigueur") || s.contains("detail") ||
                        s.contains("equipe") || s.contains("delais") || s.contains("team") || s.contains("organized"))
                .collect(Collectors.toList());
        List<String> qualitiesJobSentences = jobSentences.stream()
                .filter(s -> s.contains("creativite") || s.contains("rigueur") || s.contains("detail") ||
                        s.contains("equipe") || s.contains("delais") || s.contains("team") || s.contains("organized"))
                .collect(Collectors.toList());
        log.info("Qualities resume sentences: {}", qualitiesResumeSentences);
        log.info("Qualities job sentences: {}", qualitiesJobSentences);

        if (qualitiesResumeSentences.isEmpty() || qualitiesJobSentences.isEmpty()) {
            // Fall back to raw sentences if no quality-specific sentences are found
            qualitiesResumeSentences = resumeSentences.isEmpty() ? Collections.emptyList() : resumeSentences;
            qualitiesJobSentences = jobSentences.isEmpty() ? Collections.emptyList() : jobSentences;
            log.info("Falling back to raw sentences for qualities scoring");
        }

        if (qualitiesResumeSentences.isEmpty() || qualitiesJobSentences.isEmpty()) {
            log.warn("No sentences available for qualities scoring");
            return 0.0;
        }

        return calculateSemanticSimilarity(qualitiesResumeSentences, qualitiesJobSentences);
    }

    @Override
    public List<Candidate> getAllCandidatesSortedByScore(Long jobOfferId) {
        log.info("Fetching candidates sorted by score for job offer {}", jobOfferId);
        JobOffer jobOffer = jobOfferRepository.findById(jobOfferId)
                .orElseThrow(() -> new IllegalArgumentException("Job offer not found"));

        List<Candidate> candidates = jobOffer.getCandidates().stream().collect(Collectors.toList());
        log.info("Found {} candidates for job offer {}", candidates.size(), jobOfferId);

        return candidates.stream()
                .peek(candidate -> {
                    double score = calculateCandidateScore(candidate, jobOffer);
                    log.info("Setting score {} for candidate {}", score, candidate.getId());
                    candidate.setScore(score);
                })
                .sorted(Comparator.comparingDouble(Candidate::getScore).reversed())
                .collect(Collectors.toList());
    }
}