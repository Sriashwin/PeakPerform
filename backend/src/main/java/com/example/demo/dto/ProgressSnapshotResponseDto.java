package com.example.demo.dto;

import java.time.LocalDate;

public class ProgressSnapshotResponseDto {

    private Long id;
    private Long objectiveId;
    private String objectiveTitle;
    private LocalDate snapshotDate;
    private Double progressPercent;
    private Long completedKeyResults;
    private Long totalKeyResults;
    private String objectiveStatus;

    public ProgressSnapshotResponseDto() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getObjectiveId() {
        return objectiveId;
    }

    public void setObjectiveId(Long objectiveId) {
        this.objectiveId = objectiveId;
    }

    public String getObjectiveTitle() {
        return objectiveTitle;
    }

    public void setObjectiveTitle(String objectiveTitle) {
        this.objectiveTitle = objectiveTitle;
    }

    public LocalDate getSnapshotDate() {
        return snapshotDate;
    }

    public void setSnapshotDate(LocalDate snapshotDate) {
        this.snapshotDate = snapshotDate;
    }

    public Double getProgressPercent() {
        return progressPercent;
    }

    public void setProgressPercent(Double progressPercent) {
        this.progressPercent = progressPercent;
    }

    public Long getCompletedKeyResults() {
        return completedKeyResults;
    }

    public void setCompletedKeyResults(Long completedKeyResults) {
        this.completedKeyResults = completedKeyResults;
    }

    public Long getTotalKeyResults() {
        return totalKeyResults;
    }

    public void setTotalKeyResults(Long totalKeyResults) {
        this.totalKeyResults = totalKeyResults;
    }

    public String getObjectiveStatus() {
        return objectiveStatus;
    }

    public void setObjectiveStatus(String objectiveStatus) {
        this.objectiveStatus = objectiveStatus;
    }
}