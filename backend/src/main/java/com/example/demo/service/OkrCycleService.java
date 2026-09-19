package com.example.demo.service;

import com.example.demo.dto.CycleSummaryStatsDto;
import com.example.demo.dto.OkrCycleRequestDto;
import com.example.demo.dto.OkrCycleResponseDto;
import com.example.demo.entity.AppUser;
import com.example.demo.entity.CheckIn;
import com.example.demo.entity.KeyResult;
import com.example.demo.entity.Objective;
import com.example.demo.entity.OkrCycle;
import com.example.demo.exception.BusinessValidationException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.AppUserRepository;
import com.example.demo.repository.CheckInRepository;
import com.example.demo.repository.KeyResultRepository;
import com.example.demo.repository.ObjectiveRepository;
import com.example.demo.repository.OkrCycleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class OkrCycleService {

    private final OkrCycleRepository okrCycleRepository;
    private final AppUserRepository appUserRepository;
    private final ObjectiveRepository objectiveRepository;
    private final KeyResultRepository keyResultRepository;
    private final CheckInRepository checkInRepository;

    public OkrCycleResponseDto createCycle(
            OkrCycleRequestDto dto,
            Long createdByUserId
    ) {

        if (!dto.getEndDate().isAfter(dto.getStartDate())) {
            throw new BusinessValidationException(
                    "End date must be after start date."
            );
        }

        AppUser creator = appUserRepository.findById(createdByUserId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found")
                );

        OkrCycle cycle = new OkrCycle();

        cycle.setTitle(dto.getTitle());

        cycle.setCycleType(
                OkrCycle.CycleType.valueOf(dto.getCycleType())
        );

        cycle.setStartDate(dto.getStartDate());
        cycle.setEndDate(dto.getEndDate());
        cycle.setStatus(OkrCycle.CycleStatus.DRAFT);
        cycle.setCreatedBy(creator);

        cycle = okrCycleRepository.save(cycle);

        return mapToDto(cycle);
    }

    public OkrCycleResponseDto activateCycle(Long cycleId) {

        OkrCycle cycle = okrCycleRepository.findById(cycleId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Cycle not found")
                );
                
        if (cycle.getStatus() != OkrCycle.CycleStatus.DRAFT) {
            throw new BusinessValidationException(
                    "Only DRAFT cycles can be activated. Current status: "
                            + cycle.getStatus()
            );
        }

        if (okrCycleRepository.existsByStatus(
                OkrCycle.CycleStatus.ACTIVE
        )) {
            throw new BusinessValidationException(
                    "Another OKR cycle is already ACTIVE. "
                            + "Close it before activating a new one."
            );
        }

        if (cycle.getStartDate().isAfter(LocalDate.now())) {
            throw new BusinessValidationException(
                    "Cannot activate a cycle whose start date is in the future."
            );
        }

        cycle.setStatus(OkrCycle.CycleStatus.ACTIVE);

        cycle = okrCycleRepository.save(cycle);

        return mapToDto(cycle);
    }

    @Transactional(rollbackFor = RuntimeException.class)
    public OkrCycleResponseDto closeCycle(Long cycleId) {

        OkrCycle cycle = okrCycleRepository.findById(cycleId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Cycle not found")
                );

        if (cycle.getStatus() != OkrCycle.CycleStatus.ACTIVE) {
            throw new BusinessValidationException(
                    "Only ACTIVE cycles can be closed."
            );
        }

        cycle.setStatus(OkrCycle.CycleStatus.CLOSED);

        objectiveRepository.bulkUpdateStatusByCycleId(
                cycleId,
                Objective.ObjectiveStatus.CANCELLED
        );

        cycle = okrCycleRepository.save(cycle);

        return mapToDto(cycle);
    }

    @Transactional(readOnly = true)
    public CycleSummaryStatsDto getCycleSummaryStats(Long cycleId) {

        OkrCycle cycle = okrCycleRepository.findById(cycleId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Cycle not found")
                );

        /*
         * Count objectives by their individual statuses.
         */
        long activeObjectives =
                objectiveRepository.countByCycleIdAndStatus(
                        cycleId,
                        Objective.ObjectiveStatus.ACTIVE
                );

        long completedObjectives =
                objectiveRepository.countByCycleIdAndStatus(
                        cycleId,
                        Objective.ObjectiveStatus.COMPLETED
                );

        long cancelledObjectives =
                objectiveRepository.countByCycleIdAndStatus(
                        cycleId,
                        Objective.ObjectiveStatus.CANCELLED
                );

        /*
         * Total objectives must include ALL statuses:
         * DRAFT, ACTIVE, PAUSED, COMPLETED and CANCELLED.
         *
         * Previously this was calculated as:
         *
         * active + completed + cancelled
         *
         * which caused DRAFT and PAUSED objectives to disappear
         * from the total.
         */
        long totalObjectives =
                objectiveRepository.countByCycleId(cycleId);

        /*
         * Average progress across all objectives in the cycle.
         */
        Double avg =
                objectiveRepository.averageProgressByCycleId(cycleId);

        double averageProgress =
                (avg == null)
                        ? 0.0
                        : Math.round(avg * 10.0) / 10.0;

        /*
         * Key Result health.
         */
        long onTrackKeyResults =
                keyResultRepository.findByCycleIdAndStatus(
                        cycleId,
                        KeyResult.KeyResultStatus.ON_TRACK
                ).size();

        long atRiskKeyResults =
                keyResultRepository.findByCycleIdAndStatus(
                        cycleId,
                        KeyResult.KeyResultStatus.AT_RISK
                ).size();

        long behindKeyResults =
                keyResultRepository.findByCycleIdAndStatus(
                        cycleId,
                        KeyResult.KeyResultStatus.BEHIND
                ).size();

        /*
         * Pending check-ins.
         */
        long pendingCheckIns =
                checkInRepository.countByReviewStatus(
                        CheckIn.ReviewStatus.PENDING
                );

        /*
         * Build response.
         */
        CycleSummaryStatsDto dto = new CycleSummaryStatsDto();

        dto.setCycleId(cycle.getId());
        dto.setCycleTitle(cycle.getTitle());

        dto.setTotalObjectives(totalObjectives);
        dto.setActiveObjectives(activeObjectives);
        dto.setCompletedObjectives(completedObjectives);
        dto.setCancelledObjectives(cancelledObjectives);

        dto.setAverageProgress(averageProgress);

        dto.setOnTrackKeyResults(onTrackKeyResults);
        dto.setAtRiskKeyResults(atRiskKeyResults);
        dto.setBehindKeyResults(behindKeyResults);

        dto.setPendingCheckIns(pendingCheckIns);

        return dto;
    }

    @Transactional(readOnly = true)
    public List<OkrCycleResponseDto> getAllCycles() {

        return okrCycleRepository.findAllOrderByStartDateDesc()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OkrCycleResponseDto getCycleById(Long id) {

        OkrCycle cycle = okrCycleRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Cycle not found")
                );

        return mapToDto(cycle);
    }

    public OkrCycleResponseDto updateCycle(
            Long id,
            OkrCycleRequestDto dto
    ) {

        OkrCycle cycle = okrCycleRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Cycle not found")
                );

        if (cycle.getStatus() != OkrCycle.CycleStatus.DRAFT) {
            throw new BusinessValidationException(
                    "Only DRAFT cycles can be edited."
            );
        }

        if (!dto.getEndDate().isAfter(dto.getStartDate())) {
            throw new BusinessValidationException(
                    "End date must be after start date."
            );
        }

        cycle.setTitle(dto.getTitle());

        cycle.setCycleType(
                OkrCycle.CycleType.valueOf(dto.getCycleType())
        );

        cycle.setStartDate(dto.getStartDate());
        cycle.setEndDate(dto.getEndDate());

        cycle = okrCycleRepository.save(cycle);

        return mapToDto(cycle);
    }

    public void deleteCycle(Long id) {

        OkrCycle cycle = okrCycleRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Cycle not found")
                );

        if (cycle.getStatus() != OkrCycle.CycleStatus.DRAFT) {
            throw new BusinessValidationException(
                    "Only DRAFT cycles with no objectives can be deleted."
            );
        }

        if (!objectiveRepository.findByCycleId(id).isEmpty()) {
            throw new BusinessValidationException(
                    "Cannot delete a cycle that has objectives. "
                            + "Archive it instead."
            );
        }

        okrCycleRepository.delete(cycle);
    }

    private OkrCycleResponseDto mapToDto(OkrCycle cycle) {

        OkrCycleResponseDto dto = new OkrCycleResponseDto();

        dto.setId(cycle.getId());
        dto.setTitle(cycle.getTitle());

        dto.setCycleType(
                cycle.getCycleType().name()
        );

        dto.setStartDate(cycle.getStartDate());
        dto.setEndDate(cycle.getEndDate());

        dto.setStatus(
                cycle.getStatus().name()
        );

        if (cycle.getCreatedBy() != null) {
            dto.setCreatedById(
                    cycle.getCreatedBy().getId()
            );

            dto.setCreatedByName(
                    cycle.getCreatedBy().getFullName()
            );
        }

        dto.setCreatedAt(
                cycle.getCreatedAt()
        );

        return dto;
    }
}