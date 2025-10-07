package com.esprit.microservices.recrutement.repositories;

import com.esprit.microservices.recrutement.entities.Prototype;
import org.springframework.data.jpa.repository.JpaRepository;


public interface PrototypeRepository extends JpaRepository<Prototype, Long> {
}
