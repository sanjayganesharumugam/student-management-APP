package com.sanjay.studentmanagement.service;

import com.sanjay.studentmanagement.dto.DashboardStatsDTO;
import com.sanjay.studentmanagement.dto.StudentDTO;
import com.sanjay.studentmanagement.entity.Department;
import com.sanjay.studentmanagement.entity.Student;
import com.sanjay.studentmanagement.exception.DepartmentNotFoundException;
import com.sanjay.studentmanagement.exception.DuplicateEmailException;
import com.sanjay.studentmanagement.exception.StudentNotFoundException;
import com.sanjay.studentmanagement.repository.DepartmentRepository;
import com.sanjay.studentmanagement.repository.StudentRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class StudentService {

    private final StudentRepository studentRepository;
    private final DepartmentRepository departmentRepository;

    public StudentService(StudentRepository studentRepository, DepartmentRepository departmentRepository) {
        this.studentRepository = studentRepository;
        this.departmentRepository = departmentRepository;
    }

    @Transactional(readOnly = true)
    public List<StudentDTO> getAllStudents() {
        return studentRepository.findAll(Sort.by("id")).stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public StudentDTO getStudentById(Long id) {
        Student student = findStudentOrThrow(id);
        return toDTO(student);
    }

    public StudentDTO createStudent(StudentDTO dto) {
        if (studentRepository.existsByEmail(dto.getEmail())) {
            throw new DuplicateEmailException(dto.getEmail());
        }
        Department department = findDepartmentOrThrow(dto.getDepartmentId());

        Student student = new Student();
        applyDtoToEntity(dto, student, department);

        Student saved = studentRepository.save(student);
        return toDTO(saved);
    }

    public StudentDTO updateStudent(Long id, StudentDTO dto) {
        Student student = findStudentOrThrow(id);

        if (studentRepository.existsByEmailAndIdNot(dto.getEmail(), id)) {
            throw new DuplicateEmailException(dto.getEmail());
        }
        Department department = findDepartmentOrThrow(dto.getDepartmentId());

        applyDtoToEntity(dto, student, department);

        Student saved = studentRepository.save(student);
        return toDTO(saved);
    }

    public void deleteStudent(Long id) {
        Student student = findStudentOrThrow(id);
        studentRepository.delete(student);
    }

    @Transactional(readOnly = true)
    public List<StudentDTO> searchStudents(String keyword) {
        if (!StringUtils.hasText(keyword)) {
            return getAllStudents();
        }
        return studentRepository.searchStudents(keyword.trim()).stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<StudentDTO> filterStudents(Long departmentId, Integer year) {
        Sort sort = Sort.by("id");
        List<Student> results;

        if (departmentId != null && year != null) {
            results = studentRepository.findByDepartmentIdAndYearOfStudy(departmentId, year, sort);
        } else if (departmentId != null) {
            results = studentRepository.findByDepartmentId(departmentId, sort);
        } else if (year != null) {
            results = studentRepository.findByYearOfStudy(year, sort);
        } else {
            results = studentRepository.findAll(sort);
        }

        return results.stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public DashboardStatsDTO getDashboardStats() {
        long totalStudents = studentRepository.count();
        long totalDepartments = departmentRepository.count();
        Double avg = studentRepository.findAverageCgpa();
        double averageCgpa = avg == null ? 0.0 : Math.round(avg * 100.0) / 100.0;
        long finalYearStudents = studentRepository.countByYearOfStudy(4);

        Map<String, Long> perDepartment = new LinkedHashMap<>();
        departmentRepository.findAll().forEach(dept ->
                perDepartment.put(dept.getDepartmentCode(), studentRepository.countByDepartmentId(dept.getId())));

        return new DashboardStatsDTO(totalStudents, totalDepartments, averageCgpa, finalYearStudents, perDepartment);
    }

    // ---------- helpers ----------

    private Student findStudentOrThrow(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new StudentNotFoundException(id));
    }

    private Department findDepartmentOrThrow(Long departmentId) {
        return departmentRepository.findById(departmentId)
                .orElseThrow(() -> new DepartmentNotFoundException(departmentId));
    }

    private void applyDtoToEntity(StudentDTO dto, Student student, Department department) {
        student.setFirstName(dto.getFirstName());
        student.setLastName(dto.getLastName());
        student.setEmail(dto.getEmail());
        student.setPhone(dto.getPhone());
        student.setDateOfBirth(dto.getDateOfBirth());
        student.setGender(dto.getGender());
        student.setDepartment(department);
        student.setYearOfStudy(dto.getYearOfStudy());
        student.setCgpa(dto.getCgpa());
        student.setAddress(dto.getAddress());
        student.setCity(dto.getCity());
        student.setState(dto.getState());
    }

    private StudentDTO toDTO(Student student) {
        StudentDTO dto = new StudentDTO();
        dto.setId(student.getId());
        dto.setFirstName(student.getFirstName());
        dto.setLastName(student.getLastName());
        dto.setEmail(student.getEmail());
        dto.setPhone(student.getPhone());
        dto.setDateOfBirth(student.getDateOfBirth());
        dto.setGender(student.getGender());
        dto.setDepartmentId(student.getDepartment().getId());
        dto.setDepartmentName(student.getDepartment().getDepartmentName());
        dto.setDepartmentCode(student.getDepartment().getDepartmentCode());
        dto.setYearOfStudy(student.getYearOfStudy());
        dto.setCgpa(student.getCgpa());
        dto.setAddress(student.getAddress());
        dto.setCity(student.getCity());
        dto.setState(student.getState());
        return dto;
    }
}
