package com.sanjay.studentmanagement.dto;

import java.util.Map;

public record DashboardStatsDTO(
        long totalStudents,
        long totalDepartments,
        double averageCgpa,
        long finalYearStudents,
        Map<String, Long> studentsPerDepartment) {
}
