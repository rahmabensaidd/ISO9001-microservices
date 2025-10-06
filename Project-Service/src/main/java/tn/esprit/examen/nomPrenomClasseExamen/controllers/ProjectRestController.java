package tn.esprit.examen.nomPrenomClasseExamen.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.examen.nomPrenomClasseExamen.dto.ProjectResponseDTO;
import tn.esprit.examen.nomPrenomClasseExamen.entities.*;
import tn.esprit.examen.nomPrenomClasseExamen.exceptions.EntityNotFoundException;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.BugRepository;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.ProjectRepository;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.ProjectTaskRepository;
import tn.esprit.examen.nomPrenomClasseExamen.services.IProjectServices;
import tn.esprit.examen.nomPrenomClasseExamen.services.OpenAIService;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.lang.Process;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/projects")
public class ProjectRestController {

    private final IProjectServices projectServices;
    private  final OpenAIService openAIService;
    private final BugRepository bugRepository;
    private final ProjectRepository projectRepository;
    private final ProjectTaskRepository projectTaskRepository;


    @PostMapping("/assignUserr/{idOperation}/{email}")
    public ResponseEntity<UserEntity> assignUserToOperation(
            @PathVariable Long idOperation,
            @PathVariable String email) {

        try {
            UserEntity updatedUser = projectServices.assignusertooperation(idOperation, email);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @PostMapping("/create/{email}/{clientemail}/{idprocesses}")
    public ResponseEntity<ProjectDTO> createProject(
            @PathVariable String email,
            @PathVariable String clientemail,
            @PathVariable List<Long> idprocesses,
            @RequestBody Project project) {
        try {
            // Appel du service en passant aussi clientemail
            ProjectDTO createdProjectDTO = projectServices.createProject(project, email, idprocesses, clientemail);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdProjectDTO);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }


    @PutMapping("/{id}")
    public ResponseEntity<ProjectDTO> updateProject(@PathVariable Long id, @RequestBody ProjectUpdateDTO updatedProject) {
        try {
            ProjectDTO project = projectServices.updateProject(id, updatedProject);
            return ResponseEntity.ok(project);
        } catch (RuntimeException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProjectById(@PathVariable Long id) {
        ProjectDTO project = projectServices.getProjectById(id);

        if (project != null) {
            return ResponseEntity.ok(project);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Projet avec l'ID " + id + " non trouvé");
        }
    }

    @GetMapping
    public ResponseEntity<List<ProjectDTO>> getAllProjects() {
        List<ProjectDTO> projects = projectServices.getAllProjects();
        return new ResponseEntity<>(projects, HttpStatus.OK);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        try {
            projectServices.deleteProject(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    @PostMapping("/createphase/{id}")
    public ResponseEntity<Phase> createProjectPhase(@RequestBody Phase phase, @PathVariable Long id) {
        try {
            Phase createdPhase = projectServices.createprojectphase(phase, id);
            return new ResponseEntity<>(createdPhase, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
    @GetMapping("/{id}/phases")
    public ResponseEntity<List<PhaseDTO>> getPhasesByProject(@PathVariable Long id) {
        try {
            // Appel du service pour récupérer les phases associées au projet en tant que PhaseDTO
            List<PhaseDTO> phaseDTOs = projectServices.getphasesByProject(id);  // Assurez-vous que cette méthode renvoie une List<PhaseDTO>

            // Si les phases existent, retourne une réponse 200 OK avec les PhaseDTO
            if (!phaseDTOs.isEmpty()) {
                return new ResponseEntity<>(phaseDTOs, HttpStatus.OK);
            } else {
                // Si aucune phase n'est trouvée, retourne 204 No Content
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);  // 204 No Content si aucune phase n'est trouvée
            }
        } catch (Exception e) {
            // Loggez l'exception pour le débogage (Utilisez un logger comme log4j ou slf4j ici)
            System.out.println("Erreur lors de la récupération des phases pour le projet " );

            // En cas d'exception, retourne une erreur 500 Internal Server Error
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @PostMapping("/createprojectOperation/{phaseId}/{idoperation}")
    public ResponseEntity<ProjectOppDTO> createProjectOperation(
            @RequestBody ProjectOpp projectOperation,
            @PathVariable Long phaseId,
            @PathVariable Long idoperation) {

        try {
            // Appel au service pour créer le ProjectOpp et récupérer le DTO
            ProjectOppDTO createdOperationDTO = projectServices.createprojectoperation(projectOperation, phaseId, idoperation);

            // Retourner le DTO créé avec un statut HTTP 201 Created
            return ResponseEntity.status(HttpStatus.CREATED).body(createdOperationDTO);
        } catch (Exception e) {
            // En cas d'erreur, retourner un statut HTTP 400 Bad Request
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }


    @GetMapping("/getoperationsphase/{idphase}")
    public ResponseEntity<List<ProjectOppDTO>> getAllProjectOpps(@PathVariable Long idphase) {
        List<ProjectOppDTO> projectOpps = projectServices.getAllProjectOpps(idphase);
        if (projectOpps.isEmpty()) {
            return ResponseEntity.noContent().build(); // Retourne une réponse vide si aucun élément n'est trouvé
        }
        return ResponseEntity.ok(projectOpps); // Retourne les opérations trouvées avec le code 200 OK
    }
    @PutMapping("/assign-user/{idOp}/{email}")
    public ResponseEntity<ProjectOppDTO> assignUserToOpp(@PathVariable Long idOp, @PathVariable String email) {
        try {
            ProjectOppDTO updatedProjectOpp = projectServices.assignUserToOpp(idOp, email);
            return ResponseEntity.ok(updatedProjectOpp);
        } catch (Exception e) {
            // En cas d'erreur, on peut retourner une erreur générique
            return ResponseEntity.status(500).body(null);
        }
    }
    @GetMapping("/allusers")
    public ResponseEntity<List<UserEntity>> getAllUsers() {
        return ResponseEntity.ok(projectServices.getAllUsers());
    }
    @GetMapping("/operations/{idProject}")
    public ResponseEntity<List<OperationnDTO>> getOperationsByProject(@PathVariable Long idProject) {
        try {
            // Appel de la méthode de service pour récupérer les opérations par projet
            List<OperationnDTO> operations = projectServices.getoperationsbyproject(idProject);

            // Vérifier si la liste d'opérations est vide
            if (operations.isEmpty()) {
                return ResponseEntity.noContent().build(); // Retourne 204 No Content si aucune opération n'est trouvée
            }

            // Retourner les opérations avec un code HTTP 200 OK
            return ResponseEntity.ok(operations);
        } catch (Exception e) {
            // Gérer les erreurs en retournant un code HTTP 500 (Internal Server Error)
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.emptyList());
        }
    }

    @GetMapping("/users/{idProjectOperation}")
    public ResponseEntity<List<UserDTO>> getUsersofoprationByProjectOperation(@PathVariable Long idProjectOperation) {
        List<UserDTO> users = projectServices.getUsersByProjectOperation(idProjectOperation);
        if (users.isEmpty()) {
            // Si aucun utilisateur n'est trouvé ou si le ProjectOpp ou l'Operation est introuvable
            return new ResponseEntity<>(HttpStatus.NO_CONTENT); // 204 No Content
        }
        return new ResponseEntity<>(users, HttpStatus.OK); // 200 OK avec la liste des utilisateurs
    }
    @PostMapping("/assignUser/{idProjectOperation}/{email}")
    public ResponseEntity<ProjectOppDTO> assignUserToProjectOperation(
            @PathVariable Long idProjectOperation,
            @PathVariable String email) {

        try {
            // Appel au service pour assigner l'utilisateur à l'opportunité de projet
            ProjectOppDTO updatedProjectOppDTO = projectServices.assignUserToOpp(idProjectOperation, email);

            // Retourner le DTO dans la réponse avec un statut HTTP 200 OK
            return ResponseEntity.ok(updatedProjectOppDTO);
        } catch (Exception e) {
            // En cas d'erreur, retourner un statut HTTP 400 Bad Request
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @DeleteMapping("/phase/{id}")
    public ResponseEntity<Map<String, String>> deletePhase(@PathVariable Long id) {
        projectServices.deletephase(id);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Phase de projet supprimée avec succès.");

        return ResponseEntity.ok(response); // Retourne la réponse au format JSON
    }

    @DeleteMapping("/projectOperation/{id}")
    public ResponseEntity<Map<String, String>>deleteProjectOperation(@PathVariable Long id) {
        try {
            projectServices.deleteProjectOperation(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Phase de projet supprimée avec succès.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("erreur","Erreur de suppression");
            return ResponseEntity.ok(response);        }
    }

    @GetMapping("/by-user/{email}")
    public ResponseEntity<List<ProjectOppDTO>> getProjectsByUser(@PathVariable String email) {
        List<ProjectOppDTO> projectOpps = projectServices.getprojetoppbyuser(email);

        if (projectOpps.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.emptyList());
        }
        return ResponseEntity.ok(projectOpps);
    }
    @GetMapping("/tasksbyuser/{email}")
    public ResponseEntity<?> getTasksByUser(@PathVariable String email) {
        // Appel du service pour récupérer les tâches de l'utilisateur par email
        List<ProjectTaskDTO> tasks = projectServices.getTasksByUser(email);

        // Si aucune tâche n'est trouvée pour l'utilisateur, on retourne un message d'erreur
        if (tasks == null || tasks.isEmpty()) {
            // Créer un message d'erreur personnalisé à retourner dans la réponse
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("message", "Aucune tâche trouvée pour cet utilisateur.");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }

        // Retourner les tâches trouvées avec un statut 200 OK
        return ResponseEntity.ok(tasks);
    }

    @PutMapping("/status/{id}/{status}")
    public ResponseEntity<Map<String, String>> updateProjectStatus(@PathVariable Long id, @PathVariable String status) {
        try {
            projectServices.updateTask(id, status);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Project status updated successfully");
            return ResponseEntity.ok(response); // ✅ Retourne bien un JSON
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "An error occurred"));
        }
    }

    @PostMapping("/addbug/{idProjectTask}")
    public ProjectTaskDTO addAndAssignBug(@RequestBody Bug bug, @PathVariable Long idProjectTask) {
        return projectServices.addandassignbugtoProjectTask(bug, idProjectTask);
    }
    @GetMapping("/by-task/{idProjectTask}")
    public ResponseEntity<?> getProjectByProjectTask(@PathVariable Long idProjectTask) {
        ProjectDTO projectDTO = projectServices.getProjectbyprojectTask(idProjectTask);

        if (projectDTO != null) {
            return ResponseEntity.ok(projectDTO);
        } else {
            return ResponseEntity.status(404).body("Projet non trouvé pour la tâche ID: " + idProjectTask);
        }
    }

    @GetMapping("/getprojectdto/{idprtoject}")
    public ResponseEntity<?> getproject(@PathVariable Long idprtoject) {
        ProjectDTO projectDTO = projectServices.getProjectbyId(idprtoject);

        if (projectDTO != null) {
            return ResponseEntity.ok(projectDTO);
        } else {
            return ResponseEntity.status(404).body("Projet non trouvé d ID: " + idprtoject);
        }
    }
    @PutMapping("/{id}/bugstatus")
    public ResponseEntity<BugDTO> updateBugStatus(@PathVariable Long id, @RequestParam String newStatus) {
        BugDTO updatedBug = projectServices.updateBugstaus(id, newStatus);
        return ResponseEntity.ok(updatedBug);
    }
    @GetMapping("/suggest-technologies")
    public ResponseEntity<String> getTechnologySuggestions(
            @RequestParam String projectType,
            @RequestParam String description,
            @RequestParam String deadline,
            @RequestParam(required = false) List<String> requirements) {
        try {
            System.out.println("Project type: " + projectType);
            System.out.println("Description: " + description);
            System.out.println("Deadline: " + deadline);
            System.out.println("Requirements: " + requirements); // <- Vérifie bien s'il les reçoit

            String suggestion = openAIService.suggestTechnologies(projectType, description, deadline, requirements);
            return ResponseEntity.ok(suggestion);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur lors de la génération de suggestions.");
        }
    }




    // Contrôleur
    @GetMapping("/getinfo/{idtask}")
    public ResponseEntity<?> getinfo(@PathVariable long idtask) {
        // Vérifie si la task existe
        ProjectTask targetTask = projectTaskRepository.findById(idtask).orElse(null);
        if (targetTask == null) {
            return ResponseEntity.notFound().build();
        }

        List<Project> projects = projectRepository.findAll();

        for (Project p : projects) {
            for (Phase ph : p.getPhases()) {
                for (ProjectOpp opp : ph.getProjectOperations()) {
                    for (ProjectTask pt : opp.getProjecttasks()) {
                        if (pt.getId() == idtask) {
                            TaskInfoDTO info = new TaskInfoDTO(
                                    p.getName(),
                                    opp.getName(),
                                    opp.getDeadline(),
                                    ph.getPhase_name()
                            );
                            return ResponseEntity.ok(info);
                        }
                    }
                }
            }
        }

        // Si la task existe mais n’est associée à aucun projet/opération/phase
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("Task found but not linked to any project/operation/phase");
    }


    @PostMapping("/{idProject}/add-technologies")
    public ResponseEntity<?> addTechnologiesToProjectWithValidation(
            @PathVariable Long idProject,
            @RequestBody List<String> technologies) {

        // Validation de base
        if (technologies == null || technologies.isEmpty()) {
            return new ResponseEntity<>("La liste des technologies ne peut pas être vide",
                    HttpStatus.BAD_REQUEST);
        }

        try {
            ProjectDTO updatedProject = projectServices.addTechnologiesToProject(idProject, technologies);
            return new ResponseEntity<>(updatedProject, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>("Projet non trouvé avec l'ID: " + idProject,
                    HttpStatus.NOT_FOUND);
        }
    }


    @PostMapping("/suggest-fix/{idbug}")
    public ResponseEntity<?> suggestBugFix(@PathVariable long idbug) {
        try {
            // Try to find the bug by its ID
            Bug bug = bugRepository.findById(idbug).orElse(null);

            if (bug == null) {
                // If the bug doesn't exist, return 404 Not Found
                return new ResponseEntity<>("Bug with ID " + idbug + " not found.", HttpStatus.NOT_FOUND);
            }

            // Send the bug details to OpenAI for analysis and correction suggestion
            String bugFixSuggestion = openAIService.suggestBugFixing(
                    bug.getDescription(),
                    bug.getStatus(),
                    bug.getPriority()
            );

            // Return the suggestion along with an OK status code
            return new ResponseEntity<>(bugFixSuggestion, HttpStatus.OK);
        } catch (Exception e) {
            // Handle any errors that may occur
            return new ResponseEntity<>("Error processing bug fix: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }





    @PostMapping("resources")
    public ResponseEntity<ResourceDTO> create(@RequestBody ResourceDTO dto) {
        return ResponseEntity.ok(projectServices.addResource(dto));
    }

    @PutMapping("resources/{id}")
    public ResponseEntity<ResourceDTO> update(@PathVariable Long id, @RequestBody ResourceDTO dto) {
        return ResponseEntity.ok(projectServices.updateResource(id, dto));
    }

    @DeleteMapping("resources/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        projectServices.deleteResource(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("resources/{id}")
    public ResponseEntity<ResourceDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(projectServices.getResourceById(id));
    }

    @GetMapping("/resources")
    public ResponseEntity<List<ResourceDTO>> getAll() {
        return ResponseEntity.ok(projectServices.getAllResources());
    }

    @PostMapping("resources/{resourceId}/assign/{userId}")
    public ResponseEntity<ResourceDTO> assignToUser(@PathVariable Long resourceId, @PathVariable String userId) {
        return ResponseEntity.ok(projectServices.assignResourceToUser(resourceId, userId));
    }
    @PostMapping("resources/{resourceId}/unassign/{userId}")
    public ResponseEntity<ResourceDTO> unassignFromUser(@PathVariable Long resourceId, @PathVariable String userId) {
        return ResponseEntity.ok(projectServices.unassignResourcefromUser(resourceId, userId));
    }


    @PostMapping("/{projectId}/assign-resources")
    public  ResponseEntity<ProjectDTO>  assignResourcesToProject(
            @PathVariable Long projectId,
            @RequestBody List<Long> resourceIds
    ) {
        return ResponseEntity.ok(projectServices.assignResourcesToProject(projectId, resourceIds));
    }




    @DeleteMapping("/{projectId}/resources/{resourceId}")
    public ResponseEntity<?> unassignResourcesToProject(
            @PathVariable Long projectId,
            @PathVariable Long resourceId) {
        try {
            // Validate input
            if (projectId == null || resourceId == null) {
                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body("Project ID and resource ID are required");
            }

            // Call the service to unassign the resource
            ProjectDTO projectDTO = projectServices.unassignResourcesToProject(projectId, resourceId);

            // Return 200 OK with the updated project
            return ResponseEntity.ok(projectDTO);

        } catch (RuntimeException e) {
            // Handle exceptions (e.g., project not found, resource not assigned)
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        } catch (Exception e) {
            // Handle unexpected errors
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while unassigning the resource: " + e.getMessage());
        }
    }

    @PostMapping("/predictprojectduration")
    public ResponseEntity<?> predictDuration() {
        try {
            int nbRessources = 10;
            int nbProjectEmployee = 5;
            int nbTechnologies = 3;
            int nbTasks = 20;
            String projectType = "Mobile Application Development";

            ProcessBuilder pb = new ProcessBuilder("python",
                    "C:\\Users\\mbech\\Desktop\\OGDev-Coconsult\\OGDevsBack\\src\\main\\resources\\ml\\predictprojectduration.py",
                    String.valueOf(nbRessources),
                    String.valueOf(nbProjectEmployee),
                    String.valueOf(nbTechnologies),
                    String.valueOf(nbTasks),
                    projectType
            );

            pb.redirectErrorStream(false); // Combine stdout + stderr
            Process process = pb.start();

            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            StringBuilder output = new StringBuilder();
            String line;

            while ((line = reader.readLine()) != null) {
                output.append(line).append("\n");
            }

            return ResponseEntity.ok( output.toString().trim());

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur Java : " + e.getMessage());
        }
    }


    @PostMapping("/predictprojectdurationn/{idProject}")
    public ResponseEntity<?> predictDurationn(@PathVariable Long idProject) {

        try {
            Project p = projectRepository.findById(idProject).orElse(null);
            if (p == null) {
                throw new EntityNotFoundException("Project not found with id: " + idProject);
            }

            String projectType = p.getProjectType();
            int nbRessources = 0;
            int nbProjectEmployee = 0;
            int nbTechnologies = 0;
            int nbTasks = 0;
            Set<UserEntity> userEntitySet = new HashSet<>();

            for (Resource r : p.getResources()) {
                nbRessources++;
            }

            for (String teck : p.getTechnologies()) {
                nbTechnologies++;
            }

            for (Phase ph : p.getPhases()) {
                for (ProjectOpp opp : ph.getProjectOperations()) {
                    userEntitySet.add(opp.getUser());
                    for (ProjectTask task : opp.getProjecttasks()) {
                        nbTasks++;
                    }
                }
            }

            nbProjectEmployee = userEntitySet.size();

            // 🐍 Lancer le script Python
            ProcessBuilder pb = new ProcessBuilder("python","C:\\Users\\mbech\\Desktop\\OGDev-Coconsult\\OGDevsBack\\src\\main\\resources\\ml\\predictprojectduration.py",

            String.valueOf(nbRessources),
                    String.valueOf(nbProjectEmployee),
                    String.valueOf(nbTechnologies),
                    String.valueOf(nbTasks),
                    projectType
            );

            Process process = pb.start();

            // 🔹 Lire stdout
            BufferedReader stdOutput = new BufferedReader(new InputStreamReader(process.getInputStream()));
            StringBuilder output = new StringBuilder();
            String line;
            while ((line = stdOutput.readLine()) != null) {
                output.append(line).append("\n");
            }

            // 🔹 Lire stderr
            BufferedReader stdError = new BufferedReader(new InputStreamReader(process.getErrorStream()));
            StringBuilder errors = new StringBuilder();
            while ((line = stdError.readLine()) != null) {
                errors.append(line).append("\n");
            }

            int exitCode = process.waitFor();

            if (exitCode == 0) {
                return ResponseEntity.ok(output.toString().trim());
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Erreur Python :\n" + errors.toString().trim());
            }

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur Java : " + e.getMessage());
        }
    }





    @PutMapping("/{id}/update-dates")
    public ResponseEntity<ProjectDTO> updateProjectDates(
            @PathVariable Long id,
            @RequestParam String startDate,
            @RequestParam String endDate) {

        ProjectDTO updatedProject = projectServices.updateDates(id, startDate, endDate);
        return ResponseEntity.ok(updatedProject);
    }


    @GetMapping("/by-project-opp/{projectOppId}")
    public ResponseEntity<ProjectDTO> getProjectByProjectOpp(@PathVariable Long projectOppId) {
        ProjectDTO projectDto = projectServices.getProjectbyProjectopp(projectOppId);

        if (projectDto == null) {
            return ResponseEntity.noContent().build(); // 204 No Content if project is not found
        }

        return ResponseEntity.ok(projectDto); // 200 OK with the ProjectDTO
    }


    // Suppression d'une exigence
    @DeleteMapping("/deleteRequirement/{idProject}/{requirement}")
    public ProjectDTO deleterequirement(@PathVariable Long idProject, @PathVariable String requirement) {
        return projectServices.deleterequirement(idProject, requirement);
    }

    // Suppression d'une technologie
    @DeleteMapping("/deleteTechnology/{idProject}/{technology}")
    public ProjectDTO deletetechnology(@PathVariable Long idProject, @PathVariable String technology) {
        return projectServices.deletetechnology(idProject, technology);
    }
    // Ajout de plusieurs technologies
    @PostMapping("/addTechnologies/{idProject}")
    public ProjectDTO addmanytechnologies(@PathVariable Long idProject, @RequestBody List<String> techs) {
        return projectServices.addmanytechnologies(idProject, techs);
    }

    // Ajout de plusieurs exigences
    @PostMapping("/addRequirements/{idProject}")
    public ProjectDTO addmanyrequirements(@PathVariable Long idProject, @RequestBody List<String> reqs) {
        return projectServices.addmanyrequiremnts(idProject, reqs);
    }

    @PostMapping("/suggestphases/{idProject}")
    public ResponseEntity<?> suggestPhases(@PathVariable Long idProject) {
        return projectRepository.findById(idProject)
                .map(project -> {
                    try {
                        String projectType = project.getProjectType();
                        String description = project.getDescription();

                        List<String> requirements = Optional.ofNullable(project.getRequirements()).orElse(List.of());

                        List<String> processes = project.getProcesses()
                                .stream()
                                .map(tn.esprit.examen.nomPrenomClasseExamen.entities.Process::getProcName)
                                .collect(Collectors.toList());


                        String suggestedPhasesJson = openAIService.suggestPhases(
                                projectType, description, requirements, processes
                        );

                        // Transformer la réponse JSON en objet si tu veux être encore plus propre
                        ObjectMapper mapper = new ObjectMapper();
                        Object phasesObject = mapper.readValue(suggestedPhasesJson, Object.class);

                        return ResponseEntity.ok(phasesObject); // On retourne un vrai objet JSON, pas du texte

                    } catch (IllegalArgumentException e) {
                        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
                    } catch (Exception e) {
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(Map.of("error", "Erreur serveur : " + e.getMessage()));
                    }
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Projet introuvable avec l'ID: " + idProject)));
    }




    @PostMapping("/{projectId}/addPhasessuggtoproject")
    public ResponseEntity<String> addPhasesToProject(
            @PathVariable Long projectId,
            @RequestBody List<Phasesugg> phases
    ) {
        try {
            // Appel du service pour ajouter les phases au projet
            projectServices.addPhasesToProject(projectId, phases);

            // Retour succès sans message dans le body
            return ResponseEntity.ok("Phases added successfully to the project.");
        } catch (RuntimeException e) {
            // En cas d'exception, retourner un message d'erreur
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to add phases: " + e.getMessage());
        } catch (Exception e) {
            // Catch général pour d'autres erreurs imprévues
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Unexpected error: " + e.getMessage());
        }
    }
    @Transactional
    @DeleteMapping("/{idProject}/delete-all-phases")
    public ResponseEntity<String> deleteAllPhasesFromProject(@PathVariable Long idProject) {
        Optional<Project> optionalProject = projectRepository.findById(idProject);

        if (optionalProject.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Project with id " + idProject + " not found.");
        }

        Project project = optionalProject.get();

        Set<Phase> phases = project.getPhases();
        if (phases == null || phases.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NO_CONTENT)
                    .body("Project has no phases to delete.");
        }

        // Copie du Set pour éviter ConcurrentModificationException
        Set<Phase> phasesToRemove = new HashSet<>(phases);

        for (Phase phase : phasesToRemove) {
            projectServices.deletephase(phase.getIdPhase());
        }

        // Vider explicitement le Set
        project.getPhases().clear();
        projectRepository.save(project);

        return ResponseEntity.ok("All phases of project with id " + idProject + " have been deleted successfully.");
    }



    @PutMapping("/phase/{idPhase}")
    public ResponseEntity<PhaseDTO> updatePhase(
            @PathVariable Long idPhase,
            @RequestParam String name,
            @RequestParam String description) {

        PhaseDTO updatedPhase = projectServices.updatePhase(idPhase, name, description);

        return ResponseEntity.ok(updatedPhase);
    }
    // Mise à jour d'un bug
    @PutMapping("bug/{id}")
    public ResponseEntity<BugDTO> updateBug(@RequestBody Bug updatedBug, @PathVariable("id") Long id) {
        BugDTO updatedBugDTO = projectServices.updateBug(updatedBug, id);
        return ResponseEntity.ok(updatedBugDTO);
    }

    // Suppression d'un bug
    @DeleteMapping("bug/{id}")
    public ResponseEntity<Void> deleteBug(@PathVariable("id") Long id) {
        projectServices.deleteBug(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/clients")
    public ResponseEntity<List<UserEntity>> getClients() {
        List<UserEntity> clients = projectServices.getclients();
        return ResponseEntity.ok(clients);
    }

    // added by yosr to retrive clients project 
    @GetMapping("/current-user")
    public ResponseEntity<List<ProjectResponseDTO>> getProjectsByCurrentUser() {
        try {
            List<Project> projects = projectServices.getProjectsByCurrentUser();
            System.out.println("Projects retrieved: " + projects); // Debug
            List<ProjectResponseDTO> projectDTOs = projects.stream()
                    .map(ProjectResponseDTO::new)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(projectDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
