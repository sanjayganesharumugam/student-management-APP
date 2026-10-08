package com.sanjay.studentmanagement.repository;

import com.sanjay.studentmanagement.entity.Student;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface StudentRepository extends JpaRepository<Student, Long> {

    boolean existsByEmail(String email);

    // Used during update: another student must not already own this email
    boolean existsByEmailAndIdNot(String email, Long id);

    boolean existsByDepartmentId(Long departmentId);

    long countByYearOfStudy(Integer yearOfStudy);

    long countByDepartmentId(Long departmentId);

    List<Student> findByDepartmentId(Long departmentId, Sort sort);

    List<Student> findByYearOfStudy(Integer yearOfStudy, Sort sort);

    List<Student> findByDepartmentIdAndYearOfStudy(Long departmentId, Integer yearOfStudy, Sort sort);

    // Search by first name, last name, full name, email, or exact student ID
    @Query("""
            SELECT s FROM Student s
            WHERE LOWER(s.firstName) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(s.lastName) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(CONCAT(s.firstName, ' ', s.lastName)) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(s.email) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR CAST(s.id AS String) = :keyword
            ORDER BY s.id
            """)
    List<Student> searchStudents(@Param("keyword") String keyword);

    // Returns null when there are no students
    @Query("SELECT AVG(s.cgpa) FROM Student s")
    Double findAverageCgpa();
}
