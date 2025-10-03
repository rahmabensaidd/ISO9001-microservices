## Étape 1 : Build de l'application avec Maven
#FROM eclipse-temurin:21-jdk AS builder
#WORKDIR /app
#COPY . .
#RUN ./mvnw clean package -DskipTests
#
## Étape 2 : Image de production légère
#FROM eclipse-temurin:21-jdk
#WORKDIR /app
#COPY --from=builder /app/target/*.jar app.jar
#EXPOSE 8888
#ENTRYPOINT ["java", "-jar", "app.jar"]