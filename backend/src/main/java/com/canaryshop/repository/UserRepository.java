package com.canaryshop.repository;

import com.canaryshop.entity.User;
import com.canaryshop.enums.Cohort;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    long countByCohort(Cohort cohort);

    Page<User> findByCohort(Cohort cohort, Pageable pageable);
}
