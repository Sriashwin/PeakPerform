package com.example.demo.controller;

import com.example.demo.dto.ProgressSnapshotResponseDto;
import com.example.demo.entity.AppUser;
import com.example.demo.service.ProgressSnapshotService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/snapshots")
@RequiredArgsConstructor
public class ProgressSnapshotController {

    private final ProgressSnapshotService progressSnapshotService;

    @PostMapping("/{objectiveId}")
    @PreAuthorize("hasAnyRole('GOAL_OWNER','PERFORMANCE_ADMIN','TEAM_LEAD')")
    public ResponseEntity<ProgressSnapshotResponseDto> createSnapshot(
            @PathVariable Long objectiveId,
            @AuthenticationPrincipal AppUser currentUser) {

        return ResponseEntity.ok(
                progressSnapshotService.captureSnapshot(
                        objectiveId,
                        currentUser.getId()
                )
        );
    }

    @GetMapping("/{objectiveId}/trend")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ProgressSnapshotResponseDto>> getTrend(
            @PathVariable Long objectiveId,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate from,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate to) {

        return ResponseEntity.ok(
                progressSnapshotService.getProgressTrend(
                        objectiveId,
                        from,
                        to
                )
        );
    }

    @GetMapping("/{objectiveId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ProgressSnapshotResponseDto>> getSnapshots(
            @PathVariable Long objectiveId) {

        return ResponseEntity.ok(
                progressSnapshotService.getAllSnapshotsForObjective(
                        objectiveId
                )
        );
    }
}