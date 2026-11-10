package com.canaryshop.dto;

import com.canaryshop.enums.Cohort;
import com.canaryshop.enums.Role;

import java.util.UUID;

/** What the API shows about a user. Deliberately has no password field. */
public record UserResponse(UUID id, String name, String email, Role role, Cohort cohort, boolean featureEnabled) {
}
