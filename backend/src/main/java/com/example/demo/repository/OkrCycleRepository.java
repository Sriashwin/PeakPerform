package com.example.demo.repository;

import com.example.demo.entity.OkrCycle;
import com.example.demo.entity.OkrCycle.CycleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface OkrCycleRepository extends JpaRepository<OkrCycle, Long> {

    List<OkrCycle> findByStatus(CycleStatus status);

    Optional<OkrCycle> findFirstByStatus(CycleStatus status);

    boolean existsByStatus(CycleStatus status);

    @Query("SELECT c FROM OkrCycle c ORDER BY c.startDate DESC")
    List<OkrCycle> findAllOrderByStartDateDesc();

    @Query("SELECT c FROM OkrCycle c WHERE c.createdBy.id = :userId ORDER BY c.createdAt DESC")
    List<OkrCycle> findByCreatedByIdOrderByCreatedAtDesc(Long userId);
}