package com.esprit.microservices.recrutement.services;

import com.esprit.microservices.recrutement.entities.Interview;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface IInterviewServices {
    Interview createInterview(Interview interview);
    Interview updateInterview(Long id, Interview interview);
    Optional<Interview> getInterviewById(Long id);
    List<Interview> getAllInterviews();
    void deleteInterview(Long id);
    public List<LocalDateTime> getAvailableSlots(LocalDate startDate);
}
