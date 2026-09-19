package com.example.demo.service;

import com.example.demo.dto.ProgressSnapshotResponseDto;
import com.example.demo.entity.Objective;
import com.example.demo.entity.ProgressSnapshot;
import com.example.demo.exception.BusinessValidationException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.ObjectiveRepository;
import com.example.demo.repository.ProgressSnapshotRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@Transactional
public class ProgressSnapshotService {


    private final ProgressSnapshotRepository progressSnapshotRepository;
    private final ObjectiveRepository objectiveRepository;


    public ProgressSnapshotResponseDto captureSnapshot(
            Long objectiveId,
            Long capturedByUserId) {


        Objective objective =
                objectiveRepository.findById(objectiveId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Objective not found"));


        LocalDate today = LocalDate.now();


        if(progressSnapshotRepository
                .existsByObjectiveIdAndSnapshotDate(
                        objectiveId,
                        today)) {

            throw new BusinessValidationException(
                    "A progress snapshot for this objective already exists for today ("
                    + today + ").");
        }


        ProgressSnapshot snapshot =
                new ProgressSnapshot();


        snapshot.setObjective(objective);

        snapshot.setSnapshotDate(today);

        snapshot.setProgressPercent(
                objective.getProgressPercent()
        );


        ProgressSnapshot saved =
                progressSnapshotRepository.save(snapshot);


        return toDto(saved);
    }



    @Transactional(readOnly = true)
    public List<ProgressSnapshotResponseDto> getProgressTrend(
            Long objectiveId,
            LocalDate from,
            LocalDate to) {


        objectiveRepository.findById(objectiveId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Objective not found"));


        if(from != null && to != null && to.isBefore(from)) {

            throw new BusinessValidationException(
                    "'to' date must not be before 'from' date.");
        }


        List<ProgressSnapshot> snapshots;


        if(from != null && to != null) {

            snapshots =
                    progressSnapshotRepository
                    .findByObjectiveIdAndDateRange(
                            objectiveId,
                            from,
                            to);

        } else {

            snapshots =
                    progressSnapshotRepository
                    .findByObjectiveIdOrderBySnapshotDateAsc(
                            objectiveId);
        }


        return snapshots.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }



    @Transactional(readOnly = true)
    public List<ProgressSnapshotResponseDto>
    getAllSnapshotsForObjective(Long objectiveId) {


        return progressSnapshotRepository
                .findByObjectiveIdOrderBySnapshotDateAsc(objectiveId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }



    private ProgressSnapshotResponseDto toDto(
            ProgressSnapshot snapshot) {


        ProgressSnapshotResponseDto dto =
                new ProgressSnapshotResponseDto();


        dto.setId(snapshot.getId());


        dto.setObjectiveId(
                snapshot.getObjective().getId()
        );


        dto.setObjectiveTitle(
                snapshot.getObjective().getTitle()
        );


        dto.setSnapshotDate(
                snapshot.getSnapshotDate()
        );


        dto.setProgressPercent(
                snapshot.getProgressPercent()
        );


        return dto;
    }
}