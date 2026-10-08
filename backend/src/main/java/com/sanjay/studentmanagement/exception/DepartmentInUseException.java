package com.sanjay.studentmanagement.exception;

public class DepartmentInUseException extends RuntimeException {

    public DepartmentInUseException(Long id) {
        super("Department " + id + " cannot be deleted: students are still assigned to it");
    }
}
