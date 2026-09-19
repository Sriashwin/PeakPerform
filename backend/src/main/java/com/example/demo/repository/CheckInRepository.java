package com.example.demo.repository;

import com.example.demo.entity.CheckIn;
import com.example.demo.entity.CheckIn.ReviewStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CheckInRepository extends JpaRepository<CheckIn, Long> {

    Page<CheckIn> findByKeyResultId(Long keyResultId, Pageable pageable);

    List<CheckIn> findByKeyResultIdAndReviewStatus(
            Long keyResultId,
            ReviewStatus reviewStatus);

    @Query("""
        SELECT c
        FROM CheckIn c
        WHERE c.submittedBy.id = :userId
        ORDER BY c.submittedAt DESC
        """)
    Page<CheckIn> findBySubmittedByIdOrderBySubmittedAtDesc(
            @Param("userId") Long userId,
            Pageable pageable);

    List<CheckIn> findByKeyResultObjectiveTeamLeadIdAndReviewStatusOrderBySubmittedAtAsc(
            Long teamLeadId,
            ReviewStatus reviewStatus);

    List<CheckIn> findByReviewStatusOrderBySubmittedAtAsc(
            ReviewStatus reviewStatus);

    @Query("""
        SELECT COUNT(c)
        FROM CheckIn c
        WHERE c.reviewStatus = :status
        """)
    long countByReviewStatus(@Param("status") ReviewStatus status);

    boolean existsByKeyResultIdAndReviewStatusAndSubmittedById(
            Long keyResultId,
            ReviewStatus reviewStatus,
            Long userId);
}