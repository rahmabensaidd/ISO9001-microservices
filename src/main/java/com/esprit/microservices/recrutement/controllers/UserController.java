package com.esprit.microservices.recrutement.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/user")
public class UserController {

/*
    @GetMapping("/profile")
    public Map<String, Object> getUserProfile(@AuthenticationPrincipal Jwt jwt) {
        return jwt.getClaims();
    }
*/

    @GetMapping("/dashboard")
    public String userDashboard() {
        return "Bienvenue sur le Dashboard Utilisateur (/front)";
    }

}
