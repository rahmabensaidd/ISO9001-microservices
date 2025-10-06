package tn.esprit.examen.nomPrenomClasseExamen.services;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import tn.esprit.examen.nomPrenomClasseExamen.entities.*;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Process;
import tn.esprit.examen.nomPrenomClasseExamen.exceptions.EntityNotFoundException;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RequiredArgsConstructor

@Slf4j
@Service
public class ProjectServices implements IProjectServices {
    private final ProcessRepository processRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final PhaseRepository phaseRepository;
    private  final ProjectOperationRepository projectOperationRepository;
    private final OperationRepository operationRepository;
    private  final ProjectTaskRepository projectTaskRepository;
    private final BugRepository bugRepository;
    private final ResourceRepository resourceRepository;

    @Value("${file.upload-dir}/logoprojects")
    private String uploadDir;
    @Override
    public ProjectDTO createProject(Project project, String email, List<Long> idProcess,String clientemail) {
        if (project == null) {
            throw new IllegalArgumentException("Le projet ne peut pas être null.");
        }

        // Associer le responsable
        UserEntity responsable = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur avec l'email " + email + " introuvable."));
        project.setResponsable(responsable);

        UserEntity client = userRepository.findByEmail(clientemail).orElse(null);
         project.setClient(client);


        // Initialiser les processus si null
        if (project.getProcesses() == null) {
            project.setProcesses(new HashSet<>());
        }

        // Récupérer les processus
        List<Process> processes = processRepository.findAllById(idProcess);
        if (processes.isEmpty()) {
            throw new RuntimeException("Aucun des processus fournis n'existe.");
        }
        project.getProcesses().addAll(processes);


        // Sauvegarder le projet
        Project savedProject = projectRepository.save(project);

        // Retourner le DTO
        return new ProjectDTO(
                savedProject.getIdProjet(),
                savedProject.getName(),
                savedProject.getProjectType(),
                savedProject.getDescription(),
                savedProject.getStart_Date(),
                savedProject.getExpected_endDate(),

                // Responsable (UserDTO)
                savedProject.getResponsable() != null
                        ? new UserDTO(
                        savedProject.getResponsable().getId(),
                        savedProject.getResponsable().getUsername(),
                        savedProject.getResponsable().getEmail()
                )
                        : null,

                // Phases (Set<PhaseDTO>)
                savedProject.getPhases() != null
                        ? savedProject.getPhases().stream()
                        .map(PhaseDTO::new)
                        .collect(Collectors.toSet())
                        : Collections.emptySet(),

                // Requirements (List<String>)
                savedProject.getRequirements() != null
                        ? new ArrayList<>(savedProject.getRequirements())
                        : Collections.emptyList(),

                // Resources (Set<Resource>)
                savedProject.getResources() != null
                        ? savedProject.getResources()
                        : Collections.emptySet(),

                // Technologies (List<String>)
                savedProject.getTechnologies() != null
                        ? new ArrayList<>(savedProject.getTechnologies())
                        : Collections.emptyList(),

                // ✅ Client (UserDTO)
                savedProject.getClient() != null
                        ? new UserDTO(
                        savedProject.getClient().getId(),
                        savedProject.getClient().getUsername(),
                        savedProject.getClient().getEmail()
                )
                        : null
        );
    }










    @Override
    public ProjectDTO updateProject(Long idProjet, ProjectUpdateDTO  updatedData) {
        Project existingProject = projectRepository.findById(idProjet)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé avec l'ID : " + idProjet));

        // Mettre à jour uniquement les champs nécessaires
        if (updatedData.getName() != null) {
            existingProject.setName(updatedData.getName());
        }
        if (updatedData.getDescription() != null) {
            existingProject.setDescription(updatedData.getDescription());
        }
        if (updatedData.getStart_Date() != null) {
            existingProject.setStart_Date(updatedData.getStart_Date());
        }
        if (updatedData.getExpected_endDate() != null) {
            existingProject.setExpected_endDate(updatedData.getExpected_endDate());
        }

        // Les autres champs comme phases, requirements restent intacts
        return new ProjectDTO( projectRepository.save(existingProject));
    }

