package tn.esprit.examen.nomPrenomClasseExamen;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableAspectJAutoProxy
@EnableScheduling
@EnableEurekaServer
@SpringBootApplication
public class nomPrenomClasseExamenApplication {

    public static void main(String[] args) {
        SpringApplication.run(nomPrenomClasseExamenApplication.class, args);
    }

}
