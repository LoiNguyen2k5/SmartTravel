package com.smarttravel.repositories;

import com.smarttravel.entities.Role;
import com.smarttravel.enums.RoleEnum;
import org.springframework.data.jpa.repository.JpaRepository;


import java.util.Optional;


public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(RoleEnum name);
}
