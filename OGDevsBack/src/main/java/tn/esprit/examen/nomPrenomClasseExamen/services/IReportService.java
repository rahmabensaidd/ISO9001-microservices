package tn.esprit.examen.nomPrenomClasseExamen.services;

import tn.esprit.examen.nomPrenomClasseExamen.entities.Report;
import java.util.List;

public interface IReportService {
    Report addReport(Report report);
    Report updateReport(Long reportId, Report report);
    void deleteReport(Long reportId);
    Report getReportById(Long reportId);
    List<Report> getAllReports();
}