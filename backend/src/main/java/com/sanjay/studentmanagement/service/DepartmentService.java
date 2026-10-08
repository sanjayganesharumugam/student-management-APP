package com.sanjay.studentmanagement.service;

import com.sanjay.studentmanagement.entity.Department;
import com.sanjay.studentmanagement.exception.DepartmentInUseException;
import com.sanjay.studentmanagement.exception.DepartmentNotFoundException;
import com.sanjay.studentmanagement.exception.DuplicateDepartmentCodeException;
import com.sanjay.studentmanagement.repository.DepartmentRepository;
import com.sanjay.studentmanagement.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final StudentRepository studentRepository;

    public DepartmentService(DepartmentRepository departmentRepository, StudentRepository studentRepository) {
        this.departmentRepository = departmentRepository;
        this.studentRepository = studentRepository;
    }

    @Transactional(readOnly = true)
    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Department getDepartmentById(Long id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new DepartmentNotFoundException(id));
    }

    public Department createDepartment(Department department) {
        if (departmentRepository.existsByDepartmentCode(department.getDepartmentCode())) {
            throw new DuplicateDepartmentCodeException(department.getDepartmentCode());
        }
        return departmentRepository.save(department);
    }

    public Department updateDepartment(Long id, Department updated) {
        Department existing = getDepartmentById(id);

        if (departmentRepository.existsByDepartmentCodeAndIdNot(updated.getDepartmentCode(), id)) {
            throw new DuplicateDepartmentCodeException(updated.getDepartmentCode());
        }

        existing.setDepartmentName(updated.getDepartmentName());
        existing.setDepartmentCode(updated.getDepartmentCode());
        return departmentRepository.save(existing);
    }

    public void deleteDepartment(Long id) {
        Department department = getDepartmentById(id);
        if (studentRepository.existsByDepartmentId(id)) {
            throw new DepartmentInUseException(id);
        }
        departmentRepository.delete(department);
    }
}
