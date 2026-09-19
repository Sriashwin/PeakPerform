package com.example.demo.service;

import com.example.demo.dto.ObjectiveRequestDto;
import com.example.demo.dto.ObjectiveResponseDto;
import com.example.demo.entity.AppUser;
import com.example.demo.entity.KeyResult;
import com.example.demo.entity.Objective;
import com.example.demo.entity.OkrCycle;
import com.example.demo.exception.BusinessValidationException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.AppUserRepository;
import com.example.demo.repository.KeyResultRepository;
import com.example.demo.repository.ObjectiveRepository;
import com.example.demo.repository.OkrCycleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ObjectiveService {

    private final ObjectiveRepository objectiveRepository;
    private final AppUserRepository appUserRepository;
    private final OkrCycleRepository okrCycleRepository;
    private final KeyResultRepository keyResultRepository;

    public ObjectiveResponseDto createObjective(ObjectiveRequestDto dto,
                                                Long requesterId) {

        AppUser requester = appUserRepository.findById(requesterId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found."));

        Long targetOwnerId;

        if (requester.getRole() == AppUser.Role.ROLE_PERFORMANCE_ADMIN
                && dto.getOwnerId() != null) {

            targetOwnerId = dto.getOwnerId();

        } else {

            targetOwnerId = requesterId;
        }

        AppUser owner = appUserRepository.findById(targetOwnerId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Owner not found."));

        OkrCycle cycle = okrCycleRepository.findById(dto.getCycleId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("OKR Cycle not found."));

        if (cycle.getStatus() == OkrCycle.CycleStatus.CLOSED) {
            throw new BusinessValidationException(
                    "Cannot create objectives in a CLOSED OKR cycle.");
        }

        AppUser teamLead = null;

        if (dto.getTeamLeadId() != null) {

            teamLead = appUserRepository.findById(dto.getTeamLeadId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException("Team Lead not found."));

            if (teamLead.getRole() != AppUser.Role.ROLE_TEAM_LEAD) {
                throw new BusinessValidationException(
                        "Assigned reviewer must have ROLE_TEAM_LEAD.");
            }
        }

        Objective objective = new Objective();

        objective.setTitle(dto.getTitle());
        objective.setDescription(dto.getDescription());
        objective.setOwner(owner);
        objective.setCycle(cycle);
        objective.setTeamLead(teamLead);

        objective.setStatus(Objective.ObjectiveStatus.DRAFT);
        objective.setProgressPercent(0.0);

        objective = objectiveRepository.save(objective);

        return toDto(objective);
    }
        public ObjectiveResponseDto activateObjective(Long objectiveId,
                                                  Long requesterId) {

        Objective objective = objectiveRepository.findById(objectiveId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Objective not found."));

        validateOwnershipOrAdmin(objective, requesterId);

        if (objective.getStatus() != Objective.ObjectiveStatus.DRAFT) {
            throw new BusinessValidationException(
                    "Only DRAFT objectives can be activated.");
        }

        List<KeyResult> keyResults =
                keyResultRepository.findByObjectiveId(objectiveId);

        if (keyResults.isEmpty()) {
            throw new BusinessValidationException(
                    "Cannot activate an objective with no Key Results. Add at least one Key Result first.");
        }

        objective.setStatus(Objective.ObjectiveStatus.ACTIVE);

        objective = objectiveRepository.save(objective);

        return toDto(objective);
    }

    public ObjectiveResponseDto pauseObjective(Long objectiveId,
                                               Long requesterId) {

        Objective objective = objectiveRepository.findById(objectiveId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Objective not found."));

        validateOwnershipOrAdmin(objective, requesterId);

        if (objective.getStatus() != Objective.ObjectiveStatus.ACTIVE) {
            throw new BusinessValidationException(
                    "Only ACTIVE objectives can be paused.");
        }

        objective.setStatus(Objective.ObjectiveStatus.PAUSED);

        objective = objectiveRepository.save(objective);

        return toDto(objective);
    }

    public ObjectiveResponseDto resumeObjective(Long objectiveId,
                                                Long requesterId) {

        Objective objective = objectiveRepository.findById(objectiveId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Objective not found."));

        validateOwnershipOrAdmin(objective, requesterId);

        if (objective.getStatus() != Objective.ObjectiveStatus.PAUSED) {
            throw new BusinessValidationException(
                    "Only PAUSED objectives can be resumed.");
        }

        objective.setStatus(Objective.ObjectiveStatus.ACTIVE);

        objective = objectiveRepository.save(objective);

        return toDto(objective);
    }
        @Transactional(rollbackFor = RuntimeException.class)
    public void computeObjectiveProgress(Long objectiveId) {

        Objective objective = objectiveRepository.findById(objectiveId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Objective not found."));

        List<KeyResult> keyResults =
                keyResultRepository.findByObjectiveId(objectiveId);

        if (keyResults.isEmpty()) {
            return;
        }

        double totalCompletion = 0.0;
        boolean allCompleted = true;

        for (KeyResult kr : keyResults) {

            double completion;

            if (kr.getMetricType() == KeyResult.MetricType.BOOLEAN) {

                completion = kr.getCurrentValue() >= 1.0
                        ? 100.0
                        : 0.0;

            } else {

                completion = Math.min(
                        (kr.getCurrentValue() / kr.getTargetValue()) * 100.0,
                        100.0);
            }

            totalCompletion += completion;

            if (kr.getStatus() != KeyResult.KeyResultStatus.COMPLETED) {
                allCompleted = false;
            }
        }

        double newProgress =
                Math.round((totalCompletion / keyResults.size()) * 10.0) / 10.0;

        objective.setProgressPercent(newProgress);

        if (allCompleted
                && objective.getStatus() == Objective.ObjectiveStatus.ACTIVE) {

            objective.setStatus(Objective.ObjectiveStatus.COMPLETED);
        }

        objectiveRepository.save(objective);
    }
        @Transactional(readOnly = true)
    public Page<ObjectiveResponseDto> getObjectives(Long ownerId,
                                                    Long cycleId,
                                                    Pageable pageable) {

        Page<Objective> objectives;

        if (ownerId != null && cycleId != null) {

            objectives = objectiveRepository.findByOwnerIdAndCycleId(
                    ownerId,
                    cycleId,
                    pageable);

        } else if (ownerId != null) {

            objectives = objectiveRepository.findByOwnerId(
                    ownerId,
                    pageable);

        } else if (cycleId != null) {

            objectives = objectiveRepository.findByCycleId(
                    cycleId,
                    pageable);

        } else {

            objectives = objectiveRepository.findAll(pageable);
        }

        return objectives.map(this::toDto);
    }

    @Transactional(readOnly = true)
    public ObjectiveResponseDto getObjectiveById(Long id) {

        Objective objective = objectiveRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Objective not found."));

        return toDto(objective);
    }
        public ObjectiveResponseDto updateObjective(Long id,
                                                ObjectiveRequestDto dto,
                                                Long requesterId) {

        Objective objective = objectiveRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Objective not found."));

        validateOwnershipOrAdmin(objective, requesterId);

        if (objective.getStatus() == Objective.ObjectiveStatus.COMPLETED
                || objective.getStatus() == Objective.ObjectiveStatus.CANCELLED) {

            throw new BusinessValidationException(
                    "Cannot edit a " + objective.getStatus() + " objective.");
        }

        objective.setTitle(dto.getTitle());
        objective.setDescription(dto.getDescription());

        if (dto.getTeamLeadId() != null) {

            AppUser teamLead = appUserRepository.findById(dto.getTeamLeadId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException("Team Lead not found."));

            if (teamLead.getRole() != AppUser.Role.ROLE_TEAM_LEAD) {
                throw new BusinessValidationException(
                        "Assigned reviewer must have ROLE_TEAM_LEAD.");
            }

            objective.setTeamLead(teamLead);
        } else {
            objective.setTeamLead(null);
        }

        objective = objectiveRepository.save(objective);

        return toDto(objective);
    }

    public void deleteObjective(Long id,
                                Long requesterId) {

        Objective objective = objectiveRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Objective not found."));

        validateOwnershipOrAdmin(objective, requesterId);

        if (objective.getStatus() != Objective.ObjectiveStatus.DRAFT) {
            throw new BusinessValidationException(
                    "Only DRAFT objectives can be deleted.");
        }

        objectiveRepository.delete(objective);
    }
        private void validateOwnershipOrAdmin(Objective objective,
                                          Long requesterId) {

        AppUser requester = appUserRepository.findById(requesterId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found."));

        if (requester.getRole() == AppUser.Role.ROLE_PERFORMANCE_ADMIN) {
            return;
        }

        if (!objective.getOwner().getId().equals(requesterId)) {
            throw new BusinessValidationException(
                    "You can only manage your own objectives.");
        }
    }

    private ObjectiveResponseDto toDto(Objective objective) {

        ObjectiveResponseDto dto = new ObjectiveResponseDto();

        dto.setId(objective.getId());

        dto.setTitle(objective.getTitle());
        dto.setDescription(objective.getDescription());

        dto.setOwnerId(objective.getOwner().getId());
        dto.setOwnerName(objective.getOwner().getFullName());

        dto.setCycleId(objective.getCycle().getId());
        dto.setCycleTitle(objective.getCycle().getTitle());

        if (objective.getTeamLead() != null) {
            dto.setTeamLeadId(objective.getTeamLead().getId());
            dto.setTeamLeadName(objective.getTeamLead().getFullName());
        }

        dto.setStatus(objective.getStatus().name());

        dto.setProgressPercent(objective.getProgressPercent());

        dto.setCreatedAt(objective.getCreatedAt());

        return dto;
    }

}