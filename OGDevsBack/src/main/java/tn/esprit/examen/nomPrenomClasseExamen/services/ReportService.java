package tn.esprit.examen.nomPrenomClasseExamen.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Report;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.ReportRepository;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ReportService implements IReportService {

    private final ReportRepository reportRepository;

    @Override
    public Report addReport(Report report) {
        return reportRepository.save(report);
    }

    @Override
    public Report updateReport(Long reportId, Report updatedReport) {
        Optional<Report> existingReport = reportRepository.findById(reportId);
        if (existingReport.isPresent()) {
            Report report = existingReport.get();
            report.setTitle(updatedReport.getTitle());
            report.setContent(updatedReport.getContent());
            report.setDateCreation(updatedReport.getDateCreation());
            report.setCreatedBy(updatedReport.getCreatedBy());
            report.setImpactLevel(updatedReport.getImpactLevel());
            report.setStatut(updatedReport.getStatut());
            report.setPerformanceScore(updatedReport.getPerformanceScore());
            report.setTauxConformite(updatedReport.getTauxConformite());
            report.setTendances(updatedReport.getTendances());
            return reportRepository.save(report);
        }
        return null; // ou lever une exception
    }

    @Override
    public void deleteReport(Long reportId) {
        reportRepository.deleteById(reportId);
    }

    @Override
    public Report getReportById(Long reportId) {
        return reportRepository.findById(reportId).orElse(null);
    }

    @Override
    public List<Report> getAllReports() {
        return reportRepository.findAll();
    }
}
