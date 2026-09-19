package com.example.demo.service;

import com.example.demo.dto.KeyResultRequestDto;
import com.example.demo.dto.KeyResultResponseDto;
import com.example.demo.entity.KeyResult;
import com.example.demo.entity.Objective;
import com.example.demo.exception.BusinessValidationException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.KeyResultRepository;
import com.example.demo.repository.ObjectiveRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class KeyResultService {

    private final KeyResultRepository keyResultRepository;
    private final ObjectiveRepository objectiveRepository;
    private final ObjectiveService objectiveService;

    public KeyResultResponseDto createKeyResult(KeyResultRequestDto dto) {

        Objective objective = objectiveRepository.findById(dto.getObjectiveId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Objective not found."));

        if (objective.getStatus() == Objective.ObjectiveStatus.COMPLETED
                || objective.getStatus() == Objective.ObjectiveStatus.CANCELLED) {

            throw new BusinessValidationException(
                    "Cannot add Key Results to a "
                            + objective.getStatus()
                            + " objective.");
        }

        KeyResult keyResult = new KeyResult();

        keyResult.setTitle(dto.getTitle());
        keyResult.setObjective(objective);
        keyResult.setMetricType(KeyResult.MetricType.valueOf(dto.getMetricType()));

        if (keyResult.getMetricType() == KeyResult.MetricType.BOOLEAN) {

            keyResult.setTargetValue(1.0);
            keyResult.setCurrentValue(0.0);

        } else {

            keyResult.setTargetValue(dto.getTargetValue());
            keyResult.setCurrentValue(
                    dto.getCurrentValue() == null
                            ? 0.0
                            : dto.getCurrentValue());
        }

        keyResult.setUnit(dto.getUnit());
        keyResult.setDueDate(dto.getDueDate());
        keyResult.setStatus(KeyResult.KeyResultStatus.ON_TRACK);

        keyResult = keyResultRepository.save(keyResult);

        return toDto(keyResult);
    }
        @Transactional(rollbackFor = RuntimeException.class)
    public KeyResultResponseDto updateCurrentValue(Long keyResultId,
                                                   Double newValue,
                                                   String newStatus) {

        KeyResult keyResult = keyResultRepository.findById(keyResultId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Key Result not found."));

        if (keyResult.getStatus() == KeyResult.KeyResultStatus.COMPLETED) {
            throw new BusinessValidationException(
                    "Cannot update value of a COMPLETED Key Result.");
        }

        if (newValue < 0) {
            throw new BusinessValidationException(
                    "Current value cannot be negative.");
        }

        if (keyResult.getMetricType() == KeyResult.MetricType.BOOLEAN
                && newValue > 1.0) {

            throw new BusinessValidationException(
                    "BOOLEAN key results accept only 0 or 1.");
        }

        keyResult.setCurrentValue(newValue);

        if (newStatus != null && !newStatus.isBlank()) {

            keyResult.setStatus(
                    KeyResult.KeyResultStatus.valueOf(newStatus));

        } else {

            double completion;

            if (keyResult.getMetricType() == KeyResult.MetricType.BOOLEAN) {

                completion = newValue >= 1.0 ? 100.0 : 0.0;

            } else {

                completion = Math.min(
                        (newValue / keyResult.getTargetValue()) * 100.0,
                        100.0);
            }

            if (completion >= 100.0) {

                keyResult.setStatus(
                        KeyResult.KeyResultStatus.COMPLETED);

            } else if (completion >= 60.0) {

                keyResult.setStatus(
                        KeyResult.KeyResultStatus.ON_TRACK);

            } else if (completion >= 30.0) {

                keyResult.setStatus(
                        KeyResult.KeyResultStatus.AT_RISK);

            } else {

                keyResult.setStatus(
                        KeyResult.KeyResultStatus.BEHIND);
            }
        }

        keyResult = keyResultRepository.save(keyResult);

        objectiveService.computeObjectiveProgress(
                keyResult.getObjective().getId());

        return toDto(keyResult);
    }
        @Transactional(readOnly = true)
    public List<KeyResultResponseDto> getKeyResultsByObjective(Long objectiveId) {

        objectiveRepository.findById(objectiveId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Objective not found."));

        return keyResultRepository.findByObjectiveId(objectiveId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public KeyResultResponseDto getKeyResultById(Long id) {

        KeyResult keyResult = keyResultRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Key Result not found."));

        return toDto(keyResult);
    }

    public KeyResultResponseDto updateKeyResult(Long id,
                                                KeyResultRequestDto dto) {

        KeyResult keyResult = keyResultRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Key Result not found."));

        if (keyResult.getStatus() == KeyResult.KeyResultStatus.COMPLETED) {

            throw new BusinessValidationException(
                    "Cannot edit a COMPLETED Key Result.");
        }

        if (dto.getTargetValue() < keyResult.getCurrentValue()) {

            throw new BusinessValidationException(
                    String.format(
                            "Target value cannot be less than the current value (%.2f).",
                            keyResult.getCurrentValue()));
        }

        keyResult.setTitle(dto.getTitle());
        keyResult.setTargetValue(dto.getTargetValue());
        keyResult.setUnit(dto.getUnit());
        keyResult.setDueDate(dto.getDueDate());

        keyResult = keyResultRepository.save(keyResult);

        return toDto(keyResult);
    }
        public void deleteKeyResult(Long id) {

        KeyResult keyResult = keyResultRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Key Result not found."));

        if (keyResult.getStatus() == KeyResult.KeyResultStatus.COMPLETED) {
            throw new BusinessValidationException(
                    "Cannot delete a COMPLETED Key Result.");
        }

        keyResultRepository.delete(keyResult);
    }

    private KeyResultResponseDto toDto(KeyResult kr) {

        KeyResultResponseDto dto = new KeyResultResponseDto();

        dto.setId(kr.getId());
        dto.setTitle(kr.getTitle());

        dto.setObjectiveId(kr.getObjective().getId());
        dto.setObjectiveTitle(kr.getObjective().getTitle());

        dto.setMetricType(kr.getMetricType().name());

        dto.setTargetValue(kr.getTargetValue());
        dto.setCurrentValue(kr.getCurrentValue());

        dto.setUnit(kr.getUnit());

        dto.setStatus(kr.getStatus().name());

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

        completion = Math.round(completion * 10.0) / 10.0;

        dto.setCompletionPercent(completion);

        dto.setDueDate(kr.getDueDate());

        return dto;
    }
}