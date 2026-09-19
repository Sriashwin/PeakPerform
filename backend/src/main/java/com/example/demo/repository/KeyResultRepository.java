package com.example.demo.repository;

import com.example.demo.entity.KeyResult;
import com.example.demo.entity.KeyResult.KeyResultStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface KeyResultRepository extends JpaRepository<KeyResult, Long> {

    List<KeyResult> findByObjectiveId(Long objectiveId);

    List<KeyResult> findByObjectiveIdAndStatus(Long objectiveId, KeyResultStatus status);

    @Query("""
        SELECT kr
        FROM KeyResult kr
        WHERE kr.objective.id = :objectiveId
          AND kr.status <> :status
        """)
    List<KeyResult> findIncompleteByObjectiveId(
            @Param("objectiveId") Long objectiveId,
            @Param("status") KeyResultStatus status);

    @Query("""
        SELECT COUNT(kr)
        FROM KeyResult kr
        WHERE kr.objective.id = :objectiveId
          AND kr.status = :status
        """)
    long countByObjectiveIdAndStatus(
            @Param("objectiveId") Long objectiveId,
            @Param("status") KeyResultStatus status);

    @Query("""
        SELECT kr
        FROM KeyResult kr
        WHERE kr.objective.cycle.id = :cycleId
          AND kr.status = :status
        """)
    List<KeyResult> findByCycleIdAndStatus(
            @Param("cycleId") Long cycleId,
            @Param("status") KeyResultStatus status);
}