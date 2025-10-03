package tn.esprit.examen.nomPrenomClasseExamen.services;

import tn.esprit.examen.nomPrenomClasseExamen.entities.AdministrativeDeviation;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Budget;
import tn.esprit.examen.nomPrenomClasseExamen.entities.FinancialTransaction;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Indicator;

import java.util.List;
import java.util.Map;

public interface AFCService {
    List<FinancialTransaction> getFinancialTransactions(String year);
    FinancialTransaction addFinancialTransaction(FinancialTransaction transaction);
    Map<String, Object> analyzeRevenue(String year);
    List<AdministrativeDeviation> getDeviations(String year, String month);
    AdministrativeDeviation addAdministrativeDeviation(AdministrativeDeviation deviation);
    Budget setBudget(Budget budget);
    Budget getBudget(int year);
    List<Indicator> getIndicators();
    Indicator setIndicator(Indicator indicator);
    public double predictBudget(int year) ;
    }