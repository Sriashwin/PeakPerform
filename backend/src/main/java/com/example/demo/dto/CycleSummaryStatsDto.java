package com.example.demo.dto;

public class CycleSummaryStatsDto {

    private Long cycleId;
    private String cycleTitle;
    private long totalObjectives;
    private long activeObjectives;
    private long completedObjectives;
    private long cancelledObjectives;
    private Double averageProgress;
    private long onTrackKeyResults;
    private long atRiskKeyResults;
    private long behindKeyResults;
    private long pendingCheckIns;

    public CycleSummaryStatsDto() {
    }

    public Long getCycleId() {
        return cycleId;
    }

    public void setCycleId(Long cycleId) {
        this.cycleId = cycleId;
    }

    public String getCycleTitle() {
        return cycleTitle;
    }

    public void setCycleTitle(String cycleTitle) {
        this.cycleTitle = cycleTitle;
    }

    public long getTotalObjectives() {
        return totalObjectives;
    }

    public void setTotalObjectives(long totalObjectives) {
        this.totalObjectives = totalObjectives;
    }

    public long getActiveObjectives() {
        return activeObjectives;
    }

    public void setActiveObjectives(long activeObjectives) {
        this.activeObjectives = activeObjectives;
    }

    public long getCompletedObjectives() {
        return completedObjectives;
    }

    public void setCompletedObjectives(long completedObjectives) {
        this.completedObjectives = completedObjectives;
    }

    public long getCancelledObjectives() {
        return cancelledObjectives;
    }

    public void setCancelledObjectives(long cancelledObjectives) {
        this.cancelledObjectives = cancelledObjectives;
    }

    public Double getAverageProgress() {
        return averageProgress;
    }

    public void setAverageProgress(Double averageProgress) {
        this.averageProgress = averageProgress;
    }

    public long getOnTrackKeyResults() {
        return onTrackKeyResults;
    }

    public void setOnTrackKeyResults(long onTrackKeyResults) {
        this.onTrackKeyResults = onTrackKeyResults;
    }

    public long getAtRiskKeyResults() {
        return atRiskKeyResults;
    }

    public void setAtRiskKeyResults(long atRiskKeyResults) {
        this.atRiskKeyResults = atRiskKeyResults;
    }

    public long getBehindKeyResults() {
        return behindKeyResults;
    }

    public void setBehindKeyResults(long behindKeyResults) {
        this.behindKeyResults = behindKeyResults;
    }

    public long getPendingCheckIns() {
        return pendingCheckIns;
    }

    public void setPendingCheckIns(long pendingCheckIns) {
        this.pendingCheckIns = pendingCheckIns;
    }
}