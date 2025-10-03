package tn.esprit.examen.nomPrenomClasseExamen.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Axe;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Indicator;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Objective;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Process;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.IndicatorRepository;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.ObjectiveRepo;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.ProcessRepository;
import tn.esprit.examen.nomPrenomClasseExamen.services.IndicatorServices;

@Component
@RequiredArgsConstructor
public class ConsolidatedInitializer implements CommandLineRunner {
    private final ProcessRepository processRepository;
    private final ObjectiveRepo objectiveRepository;
    private final IndicatorRepository indicatorRepository;
    private final IndicatorServices indicatorServices;

    @Override
    public void run(String... args) throws Exception {
        // Find the process with id = 1
        Process process = processRepository.findById(1L).orElse(null);
        if (process == null) {
            System.out.println("Process with id 1 not found, skipping objective and indicator linking.");
            return;
        }

        // Check if an Objective with the specific title and process already exists
        Objective objective = objectiveRepository.findAll().stream()
                .filter(o -> o.getProcess() != null && o.getProcess().getId().equals(1L)
                        && "Quality Objective".equals(o.getTitle())
                        && o.getAxe() == Axe.QUALITY)
                .findFirst()
                .orElse(null);

        // If no matching Objective exists, create one
        if (objective == null) {
            objective = new Objective();
            objective.setTitle("Quality Objective");
            objective.setAxe(Axe.QUALITY);
            objective.setProcess(process);
            objectiveRepository.save(objective);
            System.out.println("Objective 'Quality Objective' created for process id 1.");
        } else {
            System.out.println("Objective 'Quality Objective' already exists for process id 1, reusing it.");
        }

        // Create or update IND-MAG-01 if it doesn't exist
        if (indicatorRepository.findByCode("IND-MAG-01") == null) {
            Indicator indicator = new Indicator();
            indicator.setCode("IND-MAG-01");
            indicator.setLibelle("Taux de concrétisations des non conformités ");
            indicator.setUnite("%");
            indicator.setCible(80.0);
            indicator.setFrequence("Mensuelle");
            indicator.setActif("Oui");
            indicator.setObjective(objective);
            indicatorServices.createIndicator(indicator);
            System.out.println("Indicator IND-MAG-01 created and linked to objective.");
        } else {
            Indicator indicator = indicatorRepository.findByCode("IND-MAG-01");
            if (indicator != null && (indicator.getObjective() == null || !indicator.getObjective().getIdObjective().equals(objective.getIdObjective()))) {
                indicator.setObjective(objective);
                indicatorRepository.save(indicator);
                System.out.println("Updated IND-MAG-01 to link to objective 'Quality Objective'.");
            }
        }

        // Create or update IND-MAG-02 if it doesn't exist
        if (indicatorRepository.findByCode("IND-MAG-02") == null) {
            Indicator indicator = new Indicator();
            indicator.setCode("IND-MAG-02");
            indicator.setLibelle("Taux de réalisations des actions correctives");
            indicator.setUnite("%");
            indicator.setCible(80.0);
            indicator.setFrequence("Mensuelle");
            indicator.setActif("Oui");
            indicator.setObjective(objective);
            indicatorServices.createIndicator(indicator);
            System.out.println("Indicator IND-MAG-02 created and linked to objective.");
        } else {
            Indicator indicator = indicatorRepository.findByCode("IND-MAG-02");
            if (indicator != null && (indicator.getObjective() == null || !indicator.getObjective().getIdObjective().equals(objective.getIdObjective()))) {
                indicator.setObjective(objective);
                indicatorRepository.save(indicator);
                System.out.println("Updated IND-MAG-02 to link to objective 'Quality Objective'.");
            }
        }
    }
}
