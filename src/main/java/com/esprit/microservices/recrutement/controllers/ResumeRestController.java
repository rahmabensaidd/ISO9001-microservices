package com.esprit.microservices.recrutement.controllers;



import com.esprit.microservices.recrutement.entities.Resume;
import com.esprit.microservices.recrutement.services.ResumeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/resumes")
public class ResumeRestController {

    @Autowired
    private ResumeService resumeService;

    @PostMapping
    public ResponseEntity<Resume> createResume(@RequestBody Resume resume) {
        return ResponseEntity.ok(resumeService.saveResume(resume));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resume> getResume(@PathVariable Long id) {
        return ResponseEntity.ok(resumeService.getResumeById(id));
    }
}