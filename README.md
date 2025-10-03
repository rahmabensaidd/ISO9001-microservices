# Discovery Service

## Description
Le **Discovery Service** est un microservice utilisant **Spring Cloud Eureka** pour la découverte et l’enregistrement des autres microservices dans l’architecture.  
Il permet aux microservices clients (ex. `user-service`, `gateway-service`) de s’enregistrer et de se découvrir dynamiquement.

---

## Technologies
- Java 17
- Spring Boot 3.5.6
- Spring Cloud 2025.0.0 (Northfields)
- Eureka Server
- Maven

---

## Configuration

### application.yml
```yaml
server:
  port: 8761

eureka:
  client:
    register-with-eureka: false
    fetch-registry: false
  server:
    enable-self-preservation: false
