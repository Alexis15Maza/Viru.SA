package com.virusa;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication 
public class VirusaBackendApplication {

    public static void main(String[] args) {

        SpringApplication.run(VirusaBackendApplication.class, args);
        System.out.println("La aplicación Virusa Backend ha iniciado en el puerto 8080");
    }

}