package com.example.demo.repository;

import com.example.demo.entity.ProgressSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ProgressSnapshotRepository extends JpaRepository<ProgressSnapshot, Long> {

    List<ProgressSnapshot> findByObjectiveIdOrderBySnapshotDateAsc(Long objectiveId);

    @Query("""
        SELECT ps
        FROM ProgressSnapshot ps
        WHERE ps.objective.id = :objectiveId
          AND ps.snapshotDate BETWEEN :from AND :to
        ORDER BY ps.snapshotDate ASC
        """)
    List<ProgressSnapshot> findByObjectiveIdAndDateRange(
            @Param("objectiveId") Long objectiveId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);

    boolean existsByObjectiveIdAndSnapshotDate(
            Long objectiveId,
            LocalDate snapshotDate);

    @Query("""
        SELECT ps
        FROM ProgressSnapshot ps
        WHERE ps.objective.cycle.id = :cycleId
        ORDER BY ps.snapshotDate DESC
        """)
    List<ProgressSnapshot> findByCycleIdOrderByDateDesc(
            @Param("cycleId") Long cycleId);
}