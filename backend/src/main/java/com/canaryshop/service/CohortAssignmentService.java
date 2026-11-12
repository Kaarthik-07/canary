
package com.canaryshop.service;

import com.canaryshop.config.CanaryRolloutProperties;
import com.canaryshop.entity.User;
import com.canaryshop.enums.Cohort;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class CohortAssignmentService {

    private final CanaryRolloutProperties rolloutProperties;

    public CohortAssignmentService(CanaryRolloutProperties rolloutProperties) {
        this.rolloutProperties = rolloutProperties;
    }

    public void assignCohort(User user) {
        UUID userId = user.getId();

        if (userId == null) {
            throw new IllegalArgumentException(
                    "User ID must be generated before cohort assignment"
            );
        }

        int bucket = Math.floorMod(userId.hashCode(), 100);

        boolean isCanary = bucket < rolloutProperties.percentage();

        user.setCohort(isCanary ? Cohort.CANARY : Cohort.CONTROL);
        user.setFeatureEnabled(isCanary && rolloutProperties.offersEnabled());
    }
}
