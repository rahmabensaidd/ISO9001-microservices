package tn.esprit.examen.nomPrenomClasseExamen.services;


import tn.esprit.examen.nomPrenomClasseExamen.entities.Resume;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.ResumeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ResumeService {

    @Autowired
    private ResumeRepository resumeRepository;

    public Resume saveResume(Resume resume) {
        return resumeRepository.save(resume);
    }

    public Resume getResumeById(Long id) {
        return resumeRepository.findById(id).orElseThrow(() -> new RuntimeException("Resume not found"));
    }
}