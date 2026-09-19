package com.example.demo.repository;

import com.example.demo.entity.AppUser;
import com.example.demo.entity.AppUser.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {

    Optional<AppUser> findByEmail(String email);

    boolean existsByEmail(String email);

    List<AppUser> findByRoleAndIsActiveTrue(Role role);

    List<AppUser> findByDepartmentAndIsActiveTrue(String department);

    @Query("SELECT u FROM AppUser u WHERE u.isActive = true ORDER BY u.fullName ASC")
    List<AppUser> findAllActiveUsers();

    @Query("SELECT COUNT(u) FROM AppUser u WHERE u.role = :role AND u.isActive = true")
    long countActiveByRole(Role role);
}