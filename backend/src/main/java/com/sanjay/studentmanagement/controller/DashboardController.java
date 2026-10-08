package com.sanjay.studentmanagement.controller;

import com.sanjay.studentmanagement.dto.DashboardStatsDTO;
import com.sanjay.studentmanagement.service.StudentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final StudentService studentService;

    public DashboardController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> getStats() {
        return ResponseEntity.ok(studentService.getDashboardStats());
    }
}
