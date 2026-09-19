package com.example.demo.controller;

import com.example.demo.dto.KeyResultRequestDto;
import com.example.demo.dto.KeyResultResponseDto;
import com.example.demo.entity.AppUser;
import com.example.demo.service.KeyResultService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/key-results")
@RequiredArgsConstructor
public class KeyResultController {

    private final KeyResultService keyResultService;

    @PostMapping
    @PreAuthorize("hasAnyRole('GOAL_OWNER','PERFORMANCE_ADMIN')")
    public ResponseEntity<KeyResultResponseDto> createKeyResult(
            @Valid @RequestBody KeyResultRequestDto requestDto,
            @AuthenticationPrincipal AppUser currentUser) {

        return ResponseEntity.ok(
                keyResultService.createKeyResult(requestDto)
        );
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<KeyResultResponseDto>> getKeyResults(
            @RequestParam Long objectiveId) {

        return ResponseEntity.ok(
                keyResultService.getKeyResultsByObjective(objectiveId)
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<KeyResultResponseDto> getKeyResultById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                keyResultService.getKeyResultById(id)
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('GOAL_OWNER','PERFORMANCE_ADMIN')")
    public ResponseEntity<KeyResultResponseDto> updateKeyResult(
            @PathVariable Long id,
            @Valid @RequestBody KeyResultRequestDto requestDto) {

        return ResponseEntity.ok(
                keyResultService.updateKeyResult(id, requestDto)
        );
    }

    @PatchMapping("/{id}/value")
    @PreAuthorize("hasAnyRole('GOAL_OWNER','PERFORMANCE_ADMIN')")
    public ResponseEntity<KeyResultResponseDto> updateValue(
            @PathVariable Long id,
            @RequestBody Map<String, Object> updates) {

        Double currentValue = updates.get("currentValue") == null
                ? null
                : Double.valueOf(updates.get("currentValue").toString());

        String status = updates.get("status") == null
                ? null
                : updates.get("status").toString();

        return ResponseEntity.ok(
                keyResultService.updateCurrentValue(id, currentValue, status)
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('GOAL_OWNER','PERFORMANCE_ADMIN')")
    public ResponseEntity<String> deleteKeyResult(
            @PathVariable Long id) {

        keyResultService.deleteKeyResult(id);

        return ResponseEntity.ok("Key Result deleted successfully.");
    }
}