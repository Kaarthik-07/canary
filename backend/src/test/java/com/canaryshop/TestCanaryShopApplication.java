package com.canaryshop;

import org.springframework.boot.SpringApplication;

public class TestCanaryShopApplication {

	public static void main(String[] args) {
		SpringApplication.from(CanaryShopApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}