    @Override
    public ProjectDTO getProjectById(Long id) {
        return projectRepository.findById(id)
                .map(project -> new ProjectDTO(project))
                .orElse(null);
    }

    @Override
    public List<ProjectDTO> getAllProjects() {
        return projectRepository.findAll().stream()
                .map(ProjectDTO::new) // Utilise le constructeur ProjectDTO(Project project)
                .collect(Collectors.toList());
    }


    @Override
    @Transactional
    public void deleteProject(Long id) {
        if (!projectRepository.existsById(id)) {
            throw new IllegalArgumentException("Project with id " + id + " does not exist.");
        }

        // Récupérer le projet
        Project project = projectRepository.findById(id).orElse(null);

        if (project != null) {
            // Désaffecter le responsable
            project.setResponsable(null);
            project.setClient(null);

            // Supprimer les références des phases (elles seront supprimées à cause de CascadeType.ALL)
            if (project.getPhases() != null) {
                for (Phase phase : project.getPhases()) {
                    phase.setProject(null); // Dissocier la phase du projet
                    this.deletephase(phase.getIdPhase());
                }
            }

            // Supprimer les relations ManyToMany avec les processus
            if (project.getProcesses() != null) {
                project.getProcesses().clear(); // Dissocier tous les processus liés
            }

            // Supprimer le projet
            projectRepository.delete(project);
        }
    }

    @Override
    public Phase createprojectphase(Phase phase ,Long idProject) {
        Project project = projectRepository.findById(idProject).orElse(null);
        phase.setProject(project);
        return  phaseRepository.save(phase);
    }



