package tn.esprit.examen.nomPrenomClasseExamen.entities;

public class ResourceDTO {

    private Long resourceId;
    private String resourceName;
    private float price;
    private String status;
    private String type;

    private UserDTO user;
    private ProjectDTO project; // ✅ Ajout du projet associé

    // Constructeurs
    public ResourceDTO() {}

    public ResourceDTO(Long resourceId, String resourceName, float price, String status, String type, UserDTO user, ProjectDTO project) {
        this.resourceId = resourceId;
        this.resourceName = resourceName;
        this.price = price;
        this.status = status;
        this.type = type;
        this.user = user;
        this.project = project;
    }

    // Constructeur à partir de l'entité Resource
    public ResourceDTO(Resource resource) {
        this.resourceId = resource.getResourceId();
        this.resourceName = resource.getResourceName();
        this.price = resource.getPrice();
        this.status = resource.getStatus();
        this.type = resource.getType();
        this.user = resource.getUser() != null ? new UserDTO(resource.getUser()) : null;
        this.project = resource.getProject() != null ? new ProjectDTO(resource.getProject()) : null;
    }

    // Getters et Setters
    public Long getResourceId() {
        return resourceId;
    }

    public void setResourceId(Long resourceId) {
        this.resourceId = resourceId;
    }

    public String getResourceName() {
        return resourceName;
    }

    public void setResourceName(String resourceName) {
        this.resourceName = resourceName;
    }

    public float getPrice() {
        return price;
    }

    public void setPrice(float price) {
        this.price = price;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public UserDTO getUser() {
        return user;
    }

    public void setUser(UserDTO user) {
        this.user = user;
    }

    public ProjectDTO getProject() {
        return project;
    }

    public void setProject(ProjectDTO project) {
        this.project = project;
    }
}
