
package com.canaryshop;

import com.canaryshop.config.CanaryRolloutProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(CanaryRolloutProperties.class)
public class CanaryShopApplication {

    public static void main(String[] args) {
        SpringApplication.run(CanaryShopApplication.class, args);
    }

}
