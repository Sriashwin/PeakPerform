package com.example.demo.controller;

import com.example.demo.dto.*;
import com.example.demo.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<UserResponseDto> register(
            @Valid @RequestBody RegisterDto registerDto) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(authService.register(registerDto));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(
            @Valid @RequestBody AuthRequestDto authRequestDto) {

        return ResponseEntity.ok(
                authService.login(authRequestDto)
        );
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponseDto> refresh(
            @RequestBody Map<String, String> request) {

        return ResponseEntity.ok(
                authService.refreshToken(request.get("refreshToken"))
        );
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('PERFORMANCE_ADMIN')")
    public ResponseEntity<List<UserResponseDto>> getAllUsers() {

        return ResponseEntity.ok(
                authService.getAllUsers()
        );
    }

    @GetMapping("/users/by-role")
    @PreAuthorize("hasAnyRole('PERFORMANCE_ADMIN','GOAL_OWNER')")
    public ResponseEntity<List<UserResponseDto>> getUsersByRole(
            @RequestParam String role) {

        return ResponseEntity.ok(
                authService.getUsersByRole(role)
        );
    }
}