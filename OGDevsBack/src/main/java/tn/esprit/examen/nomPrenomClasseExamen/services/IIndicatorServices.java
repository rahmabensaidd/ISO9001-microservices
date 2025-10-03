package tn.esprit.examen.nomPrenomClasseExamen.services;

import tn.esprit.examen.nomPrenomClasseExamen.entities.Indicator;
import tn.esprit.examen.nomPrenomClasseExamen.entities.IndicatorDTO;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Report;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface IIndicatorServices {
    Indicator createIndicator(Indicator indicator);
    Indicator updateIndicator(Long id, Indicator indicator);
    Optional<Indicator> getIndicatorById(Long id);
    List<Indicator> getAllIndicators();
    void deleteIndicator(Long id);
    Map<String, List<Double>> getIndicatorTrends();
    String generatePeriodicReport(String period);
    List<Indicator> createMultipleIndicators(List<Indicator> indicators);
    Report createReport(Report report);
    List<Report> getAllReports();
    public Report updateReport(Report report);
    public void deleteReport(Long id);
    List<IndicatorDTO> getIndicatorsForProcess(Long processId);
    public List<IndicatorDTO> getAllIndicatorsDTO();
    void updateIndicatorValue(String indicatorCode);

    public void recalculateAllIndicators();

}
