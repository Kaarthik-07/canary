package com.canaryshop.mapper;

import com.canaryshop.dto.UserResponse;
import com.canaryshop.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserResponse toResponse(User user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail(),
                user.getRole(), user.getCohort(), user.isFeatureEnabled());
    }
}
