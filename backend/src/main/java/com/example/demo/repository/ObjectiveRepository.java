package com.example.demo.repository;

import com.example.demo.entity.Objective;
import com.example.demo.entity.Objective.ObjectiveStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ObjectiveRepository extends JpaRepository<Objective, Long> {

    Page<Objective> findByOwnerId(Long ownerId, Pageable pageable);

    Page<Objective> findByCycleId(Long cycleId, Pageable pageable);

    Page<Objective> findByOwnerIdAndCycleId(
            Long ownerId,
            Long cycleId,
            Pageable pageable
    );

    List<Objective> findByCycleId(Long cycleId);

    List<Objective> findByTeamLeadId(Long teamLeadId);

    List<Objective> findByCycleIdAndStatus(
            Long cycleId,
            ObjectiveStatus status
    );

    @Query("""
        SELECT o
        FROM Objective o
        WHERE o.cycle.id = :cycleId
          AND o.owner.department = :department
        """)
    List<Objective> findByCycleIdAndOwnerDepartment(
            @Param("cycleId") Long cycleId,
            @Param("department") String department
    );

    @Modifying
    @Query("""
        UPDATE Objective o
        SET o.status = :status
        WHERE o.cycle.id = :cycleId
          AND o.status NOT IN ('COMPLETED', 'CANCELLED')
        """)
    int bulkUpdateStatusByCycleId(
            @Param("cycleId") Long cycleId,
            @Param("status") ObjectiveStatus status
    );

    @Query("""
        SELECT COUNT(o)
        FROM Objective o
        WHERE o.cycle.id = :cycleId
        """)
    long countByCycleId(
            @Param("cycleId") Long cycleId
    );

    @Query("""
        SELECT COUNT(o)
        FROM Objective o
        WHERE o.cycle.id = :cycleId
          AND o.status = :status
        """)
    long countByCycleIdAndStatus(
            @Param("cycleId") Long cycleId,
            @Param("status") ObjectiveStatus status
    );

    @Query("""
        SELECT AVG(o.progressPercent)
        FROM Objective o
        WHERE o.cycle.id = :cycleId
        """)
    Double averageProgressByCycleId(
            @Param("cycleId") Long cycleId
    );
}