package com.example.uni_manage;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class UniManageApplication {

	public static void main(String[] args) {
		SpringApplication.run(UniManageApplication.class, args);
	}

}
