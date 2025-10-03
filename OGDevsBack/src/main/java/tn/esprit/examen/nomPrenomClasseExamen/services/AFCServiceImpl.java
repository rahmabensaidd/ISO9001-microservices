package tn.esprit.examen.nomPrenomClasseExamen.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import tn.esprit.examen.nomPrenomClasseExamen.entities.*;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.BudgetRepository;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.FinancialTransactionRepository;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.AdministrativeDeviationRepository;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.IndicatorRepository;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.UserEntityRepository;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;

@Slf4j
@Service
@RequiredArgsConstructor
public class AFCServiceImpl implements AFCService {

    private final FinancialTransactionRepository financialTransactionRepository;
    private final AdministrativeDeviationRepository administrativeDeviationRepository;
    private final BudgetRepository budgetRepository;
    private final IndicatorRepository indicatorRepository;
    private final NotificationService notificationService;
    private final UserEntityRepository userEntityRepository;
//récupèrer toutes les transactions financières (par exemple, des paiements ou des factures) pour une année donnée
    @Override
    public List<FinancialTransaction> getFinancialTransactions(String year) {
        if (year != null) {
            int yearInt = Integer.parseInt(year);
            LocalDate start = LocalDate.of(yearInt, 1, 1);
            LocalDate end = LocalDate.of(yearInt, 12, 31);
            List<FinancialTransaction> transactions = financialTransactionRepository.findByTransactionDateBetween(start, end);
            checkFinancialFeesRate(transactions, yearInt);//Vérifie si les frais financiers sont trop élevés
            checkBudget(transactions, yearInt);//Vérifie si les frais financiers dépassent le budget
            return transactions;
        }
        return financialTransactionRepository.findAll();
    }
//ajoute une nouvelle transaction financière (par exemple, un paiement ou une facture)+all transactions of that year
    @Override
    public FinancialTransaction addFinancialTransaction(FinancialTransaction transaction) {
        FinancialTransaction savedTransaction = financialTransactionRepository.save(transaction);
        int year = transaction.getTransactionDate().getYear();//récupère l’année de la transaction
        LocalDate start = LocalDate.of(year, 1, 1);
        LocalDate end = LocalDate.of(year, 12, 31);
        List<FinancialTransaction> transactions = financialTransactionRepository.findByTransactionDateBetween(start, end);
        checkFinancialFeesRate(transactions, year);
        checkBudget(transactions, year);
        return savedTransaction;
    }
//Calculer les revenus par mois, le revenu total, et comparer avec l’année précédente
    @Override
    public Map<String, Object> analyzeRevenue(String year) {
        int yearInt = Integer.parseInt(year);
        LocalDate start = LocalDate.of(yearInt, 1, 1);
        LocalDate end = LocalDate.of(yearInt, 12, 31);
        List<FinancialTransaction> transactions = financialTransactionRepository.findByTransactionDateBetween(start, end);

        Map<Integer, Double> monthlyRevenue = transactions.stream()
                .collect(Collectors.groupingBy(
                        t -> t.getTransactionDate().getMonthValue(),
                        Collectors.summingDouble(FinancialTransaction::getRevenue)
                ));

        double totalRevenue = transactions.stream().mapToDouble(FinancialTransaction::getRevenue).sum();

        Map.Entry<Integer, Double> topMonth = monthlyRevenue.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .orElse(null);
        String topMonthName = topMonth != null ? java.time.Month.of(topMonth.getKey()).name() : "N/A";
        double topMonthRevenue = topMonth != null ? topMonth.getValue() : 0;

        LocalDate prevStart = LocalDate.of(yearInt - 1, 1, 1);
        LocalDate prevEnd = LocalDate.of(yearInt - 1, 12, 31);
        List<FinancialTransaction> prevTransactions = financialTransactionRepository.findByTransactionDateBetween(prevStart, prevEnd);
        double prevTotalRevenue = prevTransactions.stream().mapToDouble(FinancialTransaction::getRevenue).sum();
        double growthRate = prevTotalRevenue > 0 ? ((totalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100 : 0;

        Map<String, Object> analysis = new HashMap<>();
        analysis.put("totalRevenue", totalRevenue);
        analysis.put("monthlyRevenue", monthlyRevenue);
        analysis.put("topMonth", topMonthName);
        analysis.put("topMonthRevenue", topMonthRevenue);
        analysis.put("previousYearRevenue", prevTotalRevenue);
        analysis.put("growthRate", growthRate);
        return analysis;
    }

    @Override
    public List<AdministrativeDeviation> getDeviations(String year, String month) {
        if (year != null && month != null) {
            int yearInt = Integer.parseInt(year);
            int monthInt = Integer.parseInt(month);
            LocalDate start = LocalDate.of(yearInt, monthInt, 1);
            LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
            List<AdministrativeDeviation> deviations = administrativeDeviationRepository.findByDateBetween(start, end);
            checkDeviationCount(deviations, yearInt, monthInt);
            return deviations;
        }
        return administrativeDeviationRepository.findAll();
    }

    @Override
    public AdministrativeDeviation addAdministrativeDeviation(AdministrativeDeviation deviation) {
        AdministrativeDeviation savedDeviation = administrativeDeviationRepository.save(deviation);
        int year = savedDeviation.getDate().getYear();
        int month = savedDeviation.getDate().getMonthValue();
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
        List<AdministrativeDeviation> deviations = administrativeDeviationRepository.findByDateBetween(start, end);
        checkDeviationCount(deviations, year, month);
        return savedDeviation;
    }

    @Override
    public Budget setBudget(Budget budget) {
        Budget savedBudget = budgetRepository.save(budget);
        List<FinancialTransaction> transactions = financialTransactionRepository.findByTransactionDateBetween(
                LocalDate.of(budget.getYear(), 1, 1),
                LocalDate.of(budget.getYear(), 12, 31)
        );
        checkBudget(transactions, budget.getYear());
        return savedBudget;
    }

    @Override
    public Budget getBudget(int year) {
        return budgetRepository.findByYear(year).orElse(null);
    }

    @Override
    public List<Indicator> getIndicators() {
        return indicatorRepository.findAll();
    }

    @Override
    public Indicator setIndicator(Indicator indicator) {
        return indicatorRepository.save(indicator);
    }

    private void checkFinancialFeesRate(List<FinancialTransaction> transactions, int year) {
        double totalFinancialFees = transactions.stream().mapToDouble(FinancialTransaction::getFinancialFees).sum();
        double totalRevenue = transactions.stream().mapToDouble(FinancialTransaction::getRevenue).sum();
        double financialFeesRate = totalRevenue > 0 ? (totalFinancialFees / totalRevenue) * 100 : 0;

        Indicator indicator = indicatorRepository.findByCode("IND-AFC-01");
        if (indicator != null) {
            indicator.setCurrentValue(financialFeesRate);
            indicatorRepository.save(indicator);

            Double targetValue = indicator.getCible();
            if (targetValue != null && financialFeesRate > targetValue) {
                String message = String.format(
                        "Alerte : Taux des frais financiers (%d) a dépassé la cible (%.2f%%) : %.2f%%",
                        year, targetValue, financialFeesRate);
                log.info("Notification envoyée aux admins : {}", message);
                notifyAdmins(message, "FinancialFeesExceedance");
            }
        }
    }

    private void checkDeviationCount(List<AdministrativeDeviation> deviations, int year, int month) {
        int deviationCount = deviations.size();

        Indicator indicator = indicatorRepository.findByCode("IND-AFC-02");
        if (indicator != null) {
            indicator.setCurrentValue((double) deviationCount);
            indicatorRepository.save(indicator);

            Double targetValue = indicator.getCible();
            if (targetValue != null && deviationCount > targetValue) {
                String message = String.format(
                        "Alerte : Nombre d'écarts administratifs (%d-%02d) a dépassé la cible (%.0f) : %d",
                        year, month, targetValue, deviationCount);
                log.info("Notification envoyée aux admins : {}", message);
                notifyAdmins(message, "DeviationExceedance");
            }
        }
    }

    private void checkBudget(List<FinancialTransaction> transactions, int year) {
        Budget budget = budgetRepository.findByYear(year).orElse(null);
        if (budget == null) return;

        double totalFinancialFees = transactions.stream().mapToDouble(FinancialTransaction::getFinancialFees).sum();
        double budgetLimit = budget.getFinancialFeesBudget();

        if (totalFinancialFees > budgetLimit) {
            String message = String.format(
                    "Alerte : Les frais financiers (%d) ont dépassé le budget (%.2f EUR) : %.2f EUR",
                    year, budgetLimit, totalFinancialFees);
            log.info("Notification envoyée aux admins : {}", message);
            notifyAdmins(message, "BudgetExceedance");
        }
    }

    private void notifyAdmins(String message, String type) {
        List<UserEntity> users = userEntityRepository.findAll();
        for (UserEntity user : users) {
            if (user.getRoles().stream().anyMatch(role -> "ROLE_ADMIN".equals(role.getRoleName()))) {
                notificationService.sendNotification(user.getId(), message, type);
            }
        }
    }

    //récupère les données historiques des 3 dernières années+prompt d hisorique +API
    @Value("${google.gemini.api.key}")
    private String geminiApiKey;

    private final RestTemplate restTemplate = new RestTemplate();//envoie cette requête à l’URL de l’API de Gemini
    private final ObjectMapper objectMapper = new ObjectMapper();

    public double predictBudget(int year) {
        // Récupérer les données historiques
        int startYear = year - 3;
        LocalDate start = LocalDate.of(startYear, 1, 1);
        LocalDate end = LocalDate.of(year - 1, 12, 31);
        List<FinancialTransaction> pastTransactions = financialTransactionRepository.findByTransactionDateBetween(start, end);
        List<Budget> pastBudgets = budgetRepository.findByYearBetween(startYear, year - 1);

        // Construire le prompt
        StringBuilder prompt = new StringBuilder();
        prompt.append("Predict the financial fees budget for ").append(year).append(" in EUR based on this historical data:\n");
        Map<Integer, Double> yearlyFees = pastTransactions.stream()
                .collect(Collectors.groupingBy(
                        t -> t.getTransactionDate().getYear(),
                        Collectors.summingDouble(FinancialTransaction::getFinancialFees)
                ));
        for (int y = startYear; y < year; y++) {
            double fees = yearlyFees.getOrDefault(y, 0.0);
            prompt.append(String.format("Year %d: Fees = %.2f EUR\n", y, fees));
        }
        for (Budget b : pastBudgets) {
            prompt.append(String.format("Budget %d: %.2f EUR\n", b.getYear(), b.getFinancialFeesBudget()));
        }
        prompt.append("Respond with only a number in EUR.");

        // Appeler Gemini
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", List.of(
                    Map.of("parts", List.of(
                            Map.of("text", prompt.toString())
                    ))
            ));

            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + geminiApiKey;
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            String response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class).getBody();

            // Extraire le résultat
            Map<String, Object> jsonResponse = objectMapper.readValue(response, Map.class);
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) jsonResponse.get("candidates");
            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            List<Map<String, String>> parts = (List<Map<String, String>>) content.get("parts");
            String predictedBudgetStr = parts.get(0).get("text").trim();
            double predictedBudget = Double.parseDouble(predictedBudgetStr);

            log.info("Budget prédit pour {} : {} EUR", year, predictedBudget);
            return predictedBudget;

        } catch (Exception e) {
            log.error("Erreur lors de la prédiction avec Gemini : {}", e.getMessage());
            throw new RuntimeException("Erreur lors de la prédiction du budget", e);

        }
    }
}