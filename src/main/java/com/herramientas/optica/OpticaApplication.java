package com.herramientas.optica;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class OpticaApplication {
	public static void main(String[] args) {
		SpringApplication.run(OpticaApplication.class, args);
	}

}