    @Override
    public List<PhaseDTO> getphasesByProject(Long idProject) {
        // Récupérer le projet par son ID
        Project project = projectRepository.findById(idProject)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));

        // Mapper les phases associées à ce projet en PhaseDTO
        List<PhaseDTO> phaseDTOList = project.getPhases().stream()
                .map(phase -> new PhaseDTO(phase))  // Transformation de chaque Phase en PhaseDTO
                .collect(Collectors.toList());

        return phaseDTOList;
    }


    @Override
    public ProjectOppDTO createprojectoperation(ProjectOpp projectOperation, Long idpdhase, Long idoperation) {
        // Trouver la phase correspondante par son ID
        Phase phase = phaseRepository.findById(idpdhase).orElseThrow(() -> new RuntimeException("Phase non trouvée"));
        Operation operation = operationRepository.findById(idoperation).orElse(null);

        if (operation == null) {
            throw new RuntimeException("Operation non trouvée");
        }

        // Sauvegarder d'abord ProjectOpp (cela persistera les ProjectTasks aussi grâce au CascadeType.ALL)
        projectOperation = projectOperationRepository.save(projectOperation);

        // Liste pour stocker les ProjectTask à ajouter
        Set<ProjectTask> projectTasks = new HashSet<>();

        // Assigner les tâches de l'opération à la ProjectOperation
        for (Task task : operation.getTasks()) {
            ProjectTask projectTask = new ProjectTask();
            projectTask.setTaskDescription(task.getTaskDescription());  // Mapper la description de la tâche
            projectTask.setProjectOpp(projectOperation);  // Assigner la ProjectOpp à la tâche

            // Ajouter chaque task à la collection de projecttasks de ProjectOpp
            projectTasks.add(projectTask);
        }
        projectTaskRepository.saveAll(projectTasks);
        // Maintenant, ajouter la collection de ProjectTask à la ProjectOpp
        projectOperation.setProjecttasks(projectTasks);

        // Assigner les autres informations à ProjectOpp
        projectOperation.setName(operation.getOperationName());
        projectOperation.setDescription(operation.getOperationDescription());
        projectOperation.setIdoperation(idoperation);

        // Assigner la phase à l'opération du projet
        phase.getProjectOperations().add(projectOperation);

        // Sauvegarder l'opération du projet dans la base de données
        projectOperation = projectOperationRepository.save(projectOperation);  // Cela persistera les ProjectTasks grâce au cascade

        // Retourner le DTO de l'opportunité de projet après création
        return new ProjectOppDTO(projectOperation); // Retourne le ProjectOppDTO
    }




    @Override
    public List<UserEntity> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public ProjectOppDTO assignUserToOpp(Long idOp, String email) {
        // Récupérer l'utilisateur par email
        UserEntity user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            // Gérer le cas où l'utilisateur n'est pas trouvé
            throw new RuntimeException("Utilisateur non trouvé avec l'email: " + email);
        }

        // Récupérer l'opportunité de projet par ID
        ProjectOpp p = projectOperationRepository.findById(idOp).orElse(null);
        if (p == null) {
            // Gérer le cas où l'opportunité de projet n'est pas trouvée
            throw new RuntimeException("Opportunité de projet non trouvée avec l'ID: " + idOp);
        }

        // Assigner l'utilisateur à l'opportunité de projet
        p.setUser(user);  // Assurez-vous que la relation entre ProjectOpp et UserEntity est correctement définie (par exemple, une association ManyToOne)

        // Sauvegarder les modifications
        projectOperationRepository.save(p);

        // Retourner le DTO de l'opportunité de projet après modification
        return new ProjectOppDTO(p); // Assurez-vous que ProjectOppDTO a un constructeur ou une méthode pour accepter un ProjectOpp
    }

    @Override
    public List<OperationnDTO> getoperationsbyproject(Long idProject) {
        Project project = projectRepository.findById(idProject).orElse(null);
        if (project == null) {
            System.out.println("Projet avec l'ID " + idProject + " non trouvé");
            return new ArrayList<>(); // Retourne une liste vide si le projet n'est pas trouvé
        }

        List<OperationnDTO> operations = new ArrayList<>();  // Créer une liste pour stocker les opérations
        List<Process> processes = project.getProcesses().stream().toList();
        System.out.println("Processus pour le projet " + idProject + ": " + processes.size());

        for (Process process : processes) {
            if (process.getOperations() != null) {
            for(Operation op : process.getOperations()) {
                operations.add(new OperationnDTO(op.getId(),op.getOperationName()));
            }
            }
        }
        return operations;
    }
    @Override
    public List<UserDTO> getUsersByProjectOperation(Long idProjectOperation) {
        // Récupération du projet opération
        ProjectOpp projectOpp = projectOperationRepository.findById(idProjectOperation).orElse(null);
        if (projectOpp == null) {
            return Collections.emptyList(); // Retourne une liste vide si le projet n'existe pas
        }

        // Récupération de l'opération associée
        Operation opp = operationRepository.findById(projectOpp.getIdoperation()).orElse(null);
        if (opp == null) {
            return Collections.emptyList(); // Retourne une liste vide si l'opération n'existe pas
        }

        // Transformation des UserEntity en UserDTO
        return opp.getUserEntities().stream()
                .map(user -> new UserDTO(user.getId(), user.getUsername(), user.getEmail()))
                .collect(Collectors.toList());
    }



    @Override
    public UserEntity assignusertooperation(Long idOperation, String email) {
        UserEntity u =userRepository.findByEmail(email).orElse(null);
        Operation operation =operationRepository.findById(idOperation).orElse(null);
        u.getOperations().add(operation);
        operation.getUserEntities().add(u);
        operationRepository.save(operation);
        return userRepository.save(u);
    }

    @Override
    @Transactional
    public void deletephase(Long idPhase) {
        Phase phase = phaseRepository.findById(idPhase)
                .orElseThrow(() -> new RuntimeException("Phase non trouvée avec l'ID : " + idPhase));

        // Charger explicitement les projectOperations pour éviter LazyInitializationException
        List<ProjectOpp> projectOperations = new ArrayList<>(phase.getProjectOperations());

        // 1. Supprimer les ProjectOpp associés à la Phase
        for (ProjectOpp projectOpp : projectOperations) {
            deleteProjectOperation(projectOpp.getIdProjectOperation());
        }

        // 2. Supprimer la relation entre la phase et le projet
        Project project = phase.getProject();
        if (project != null) {
            project.getPhases().remove(phase);
            phase.setProject(null); // Dé-associer explicitement pour éviter des erreurs
            projectRepository.save(project);
        }

        // 3. Supprimer la Phase
        phaseRepository.delete(phase);
    }

    @Transactional
    @Override
    public void deleteProjectOperation(Long id) {
        // Récupérer toutes les phases
        List<Phase> allPhases = phaseRepository.findAll();

        // Trouver l'opération de projet par ID
        ProjectOpp projectOperation = projectOperationRepository.findById(id).orElse(null);

        if (projectOperation != null) {
            // Dé-affecter l'utilisateur de cette opération de projet (unassign user)
            if (projectOperation.getUser() != null) {
                projectOperation.setUser(null); // Déassocier l'utilisateur
            }

            // Supprimer toutes les tâches associées à cette opération de projet
            Set<ProjectTask> tasksToDelete = new HashSet<>(projectOperation.getProjecttasks());
            for (ProjectTask task : tasksToDelete) {
                task.setProjectOpp(null); // Déassocier la tâche de l'opération de projet
                // Marquer la tâche comme supprimée ou à l'état "Deleted"
                // Suppression de la tâche directement sans utiliser le repository
                projectTaskRepository.delete(task);
            }

            // Parcourir toutes les phases et supprimer la relation avec cette opération de projet
            for (Phase phase : allPhases) {
                for (ProjectOpp phaseProjectOpp : phase.getProjectOperations()) {
                    if (phaseProjectOpp.equals(projectOperation)) {
                        phase.getProjectOperations().remove(phaseProjectOpp);
                        break; // Sortir de la boucle dès que l'élément est trouvé
                    }
                }
            }

            // Supprimer l'opération de projet
            projectOperationRepository.delete(projectOperation);
        } else {
            throw new RuntimeException("Opération de projet non trouvée avec l'ID : " + id);
        }
    }



    @Override
    public List<ProjectOppDTO> getprojetoppbyuser(String email) {
        // Récupérer l'utilisateur en tant qu'entité
        UserEntity user = userRepository.findByEmail(email).orElse(null);

        // Vérifier si l'utilisateur existe
        if (user == null) {
            return new ArrayList<>(); // Retourner une liste vide si l'utilisateur n'existe pas
        }

        // Récupérer les projets associés à l'utilisateur
        List<ProjectOpp> projectOpps = projectOperationRepository.findAll();

        // Filtrer les projets appartenant à cet utilisateur
        List<ProjectOppDTO> projectOppDTOSs = new ArrayList<>();
        for (ProjectOpp projectOpp : projectOpps) {
            if (projectOpp.getUser() != null && projectOpp.getUser().getId().equals(user.getId())) {
                projectOppDTOSs.add(new ProjectOppDTO(projectOpp)); // Conversion en DTO
            }
        }

        return projectOppDTOSs; // Retourner la liste filtrée
    }

    public ProjectTaskDTO convertToDTO(ProjectTask projectTask) {
        // Conversion des bugs en BugDTO
        Set<BugDTO> bugDTOs = projectTask.getBugs() != null ?
                projectTask.getBugs().stream()
                        .map(bug -> new BugDTO(bug)) // Conversion de chaque Bug en BugDTO
                        .collect(Collectors.toSet())  // Collecte dans un Set<BugDTO>
                : new HashSet<>(); // Si la liste des bugs est null, on retourne un Set vide

        // Retourner un ProjectTaskDTO avec les bugs convertis
        return new ProjectTaskDTO(
                projectTask.getId(),
                projectTask.getTaskDescription(),
                projectTask.getStatus(),
                projectTask.getSectionId(),
                bugDTOs // Passer le Set<BugDTO> converti
        );
    }

    @Override
    public List<ProjectTaskDTO> getTasksByUser(String email) {
        List<ProjectTask> projectTasks = projectTaskRepository.findTasksByUserEmail(email);
        return projectTasks.stream()
                .map(this::convertToDTO)  // Convert each ProjectTask to ProjectTaskDTO
                .collect(Collectors.toList());
    }
    @Override
    public ProjectTask updateTask(Long idTask, String newStatus) {
        ProjectTask projectTask = projectTaskRepository.findById(idTask).orElseThrow(
                () -> new RuntimeException("Task not found with id " + idTask)
        );

        // Met à jour le statut de la tâche
        projectTask.setStatus(newStatus);
        if (newStatus.equals("Done")){
            for (Bug bug :projectTask.getBugs()){
                bug.setStatus("FIXED");
                bugRepository.save(bug);
            }
        }
        projectTaskRepository.save(projectTask);

        // Vérifie si la tâche est bien "Done"
        if (!"Done".equalsIgnoreCase(newStatus)) {
            return projectTask; // Pas besoin de continuer si la tâche n'est pas Done
        }

        // Recherche du projet contenant cette tâche
        List<Project> projects = projectRepository.findAll();
        for (Project p : projects) {
            for (Phase ph : p.getPhases()) {
                for (ProjectOpp po : ph.getProjectOperations()) {
                    for (ProjectTask t : po.getProjecttasks()) {
                        if (t.getId().equals(idTask)) {
                            // Vérifier que toutes les tâches du projet sont Done
                            boolean allTasksDone = true;

                            for (Phase phase : p.getPhases()) {
                                for (ProjectOpp opp : phase.getProjectOperations()) {
                                    for (ProjectTask task : opp.getProjecttasks()) {
                                        if (!task.getId().equals(idTask) &&
                                                !"Done".equalsIgnoreCase(task.getStatus())) {
                                            allTasksDone = false;
                                            break;
                                        }
                                    }
                                    if (!allTasksDone) break;
                                }
                                if (!allTasksDone) break;
                            }

                            // Si toutes les autres tâches + celle-ci sont Done → mettre à jour la date de fin
                            if (allTasksDone) {
                                p.setActual_endDate(LocalDate.now());
                                projectRepository.save(p);
                            }

                            return projectTask;
                        }
                    }
                }
            }
        }

        return projectTask;
    }






    @Override
    public List<ProjectOppDTO> getAllProjectOpps(Long idphase) {
        // Récupérer la phase avec ses opérations et utilisateurs associés
        Phase phase = phaseRepository.findPhaseWithOperationsAndUsers(idphase);

        // Si la phase existe, transformer les ProjectOpp en ProjectOppDTO
        if (phase != null) {
            // Transformer chaque ProjectOpp en ProjectOppDTO et retourner la liste
            return phase.getProjectOperations().stream()
                    .map(ProjectOppDTO::new)  // Utilisation du constructeur ProjectOppDTO
                    .collect(Collectors.toList());
        }

        // Si la phase est nulle, retourner une liste vide
        return Collections.emptyList();
    }


    @Override

    public ProjectTaskDTO addandassignbugtoProjectTask(Bug bug, Long idProjectTask) {
        Optional<ProjectTask> projectTaskOptional = projectTaskRepository.findById(idProjectTask);

        if (projectTaskOptional.isPresent()) {
            ProjectTask projectTask = projectTaskOptional.get();
            System.out.println("Found ProjectTask: " + projectTask);

            // Vérifiez si projectOpp et developer existent
            if (projectTask.getProjectOpp() == null) {
                throw new RuntimeException("ProjectOpp is null for ProjectTask ID " + idProjectTask);
            }

            bug.setDeveloper(projectTask.getProjectOpp().getUser()); // Assigner la tâche au bug
            System.out.println("Assigned developer: " + bug.getDeveloper());

            bugRepository.save(bug); // Sauvegarder le bug
            projectTask.getBugs().add(bug); // Ajouter le bug à la collection
            projectTask = projectTaskRepository.save(projectTask); // Sauvegarder la mise à jour de ProjectTask

            return new ProjectTaskDTO(projectTask);
        } else {
            throw new RuntimeException("ProjectTask with ID " + idProjectTask + " not found");
        }
    }


    @Override
    public ProjectDTO getProjectbyprojectTask(Long idProjectTask) {
        List<Project> allProjects = projectRepository.findAll();

        for (Project project : allProjects) {
            for (Phase phase : project.getPhases()) {
                for (ProjectOpp po : phase.getProjectOperations()) {
                    for (ProjectTask pt : po.getProjecttasks()) {
                        if (pt.getId().equals(idProjectTask)) {
                            return new ProjectDTO(project); // Utilisation directe du constructeur
                        }
                    }
                }
            }
        }
        return null; // ou throw new NotFoundException("Project not found for task ID: " + idProjectTask);
    }

    @Override
    public ProjectDTO getProjectbyId(Long projectid) {
        return new ProjectDTO(projectRepository.findById(projectid).orElse(null));
    }

    @Override
    public BugDTO updateBugstaus(Long idbug, String newStatus) {
        Bug bug = bugRepository.findById(idbug).orElse(null);
        bug.setStatus(newStatus);
        bugRepository.save(bug);
        return new BugDTO(bug);
    }

    public ProjectDTO addTechnologiesToProject(Long idProject, List<String> technologies) {
        // Recherche du projet par ID
        Project project = projectRepository.findById(idProject)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé avec l'ID : " + idProject));

        // Nettoyage de la liste des technologies : suppression des null, chaînes vides et doublons
        List<String> cleanedTechnologies = technologies == null ? new ArrayList<>() :
                technologies.stream()
                        .filter(tech -> tech != null && !tech.trim().isEmpty())
                        .map(String::trim)
                        .distinct() // Supprime les doublons dans la nouvelle liste
                        .collect(Collectors.toList());

        // Remplacement de la liste existante des technologies par la nouvelle liste nettoyée
        project.setTechnologies(cleanedTechnologies);  // Remplacement direct de la liste des technologies

        // Sauvegarde et retour du projet mis à jour
        return new ProjectDTO(projectRepository.save(project));
    }





    ////////////////////////:::::resources ////////////////


    @Override
    public ResourceDTO addResource(ResourceDTO dto) {
        UserEntity user = null;
        Project project = null;

        if (dto.getUser() != null && dto.getUser().getId() != null) {
            user = userRepository.findById(dto.getUser().getId()).orElse(null);
        }

        if (dto.getProject() != null && dto.getProject().getIdProjet() != null) {
            project = projectRepository.findById(dto.getProject().getIdProjet()).orElse(null);
        }

        Resource resource = new Resource();
        resource.setResourceName(dto.getResourceName());
        resource.setPrice(dto.getPrice());
        resource.setStatus(dto.getStatus());
        resource.setType(dto.getType());
        resource.setUser(user);
        resource.setProject(project);

        Resource saved = resourceRepository.save(resource);
        return new ResourceDTO(saved); // ✅ Construction directe depuis l'entité
    }

    @Override
    public ResourceDTO updateResource(Long id, ResourceDTO dto) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found"));

        if (dto.getUser() != null && dto.getUser().getId() != null) {
            UserEntity user = userRepository.findById(dto.getUser().getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            resource.setUser(user);
        }

        if (dto.getProject() != null && dto.getProject().getIdProjet() != null) {
            Project project = projectRepository.findById(dto.getProject().getIdProjet())
                    .orElseThrow(() -> new RuntimeException("Project not found"));
            resource.setProject(project);
        }

        resource.setResourceName(dto.getResourceName());
        resource.setPrice(dto.getPrice());
        resource.setStatus(dto.getStatus());
        resource.setType(dto.getType());

        Resource updated = resourceRepository.save(resource);
        return new ResourceDTO(updated); // ✅ Utilisation directe
    }

    @Override
    public void deleteResource(Long id) {
        resourceRepository.deleteById(id);
    }

    @Override
    public ResourceDTO getResourceById(Long id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found"));
        return new ResourceDTO(resource);
    }

    @Override
    public List<ResourceDTO> getAllResources() {
        return resourceRepository.findAll().stream()
                .map(ResourceDTO::new) // ✅ Plus simple et cohérent
                .collect(Collectors.toList());
    }

    @Override
    public ResourceDTO assignResourceToUser(Long resourceId, String useremail) {
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new RuntimeException("Ressource non trouvée"));

        UserEntity user = userRepository.findByEmail(useremail)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        resource.setUser(user);
        resource.setStatus("In Use");
        Resource updated = resourceRepository.save(resource);

        return new ResourceDTO(updated);
    }

    @Override
    public ResourceDTO unassignResourcefromUser(Long resourceId, String userId) {
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new RuntimeException("Ressource non trouvée"));

        // Vérifier que la ressource est bien assignée à cet utilisateur
        if (resource.getUser() == null || !resource.getUser().getId().toString().equals(userId)) {
            throw new RuntimeException("Cette ressource n'est pas assignée à cet utilisateur");
        }

        resource.setUser(null);
        resource.setStatus("Available"); // ou un autre statut selon votre logique métier
        Resource updated = resourceRepository.save(resource);

        return new ResourceDTO(updated);
    }



    @Override
    public ProjectDTO assignResourcesToProject(Long projectId, List<Long> resourceIds) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));

        List<Resource> resources = resourceRepository.findAllById(resourceIds);

        for (Resource resource : resources) {
            resource.setProject(project);
            resource.setStatus("In Use");
            resourceRepository.save(resource);
        }

        resourceRepository.saveAll(resources);

        // Pour rafraîchir la liste des ressources liées
        project = projectRepository.findById(projectId).orElseThrow();

        return new ProjectDTO(project);
    }

    @Override
    public ProjectDTO unassignResourcesToProject(Long projectId, long resourceId) {
        // Step 1: Find the project by ID, throw an exception if not found
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));

        // Step 2: Find the resource by ID, throw an exception if not found
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new RuntimeException("Ressource non trouvée"));

        // Step 3: Verify that the resource is assigned to this project
        if (resource.getProject() == null || !resource.getProject().getIdProjet().equals(projectId)) {
            throw new RuntimeException("La ressource " + resourceId + " n'est pas assignée à ce projet");
        }

        // Step 4: Unassign the resource by setting its project to null and status to "Available"
        resource.setProject(null);
        resource.setStatus("Available");
        resourceRepository.save(resource);

        // Step 5: Refresh the project to reflect the updated list of resources
        project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé après mise à jour"));

        // Step 6: Return the updated project as a DTO
        return new ProjectDTO(project);
    }

    @Override
    public ProjectDTO updateDates(Long idProjet, String startDate, String endDate) {
        Project project = projectRepository.findById(idProjet)
                .orElseThrow(() -> new EntityNotFoundException("Projet avec ID " + idProjet + " non trouvé"));

        // 2. Convertir les chaînes en LocalDate
        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);

        // 3. Mettre à jour le projet
        project.setStart_Date(start);
        project.setExpected_endDate(end);

        // 4. Sauvegarder les modifications
        Project updated = projectRepository.save(project);
        return new ProjectDTO(updated);
    }

    @Override
    public ProjectDTO getProjectbyProjectopp(Long projectOppId) {
        List<Project> projects = projectRepository.findAll();
        Project preturned = null;

        for (Project p : projects) {
            for (Phase ph : p.getPhases()) {
                for (ProjectOpp ppopp : ph.getProjectOperations()) {
                    if (ppopp.getIdProjectOperation().equals(projectOppId)) {
                        preturned = p;
                        break;
                    }
                }
                if (preturned != null) break;
            }
            if (preturned != null) break;
        }

        return preturned != null ? new ProjectDTO(preturned) : null;
    }


    @Override
    // Supprimer une exigence d'un projet
    public ProjectDTO deleterequirement(Long idProject, String requirement) {
        Optional<Project> projectOpt = projectRepository.findById(idProject);
        if (projectOpt.isPresent()) {
            Project project = projectOpt.get();
            project.getRequirements().remove(requirement);
            projectRepository.save(project); // Sauvegarde le projet avec les modifications
            return new ProjectDTO(project);
        }
        throw new RuntimeException("Project not found");
    }
    @Override

    public ProjectDTO deletetechnology(Long idProject, String technology) {
        Optional<Project> projectOpt = projectRepository.findById(idProject);
        if (projectOpt.isPresent()) {
            Project project = projectOpt.get();
            project.getTechnologies().remove(technology);
            projectRepository.save(project); // Sauvegarde le projet avec les modifications
            return new ProjectDTO(project);
        }
        throw new RuntimeException("Project not found");
    }

    // Ajouter plusieurs technologies à un projet
    @Override
    public ProjectDTO addmanytechnologies(Long idProject, List<String> techs) {
        Optional<Project> projectOpt = projectRepository.findById(idProject);
        if (projectOpt.isPresent()) {
            Project project = projectOpt.get();
            project.getTechnologies().addAll(techs);
            projectRepository.save(project); // Sauvegarde le projet avec les nouvelles technologies
            return new ProjectDTO(project);
        }
        throw new RuntimeException("Project not found");
    }
    @Override
    // Ajouter plusieurs exigences à un projet
    public ProjectDTO addmanyrequiremnts(Long idProject, List<String> reqs) {
        Optional<Project> projectOpt = projectRepository.findById(idProject);
        if (projectOpt.isPresent()) {
            Project project = projectOpt.get();
            project.getRequirements().addAll(reqs);
            projectRepository.save(project); // Sauvegarde le projet avec les nouvelles exigences
            return  new  ProjectDTO(project);
        }
        throw new RuntimeException("Project not found");
    }
    @Override
    public void addPhasesToProject(Long projectId, List<Phasesugg> phasesSugg) {
        // Trouver le projet par ID
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        // Ajouter les phases au projet
        for (Phasesugg phaseSugg : phasesSugg) {
            Phase phase = new Phase(); // Créer une nouvelle Phase

            phase.setPhase_name(phaseSugg.getName());           // Copier le name
            phase.setDescription(phaseSugg.getDescription()); // Copier la description
            phase.setProject(project);                    // Associer au projet

            // Tu peux aussi mettre des valeurs par défaut pour d'autres attributs si besoin :
            // phase.setStartDate(LocalDate.now());
            // phase.setEndDate(LocalDate.now().plusDays(7));

            phaseRepository.save(phase); // Sauvegarder la nouvelle phase
        }
    }

    @Override
    public PhaseDTO updatePhase(Long idPhase, String name, String description) {
        Phase ph = phaseRepository.findById(idPhase)
                .orElseThrow(() -> new EntityNotFoundException("Phase with ID " + idPhase + " not found"));

        ph.setPhase_name(name);
        ph.setDescription(description);
        phaseRepository.save(ph);

        return new PhaseDTO(ph);
    }

    @Override
    public BugDTO updateBug(Bug updatedBug, Long idBug) {
        Bug existingBug = bugRepository.findById(idBug)
                .orElseThrow(() -> new RuntimeException("Bug not found with ID: " + idBug));

        // Mettre à jour les champs modifiables
        existingBug.setDescription(updatedBug.getDescription());
        existingBug.setStatus(updatedBug.getStatus());
        existingBug.setSource_issue(updatedBug.getSource_issue());
        existingBug.setPriority(updatedBug.getPriority());

        Bug savedBug = bugRepository.save(existingBug);

        return new BugDTO(savedBug);
    }

    @Override
    public void deleteBug(Long idBug) {
        // 1. Vérifier si le bug existe
        Bug existingBug = bugRepository.findById(idBug)
                .orElseThrow(() -> new RuntimeException("Bug not found with ID: " + idBug));

        // 2. Dissocier les bugs de leurs tasks
        List<ProjectTask> tasks = projectTaskRepository.findAll();

        // Supposons que `projectTaskRepository` est le repository des entités de type ProjectTask
        for (ProjectTask task : tasks) {
            // Utilisation d'un itérateur pour éviter ConcurrentModificationException si on modifie la collection
            Iterator<Bug> iterator = task.getBugs().iterator();
            while (iterator.hasNext()) {
                Bug b = iterator.next();
                if (b.equals(existingBug)) {
                    iterator.remove();  // Enlever le bug de la liste des bugs de la task
                }
            }
            // Sauvegarder la task après la dissociation
            projectTaskRepository.save(task);
        }

        // 3. Supprimer le bug
        bugRepository.delete(existingBug);  // Supprimer le bug une fois dissocié des tasks
    }

    @Override
    public List<UserEntity> getclients() {
        List<UserEntity>userEntities = userRepository.findAll();
        List<UserEntity>clients= new ArrayList<>();
        for (UserEntity userEntity : userEntities) {
          for (Role role : userEntity.getRoles()) {
              if (role.getRoleName().equals("ROLE_CLIENT")) {
                  clients.add(userEntity);
              }
          }
        }
        return clients;
    }

@Override
public List<Project> getProjectsByCurrentUser() {
    String userId = SecurityContextHolder.getContext().getAuthentication().getName();
    Optional<UserEntity> userOpt = userRepository.findById(userId);
    if (!userOpt.isPresent()) {
        throw new RuntimeException("Utilisateur connecté non trouvé dans la base de données (ID: " + userId + ").");
    }
    UserEntity client = userOpt.get();
    return projectRepository.findByClient(client);
}

}