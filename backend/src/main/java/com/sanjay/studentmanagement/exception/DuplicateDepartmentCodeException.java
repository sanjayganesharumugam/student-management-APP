package com.sanjay.studentmanagement.exception;

public class DuplicateDepartmentCodeException extends RuntimeException {

    public DuplicateDepartmentCodeException(String code) {
        super("A department with code '" + code + "' already exists");
    }
}
