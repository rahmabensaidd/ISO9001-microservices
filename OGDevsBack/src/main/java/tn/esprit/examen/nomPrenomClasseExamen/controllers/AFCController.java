package tn.esprit.examen.nomPrenomClasseExamen.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.examen.nomPrenomClasseExamen.entities.AdministrativeDeviation;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Budget;
import tn.esprit.examen.nomPrenomClasseExamen.entities.FinancialTransaction;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Indicator;
import tn.esprit.examen.nomPrenomClasseExamen.services.AFCService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/afc")
@RequiredArgsConstructor
public class AFCController {

    private final AFCService afcService;

    @GetMapping("/financial-transactions")
    public ResponseEntity<List<FinancialTransaction>> getFinancialTransactions(@RequestParam(required = false) String year) {
        return ResponseEntity.ok(afcService.getFinancialTransactions(year));
    }

    @PostMapping("/financial-transactions")

    public ResponseEntity<FinancialTransaction> addFinancialTransaction(@RequestBody FinancialTransaction transaction) {
        return ResponseEntity.ok(afcService.addFinancialTransaction(transaction));
    }

    @GetMapping("/revenue-analysis")
    public ResponseEntity<Map<String, Object>> analyzeRevenue(@RequestParam String year) {
        return ResponseEntity.ok(afcService.analyzeRevenue(year));
    }

    @GetMapping("/deviations")

    public ResponseEntity<List<AdministrativeDeviation>> getDeviations(
            @RequestParam(required = false) String year,
            @RequestParam(required = false) String month) {
        return ResponseEntity.ok(afcService.getDeviations(year, month));
    }

    @PostMapping("/deviations")

    public ResponseEntity<AdministrativeDeviation> addAdministrativeDeviation(@RequestBody AdministrativeDeviation deviation) {
        return ResponseEntity.ok(afcService.addAdministrativeDeviation(deviation));
    }

    @PostMapping("/budgets")
    public ResponseEntity<Budget> setBudget(@RequestBody Budget budget) {
        return ResponseEntity.ok(afcService.setBudget(budget));
    }

    @GetMapping("/budgets")

    public ResponseEntity<Budget> getBudget(@RequestParam int year) {
        Budget budget = afcService.getBudget(year);
        return budget != null ? ResponseEntity.ok(budget) : ResponseEntity.notFound().build();
    }

    @GetMapping("/indicators")
    public ResponseEntity<List<Indicator>> getIndicators() {
        return ResponseEntity.ok(afcService.getIndicators());
    }

    @PostMapping("/indicators")
    public ResponseEntity<Indicator> setIndicator(@RequestBody Indicator indicator) {
        return ResponseEntity.ok(afcService.setIndicator(indicator));
    }
    @GetMapping("/predict-budget")

    public double predictBudget(@RequestParam int year) {
        return afcService.predictBudget(year);
    }
}