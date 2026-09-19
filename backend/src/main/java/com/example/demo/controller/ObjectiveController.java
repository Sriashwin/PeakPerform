package com.example.demo.controller;

import com.example.demo.dto.ObjectiveRequestDto;
import com.example.demo.dto.ObjectiveResponseDto;
import com.example.demo.entity.AppUser;
import com.example.demo.service.ObjectiveService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/objectives")
@RequiredArgsConstructor
public class ObjectiveController {

    private final ObjectiveService objectiveService;

    @PostMapping
    @PreAuthorize("hasAnyRole('GOAL_OWNER','PERFORMANCE_ADMIN')")
    public ResponseEntity<ObjectiveResponseDto> createObjective(
            @Valid @RequestBody ObjectiveRequestDto requestDto,
            @AuthenticationPrincipal AppUser currentUser) {

        return ResponseEntity.ok(
                objectiveService.createObjective(requestDto, currentUser.getId())
        );
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<ObjectiveResponseDto>> getObjectives(
            @RequestParam(required = false) Long ownerId,
            @RequestParam(required = false) Long cycleId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return ResponseEntity.ok(
                objectiveService.getObjectives(
                        ownerId,
                        cycleId,
                        PageRequest.of(page, size)
                )
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ObjectiveResponseDto> getObjectiveById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                objectiveService.getObjectiveById(id)
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('GOAL_OWNER','PERFORMANCE_ADMIN')")
    public ResponseEntity<ObjectiveResponseDto> updateObjective(
            @PathVariable Long id,
            @Valid @RequestBody ObjectiveRequestDto requestDto,
            @AuthenticationPrincipal AppUser currentUser) {

        return ResponseEntity.ok(
                objectiveService.updateObjective(
                        id,
                        requestDto,
                        currentUser.getId()
                )
        );
    }

    @PutMapping("/{id}/activate")
    @PreAuthorize("hasAnyRole('GOAL_OWNER','PERFORMANCE_ADMIN')")
    public ResponseEntity<ObjectiveResponseDto> activateObjective(
            @PathVariable Long id,
            @AuthenticationPrincipal AppUser currentUser) {

        return ResponseEntity.ok(
                objectiveService.activateObjective(
                        id,
                        currentUser.getId()
                )
        );
    }

    @PutMapping("/{id}/pause")
    @PreAuthorize("hasAnyRole('GOAL_OWNER','PERFORMANCE_ADMIN')")
    public ResponseEntity<ObjectiveResponseDto> pauseObjective(
            @PathVariable Long id,
            @AuthenticationPrincipal AppUser currentUser) {

        return ResponseEntity.ok(
                objectiveService.pauseObjective(
                        id,
                        currentUser.getId()
                )
        );
    }

    @PutMapping("/{id}/resume")
    @PreAuthorize("hasAnyRole('GOAL_OWNER','PERFORMANCE_ADMIN')")
    public ResponseEntity<ObjectiveResponseDto> resumeObjective(
            @PathVariable Long id,
            @AuthenticationPrincipal AppUser currentUser) {

        return ResponseEntity.ok(
                objectiveService.resumeObjective(
                        id,
                        currentUser.getId()
                )
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('GOAL_OWNER','PERFORMANCE_ADMIN')")
    public ResponseEntity<String> deleteObjective(
            @PathVariable Long id,
            @AuthenticationPrincipal AppUser currentUser) {

        objectiveService.deleteObjective(id, currentUser.getId());

        return ResponseEntity.ok("Objective deleted successfully.");
    }
}