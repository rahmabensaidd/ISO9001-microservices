package com.esprit.microservices.recrutement.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.esprit.microservices.recrutement.entities.Resume;
public interface ResumeRepository extends JpaRepository<Resume, Long>  {
}
