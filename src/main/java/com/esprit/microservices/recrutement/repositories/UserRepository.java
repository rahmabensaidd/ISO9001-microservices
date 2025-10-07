package com.esprit.microservices.recrutement.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.esprit.microservices.recrutement.entities.UserEntity;

import java.util.Optional;

public interface UserRepository  extends JpaRepository<UserEntity, String> {

}