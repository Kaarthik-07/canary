
package com.canaryshop.service;

import com.canaryshop.config.CanaryRolloutProperties;
import com.canaryshop.entity.User;
import com.canaryshop.enums.Cohort;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class CohortAssignmentServiceTest {

    private final CohortAssignmentService service =
            new CohortAssignmentService(
                    new CanaryRolloutProperties(10, true)
            );

    @Test
    void assignsSameCohortForSameUuid() {
        UUID id = UUID.fromString(
                "00000000-0000-0000-0000-000000000001"
        );

        User first = createUser(id);
        User second = createUser(id);

        service.assignCohort(first);
        service.assignCohort(second);

        assertEquals(first.getCohort(), second.getCohort());
        assertEquals(first.isFeatureEnabled(), second.isFeatureEnabled());
    }

    @Test
    void rejectsUserWithoutGeneratedId() {
        User user = new User(
                "Test User",
                "test@example.com",
                "password"
        );

        assertThrows(
                IllegalArgumentException.class,
                () -> service.assignCohort(user)
        );
    }

    @Test
    void disablesOffersWhenGlobalFlagIsDisabled() {
        CohortAssignmentService disabledService =
                new CohortAssignmentService(
                        new CanaryRolloutProperties(100, false)
                );

        User user = createUser(UUID.randomUUID());

        disabledService.assignCohort(user);

        assertEquals(Cohort.CANARY, user.getCohort());
        assertFalse(user.isFeatureEnabled());
    }

    @Test
    void zeroPercentNeverAssignsCanary() {
        CohortAssignmentService zeroPercentService =
                new CohortAssignmentService(
                        new CanaryRolloutProperties(0, true)
                );

        User user = createUser(UUID.randomUUID());

        zeroPercentService.assignCohort(user);

        assertEquals(Cohort.CONTROL, user.getCohort());
        assertFalse(user.isFeatureEnabled());
    }

    private User createUser(UUID id) {
        User user = new User(
                "Test User",
                "test@example.com",
                "password"
        );

        try {
            var field = User.class.getDeclaredField("id");
            field.setAccessible(true);
            field.set(user, id);
        } catch (ReflectiveOperationException e) {
            throw new RuntimeException(e);
        }

        return user;
    }
}

