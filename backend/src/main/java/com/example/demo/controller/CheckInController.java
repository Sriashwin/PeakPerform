package com.example.demo.controller;

import com.example.demo.dto.*;
import com.example.demo.entity.AppUser;
import com.example.demo.service.CheckInService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/check-ins")
@RequiredArgsConstructor
public class CheckInController {

    private final CheckInService checkInService;

    @PostMapping
    @PreAuthorize("hasRole('GOAL_OWNER')")
    public ResponseEntity<CheckInResponseDto> createCheckIn(
            @Valid @RequestBody CheckInRequestDto requestDto,
            @AuthenticationPrincipal AppUser currentUser) {

        return ResponseEntity.ok(
                checkInService.submitCheckin(requestDto, currentUser.getId())
        );
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<CheckInResponseDto>> getCheckIns(
            @RequestParam Long keyResultId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return ResponseEntity.ok(
                checkInService.getCheckInsByKeyResult(
                        keyResultId,
                        PageRequest.of(page, size)
                )
        );
    }

    @GetMapping("/mine")
    @PreAuthorize("hasRole('GOAL_OWNER')")
    public ResponseEntity<Page<CheckInResponseDto>> getMyCheckIns(
            @AuthenticationPrincipal AppUser currentUser) {

        return ResponseEntity.ok(
                checkInService.getMyCheckins(
                        currentUser.getId(),
                        PageRequest.of(0, 10)
                )
        );
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('TEAM_LEAD','PERFORMANCE_ADMIN')")
    public ResponseEntity<List<CheckInResponseDto>> getPendingCheckIns(
            @AuthenticationPrincipal AppUser currentUser) {

        return ResponseEntity.ok(
                checkInService.getPendingCheckinsForTeamLead(currentUser.getId())
        );
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('TEAM_LEAD','PERFORMANCE_ADMIN')")
    public ResponseEntity<CheckInResponseDto> approveCheckIn(
            @PathVariable Long id,
            @AuthenticationPrincipal AppUser currentUser) {

        return ResponseEntity.ok(
                checkInService.approveCheckin(id, currentUser.getId())
        );
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('TEAM_LEAD','PERFORMANCE_ADMIN')")
    public ResponseEntity<CheckInResponseDto> rejectCheckIn(
            @PathVariable Long id,
            @RequestBody CheckInReviewDto reviewDto,
            @AuthenticationPrincipal AppUser currentUser) {

        return ResponseEntity.ok(
                checkInService.rejectCheckin(
                        id,
                        reviewDto.getRejectionReason(),
                        currentUser.getId()
                )
        );
    }
}