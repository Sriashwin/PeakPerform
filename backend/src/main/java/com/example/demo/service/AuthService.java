package com.example.demo.service;

import com.example.demo.dto.AuthRequestDto;
import com.example.demo.dto.AuthResponseDto;
import com.example.demo.dto.RegisterDto;
import com.example.demo.dto.UserResponseDto;
import com.example.demo.entity.AppUser;
import com.example.demo.exception.BusinessValidationException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.AppUserRepository;
import com.example.demo.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public UserResponseDto register(RegisterDto dto) {

        if (appUserRepository.existsByEmail(dto.getEmail())) {
            throw new BusinessValidationException(
                    "Email already registered: " + dto.getEmail());
        }

        AppUser.Role role;

        try {
            role = AppUser.Role.valueOf(dto.getRole());
        } catch (IllegalArgumentException ex) {
            throw new BusinessValidationException(
                    "Invalid role: " + dto.getRole()
                            + ". Valid values: ROLE_PERFORMANCE_ADMIN, ROLE_TEAM_LEAD, ROLE_GOAL_OWNER");
        }

        AppUser user = AppUser.builder()
                .fullName(dto.getFullName())
                .email(dto.getEmail())
                .password(passwordEncoder.encode(dto.getPassword()))
                .role(role)
                .department(dto.getDepartment())
                .isActive(true)
                .build();

        user = appUserRepository.save(user);

        UserResponseDto response = new UserResponseDto();
        response.setId(user.getId());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole().name());
        response.setDepartment(user.getDepartment());
        response.setIsActive(user.getIsActive());

        return response;
    }

    public AuthResponseDto login(AuthRequestDto dto) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        dto.getEmail(),
                        dto.getPassword()));

        AppUser user = appUserRepository.findByEmail(dto.getEmail())
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        if (!user.getIsActive()) {
            throw new BusinessValidationException(
                    "Your account has been deactivated. Contact administrator.");
        }

        String accessToken = jwtUtil.generateAccessToken(user);
        String refreshToken = jwtUtil.generateRefreshToken(user);

        return new AuthResponseDto(
                accessToken,
                refreshToken,
                user.getRole().name(),
                user.getId(),
                user.getFullName(),
                user.getEmail()
        );
    }

    public AuthResponseDto refreshToken(String refreshToken) {

        String email = jwtUtil.extractUsername(refreshToken);

        AppUser user = appUserRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        if (!jwtUtil.isTokenValid(refreshToken, user)) {
            throw new BusinessValidationException(
                    "Refresh token is invalid or expired. Please log in again.");
        }

        String accessToken = jwtUtil.generateAccessToken(user);

        return new AuthResponseDto(
                accessToken,
                refreshToken,
                user.getRole().name(),
                user.getId(),
                user.getFullName(),
                user.getEmail()
        );
    }

    public List<UserResponseDto> getAllUsers() {

        return appUserRepository.findAllActiveUsers()
                .stream()
                .map(user -> {
                    UserResponseDto dto = new UserResponseDto();
                    dto.setId(user.getId());
                    dto.setFullName(user.getFullName());
                    dto.setEmail(user.getEmail());
                    dto.setRole(user.getRole().name());
                    dto.setDepartment(user.getDepartment());
                    dto.setIsActive(user.getIsActive());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public List<UserResponseDto> getUsersByRole(String role) {

        AppUser.Role userRole;

        try {
            userRole = AppUser.Role.valueOf(role);
        } catch (IllegalArgumentException ex) {
            throw new BusinessValidationException("Invalid role: " + role);
        }

        return appUserRepository.findByRoleAndIsActiveTrue(userRole)
                .stream()
                .map(user -> {
                    UserResponseDto dto = new UserResponseDto();
                    dto.setId(user.getId());
                    dto.setFullName(user.getFullName());
                    dto.setEmail(user.getEmail());
                    dto.setRole(user.getRole().name());
                    dto.setDepartment(user.getDepartment());
                    dto.setIsActive(user.getIsActive());
                    return dto;
                })
                .collect(Collectors.toList());
    }
}