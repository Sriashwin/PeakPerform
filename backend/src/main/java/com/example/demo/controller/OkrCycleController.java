package com.example.demo.controller;

import com.example.demo.dto.CycleSummaryStatsDto;
import com.example.demo.dto.OkrCycleRequestDto;
import com.example.demo.dto.OkrCycleResponseDto;
import com.example.demo.entity.AppUser;
import com.example.demo.service.OkrCycleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cycles")
@RequiredArgsConstructor
public class OkrCycleController {

    private final OkrCycleService okrCycleService;

    @PostMapping
    @PreAuthorize("hasRole('PERFORMANCE_ADMIN')")
    public ResponseEntity<OkrCycleResponseDto> createCycle(
            @Valid @RequestBody OkrCycleRequestDto requestDto,
            @AuthenticationPrincipal AppUser currentUser) {

        return ResponseEntity.ok(
                okrCycleService.createCycle(requestDto, currentUser.getId())
        );
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<OkrCycleResponseDto>> getAllCycles() {

        return ResponseEntity.ok(
                okrCycleService.getAllCycles()
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OkrCycleResponseDto> getCycleById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                okrCycleService.getCycleById(id)
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('PERFORMANCE_ADMIN')")
    public ResponseEntity<OkrCycleResponseDto> updateCycle(
            @PathVariable Long id,
            @Valid @RequestBody OkrCycleRequestDto requestDto) {

        return ResponseEntity.ok(
                okrCycleService.updateCycle(id, requestDto)
        );
    }

    @PutMapping("/{id}/activate")
    @PreAuthorize("hasRole('PERFORMANCE_ADMIN')")
    public ResponseEntity<OkrCycleResponseDto> activateCycle(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                okrCycleService.activateCycle(id)
        );
    }

    @PutMapping("/{id}/close")
    @PreAuthorize("hasRole('PERFORMANCE_ADMIN')")
    public ResponseEntity<OkrCycleResponseDto> closeCycle(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                okrCycleService.closeCycle(id)
        );
    }

    @GetMapping("/{id}/stats")
    @PreAuthorize("hasAnyRole('PERFORMANCE_ADMIN','TEAM_LEAD')")
    public ResponseEntity<CycleSummaryStatsDto> getCycleStats(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                okrCycleService.getCycleSummaryStats(id)
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('PERFORMANCE_ADMIN')")
    public ResponseEntity<Void> deleteCycle(
            @PathVariable Long id) {

        okrCycleService.deleteCycle(id);

        return ResponseEntity.noContent().build();
    }
}