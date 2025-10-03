package tn.esprit.examen.nomPrenomClasseExamen.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dash")
public class AdminController {

    @GetMapping()
    public String adminDashboard() {
        return "Bienvenue sur le Dashboard Administrateur (/dashboardanalytics)";
    }
}
