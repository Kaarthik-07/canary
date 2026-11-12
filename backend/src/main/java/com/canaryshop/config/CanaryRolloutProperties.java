
package com.canaryshop.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "canary.rollout")
public record CanaryRolloutProperties(
        int percentage,
        boolean offersEnabled
) {
    public CanaryRolloutProperties {
        if (percentage < 0 || percentage > 100) {
            throw new IllegalArgumentException(
                    "Canary rollout percentage must be between 0 and 100"
            );
        }
    }
}
