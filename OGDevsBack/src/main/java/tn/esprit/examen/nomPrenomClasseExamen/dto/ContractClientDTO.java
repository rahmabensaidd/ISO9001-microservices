package tn.esprit.examen.nomPrenomClasseExamen.dto;

import lombok.Data;
import tn.esprit.examen.nomPrenomClasseExamen.entities.ContractClient;

@Data
public class ContractClientDTO {
    private Long id;
    private String contractNumber;
    private String title;
    private Double value;
    private String startDate;
    private String endDate;
    private String status;
    private String clientId;
    private String clientUsername;
    private String signature;

    public ContractClientDTO(ContractClient contract) {
        this.id = contract.getId();
        this.contractNumber = contract.getContractNumber();
        this.title = contract.getTitle();
        this.value = contract.getValue();
        this.startDate = contract.getStartDate() != null ? contract.getStartDate().toString() : null;
        this.endDate = contract.getEndDate() != null ? contract.getEndDate().toString() : null;
        this.status = contract.getStatus() != null ? contract.getStatus().name() : null;
        this.clientId = contract.getClient() != null ? contract.getClient().getId() : null;
        this.clientUsername = contract.getClient() != null ? contract.getClient().getUsername() : null;
        this.signature = contract.getSignature();
    }

    public ContractClientDTO() {}
}