package com.example.demo.service;

import com.example.demo.dto.CheckInRequestDto;
import com.example.demo.dto.CheckInResponseDto;
import com.example.demo.entity.AppUser;
import com.example.demo.entity.CheckIn;
import com.example.demo.entity.KeyResult;
import com.example.demo.entity.Objective;
import com.example.demo.exception.BusinessValidationException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.AppUserRepository;
import com.example.demo.repository.CheckInRepository;
import com.example.demo.repository.KeyResultRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CheckInService {

    private final CheckInRepository checkInRepository;
    private final KeyResultRepository keyResultRepository;
    private final AppUserRepository appUserRepository;
    private final ObjectiveService objectiveService;

    public CheckInResponseDto submitCheckin(CheckInRequestDto dto, Long submittedByUserId) {

        KeyResult keyResult = keyResultRepository.findById(dto.getKeyResultId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Key Result not found"));

        if (keyResult.getStatus() == KeyResult.KeyResultStatus.COMPLETED) {
            throw new BusinessValidationException(
                    "Cannot submit a check-in for a COMPLETED Key Result.");
        }

        if (keyResult.getObjective().getStatus() != Objective.ObjectiveStatus.ACTIVE) {
            throw new BusinessValidationException(
                    "Check-ins can only be submitted for ACTIVE objectives.");
        }

        if (checkInRepository.existsByKeyResultIdAndReviewStatusAndSubmittedById(
                keyResult.getId(),
                CheckIn.ReviewStatus.PENDING,
                submittedByUserId)) {

            throw new BusinessValidationException(
                    "You already have a pending check-in for this Key Result. Wait for it to be reviewed.");
        }

        AppUser submittedBy = appUserRepository.findById(submittedByUserId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        CheckIn checkIn = new CheckIn();
        checkIn.setKeyResult(keyResult);
        checkIn.setReportedValue(dto.getReportedValue());
        checkIn.setConfidenceLevel(dto.getConfidenceLevel());
        checkIn.setNotes(dto.getNotes());
        checkIn.setSubmittedBy(submittedBy);
        checkIn.setReviewStatus(CheckIn.ReviewStatus.PENDING);

        checkIn = checkInRepository.save(checkIn);

        return toDto(checkIn);
    }
        @Transactional(rollbackFor = RuntimeException.class)
    public CheckInResponseDto approveCheckin(Long checkInId, Long reviewerUserId) {

        CheckIn checkIn = checkInRepository.findById(checkInId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Check-in not found"));

        if (checkIn.getReviewStatus() != CheckIn.ReviewStatus.PENDING) {
            throw new BusinessValidationException(
                    "Only PENDING check-ins can be approved.");
        }

        AppUser reviewer = appUserRepository.findById(reviewerUserId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        if (reviewer.getRole() != AppUser.Role.ROLE_TEAM_LEAD &&
                reviewer.getRole() != AppUser.Role.ROLE_PERFORMANCE_ADMIN) {

            throw new BusinessValidationException(
                    "Only a TEAM_LEAD or PERFORMANCE_ADMIN can approve check-ins.");
        }

        checkIn.setReviewStatus(CheckIn.ReviewStatus.APPROVED);
        checkIn.setReviewedBy(reviewer);
        checkIn.setReviewedAt(LocalDateTime.now());

        checkInRepository.save(checkIn);

        KeyResult keyResult = checkIn.getKeyResult();
        keyResult.setCurrentValue(checkIn.getReportedValue());

        updateKeyResultStatus(keyResult);

        keyResultRepository.save(keyResult);

        objectiveService.computeObjectiveProgress(
                keyResult.getObjective().getId());

        return toDto(checkIn);
    }

    public CheckInResponseDto rejectCheckin(Long checkInId,
                                            String rejectionReason,
                                            Long reviewerUserId) {

        CheckIn checkIn = checkInRepository.findById(checkInId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Check-in not found"));

        if (checkIn.getReviewStatus() != CheckIn.ReviewStatus.PENDING) {
            throw new BusinessValidationException(
                    "Only PENDING check-ins can be rejected.");
        }

        if (rejectionReason == null || rejectionReason.trim().isEmpty()) {
            throw new BusinessValidationException(
                    "Rejection reason is required.");
        }

        AppUser reviewer = appUserRepository.findById(reviewerUserId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        checkIn.setReviewStatus(CheckIn.ReviewStatus.REJECTED);
        checkIn.setReviewedBy(reviewer);
        checkIn.setReviewedAt(LocalDateTime.now());
        checkIn.setRejectionReason(rejectionReason);

        checkIn = checkInRepository.save(checkIn);

        return toDto(checkIn);
    }
        public Page<CheckInResponseDto> getCheckInsByKeyResult(Long keyResultId,
                                                           Pageable pageable) {

        return checkInRepository
                .findByKeyResultId(keyResultId, pageable)
                .map(this::toDto);
    }

    public Page<CheckInResponseDto> getMyCheckins(Long userId,
                                                  Pageable pageable) {

        return checkInRepository
                .findBySubmittedByIdOrderBySubmittedAtDesc(userId, pageable)
                .map(this::toDto);
    }

    public List<CheckInResponseDto> getPendingCheckinsForTeamLead(Long userId) {

        AppUser user = appUserRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        System.out.println("========================================");
        System.out.println("Pending check-ins requested by user ID: " + userId);
        System.out.println("User name: " + user.getFullName());
        System.out.println("User email: " + user.getEmail());
        System.out.println("User role: " + user.getRole());

        List<CheckIn> checkIns;

        if (user.getRole() == AppUser.Role.ROLE_PERFORMANCE_ADMIN) {

            checkIns = checkInRepository
                    .findByReviewStatusOrderBySubmittedAtAsc(
                            CheckIn.ReviewStatus.PENDING);

        } else {

            checkIns = checkInRepository
                    .findByKeyResultObjectiveTeamLeadIdAndReviewStatusOrderBySubmittedAtAsc(
                            userId,
                            CheckIn.ReviewStatus.PENDING);
        }

        System.out.println("Pending check-ins found: " + checkIns.size());

        for (CheckIn checkIn : checkIns) {

            System.out.println(
                    "Check-in ID: " + checkIn.getId()
                            + " | Objective ID: "
                            + checkIn.getKeyResult().getObjective().getId()
                            + " | Objective Team Lead ID: "
                            + checkIn.getKeyResult()
                                .getObjective()
                                .getTeamLead()
                                .getId()
                            + " | Status: "
                            + checkIn.getReviewStatus()
            );
        }

        System.out.println("========================================");

        return checkIns.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
        private void updateKeyResultStatus(KeyResult keyResult) {

        double completion;

        if (keyResult.getMetricType() == KeyResult.MetricType.BOOLEAN) {

            completion = keyResult.getCurrentValue() >= 1.0 ? 100.0 : 0.0;

        } else {

            if (keyResult.getTargetValue() == 0) {
                completion = 0.0;
            } else {
                completion = Math.min(
                        (keyResult.getCurrentValue() / keyResult.getTargetValue()) * 100.0,
                        100.0
                );
            }
        }

        if (completion >= 100.0) {
            keyResult.setStatus(KeyResult.KeyResultStatus.COMPLETED);
        } else if (completion >= 60.0) {
            keyResult.setStatus(KeyResult.KeyResultStatus.ON_TRACK);
        } else if (completion >= 30.0) {
            keyResult.setStatus(KeyResult.KeyResultStatus.AT_RISK);
        } else {
            keyResult.setStatus(KeyResult.KeyResultStatus.BEHIND);
        }
    }

    private CheckInResponseDto toDto(CheckIn checkIn) {

        CheckInResponseDto dto = new CheckInResponseDto();

        dto.setId(checkIn.getId());

        dto.setKeyResultId(checkIn.getKeyResult().getId());
        dto.setKeyResultTitle(checkIn.getKeyResult().getTitle());

        dto.setReportedValue(checkIn.getReportedValue());
        dto.setConfidenceLevel(checkIn.getConfidenceLevel());
        dto.setNotes(checkIn.getNotes());

        dto.setSubmittedById(checkIn.getSubmittedBy().getId());
        dto.setSubmittedByName(checkIn.getSubmittedBy().getFullName());
        dto.setSubmittedAt(checkIn.getSubmittedAt());

        dto.setReviewStatus(checkIn.getReviewStatus().name());

        if (checkIn.getReviewedBy() != null) {
            dto.setReviewedById(checkIn.getReviewedBy().getId());
            dto.setReviewedByName(checkIn.getReviewedBy().getFullName());
        }

        dto.setReviewedAt(checkIn.getReviewedAt());
        dto.setRejectionReason(checkIn.getRejectionReason());

        return dto;
    }
}