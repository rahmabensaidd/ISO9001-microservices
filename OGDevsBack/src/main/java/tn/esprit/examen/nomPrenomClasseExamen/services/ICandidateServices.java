package tn.esprit.examen.nomPrenomClasseExamen.services;

import tn.esprit.examen.nomPrenomClasseExamen.entities.Candidate;

import java.util.List;
import java.util.Optional;

public interface ICandidateServices {
    Candidate createCandidate(Candidate candidate);
    Candidate updateCandidate(Long id, Candidate candidate);
    Optional<Candidate> getCandidateById(Long id);
    List<Candidate> getAllCandidates();
    void deleteCandidate(Long id);
    void assignCandidateToJobOffer(Long candidateId, Long jobOfferId);
    public Candidate acceptCandidate(Long candidateId);
    public List<Candidate> getAllCandidatesSortedByScore(Long jobOfferId);

}
