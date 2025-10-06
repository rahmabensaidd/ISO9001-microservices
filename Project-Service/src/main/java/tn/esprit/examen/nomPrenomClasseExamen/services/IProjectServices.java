package tn.esprit.examen.nomPrenomClasseExamen.services;

import tn.esprit.examen.nomPrenomClasseExamen.entities.*;

import java.util.List;

public interface IProjectServices {
    ProjectDTO createProject(Project project, String email, List<Long> idprocess, String clientemail) ;
    ProjectDTO updateProject(Long idProjet, ProjectUpdateDTO updatedData);
    ProjectDTO getProjectById(Long id);
    List<ProjectDTO> getAllProjects();
    void deleteProject(Long id);
    Phase createprojectphase(Phase phase ,Long idProject);
    List<PhaseDTO> getphasesByProject(Long idProject);
    ProjectOppDTO createprojectoperation(ProjectOpp projectOperation , Long idpdhase,Long idoperation);
    List<ProjectOppDTO> getAllProjectOpps(Long idphase);
    List<UserEntity>getAllUsers();
    ProjectOppDTO assignUserToOpp(Long idOp,String email);
    List<OperationnDTO> getoperationsbyproject(Long idProject);
    List<UserDTO>getUsersByProjectOperation(Long idProjectOperation);
    UserEntity assignusertooperation(Long idOperation,String email);
    void deletephase(Long idPhase);
    void deleteProjectOperation(Long id);
    List<ProjectOppDTO> getprojetoppbyuser(String email);

    List<ProjectTaskDTO> getTasksByUser(String email);
    ProjectTask updateTask(Long idTask, String newStatus);
    ProjectTaskDTO addandassignbugtoProjectTask(Bug bug,Long idProjectTask);
    ProjectDTO getProjectbyprojectTask(Long idProjectTask);
    ProjectDTO getProjectbyId(Long projectid);
    BugDTO updateBugstaus(Long idbug,String newStatus );
    ProjectDTO addTechnologiesToProject(Long idProject, List<String>technologies);

    ResourceDTO addResource(ResourceDTO resourceDTO);
    ResourceDTO updateResource(Long id, ResourceDTO resourceDTO);
    void deleteResource(Long id);
    ResourceDTO getResourceById(Long id);
    List<ResourceDTO> getAllResources();

    // Affectation
    ResourceDTO assignResourceToUser(Long resourceId, String userId);
    ResourceDTO unassignResourcefromUser(Long resourceId, String userId);



    ProjectDTO assignResourcesToProject(Long projectId, List<Long> resourceIds);
    ProjectDTO unassignResourcesToProject(Long projectId,long  resourceId);

    ProjectDTO updateDates(Long idProjet,String startDate, String endDate);

    ProjectDTO getProjectbyProjectopp(Long projectoppid);
    ProjectDTO deleterequirement(Long idProject,String requirement);
    ProjectDTO deletetechnology(Long idProject,String requirement);
    ProjectDTO addmanytechnologies(Long idProject,List<String> techs );
    ProjectDTO addmanyrequiremnts(Long idProject,List<String> reqs );

    void addPhasesToProject(Long projectId, List<Phasesugg> phasesSugg);


    PhaseDTO updatePhase(Long idPhase, String name, String description  );

    BugDTO updateBug(Bug bug , Long idBug);

    void deleteBug(Long idBug);

    List<UserEntity> getclients();

    List<Project> getProjectsByCurrentUser();
}