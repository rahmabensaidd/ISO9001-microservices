package com.esprit.microservices.recrutement.services;



import com.esprit.microservices.recrutement.entities.Resume;
import com.esprit.microservices.recrutement.repositories.ResumeRepository;
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