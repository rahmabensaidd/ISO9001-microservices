package com.esprit.microservices.recrutement.controllers;

import com.esprit.microservices.recrutement.entities.Interview;
import com.esprit.microservices.recrutement.services.IInterviewServices;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/interviews")
@CrossOrigin(origins = "http://localhost:4200")
public class InterviewRestController {

    private final IInterviewServices interviewServices;

    @PostMapping
    public ResponseEntity<Interview> createInterview(@RequestBody Interview interview) {
        Interview createdInterview = interviewServices.createInterview(interview);
        return new ResponseEntity<>(createdInterview, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Interview> updateInterview(@PathVariable Long id, @RequestBody Interview interview) {
        try {
            Interview updatedInterview = interviewServices.updateInterview(id, interview);
            return new ResponseEntity<>(updatedInterview, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Interview> getInterviewById(@PathVariable Long id) {
        Optional<Interview> interview = interviewServices.getInterviewById(id);
        return interview.map(ResponseEntity::ok).orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping
    public ResponseEntity<List<Interview>> getAllInterviews() {
        List<Interview> interviews = interviewServices.getAllInterviews();
        return new ResponseEntity<>(interviews, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInterview(@PathVariable Long id) {
        try {
            interviewServices.deleteInterview(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/available-slots")
    public ResponseEntity<List<LocalDateTime>> getAvailableSlots(@RequestParam String startDate) {
        LocalDate date = LocalDate.parse(startDate); // Format attendu : "2025-03-31"
        List<LocalDateTime> slots = interviewServices.getAvailableSlots(date);
        return new ResponseEntity<>(slots, HttpStatus.OK);
    }
}