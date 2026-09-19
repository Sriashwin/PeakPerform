package com.example.demo.config;

import com.example.demo.entity.AppUser;
import com.example.demo.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {

        seedUser(
                "Alexandra Reed",
                "admin@peakperform.io",
                "Admin@123",
                AppUser.Role.ROLE_PERFORMANCE_ADMIN,
                "Executive"
        );

        seedUser(
                "Marcus Johnson",
                "teamlead@peakperform.io",
                "Lead@123",
                AppUser.Role.ROLE_TEAM_LEAD,
                "Engineering"
        );

        seedUser(
                "Priya Sharma",
                "priya@peakperform.io",
                "Goal@123",
                AppUser.Role.ROLE_GOAL_OWNER,
                "Engineering"
        );
    }

    private void seedUser(
            String fullName,
            String email,
            String password,
            AppUser.Role role,
            String department) {

        if (appUserRepository.existsByEmail(email)) {
            return;
        }

        AppUser user = new AppUser();
        user.setFullName(fullName);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(role);
        user.setDepartment(department);
        user.setIsActive(true);

        appUserRepository.save(user);
    }
}