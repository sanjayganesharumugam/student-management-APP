# Student Management System

A full-stack, admin-only Student Management System built as a Java Developer / Software Engineer fresher portfolio project.

## Overview

The admin logs in, then manages student records: add, view, edit, delete, search and filter by department/year. A dashboard shows summary statistics. The backend is a layered Spring Boot REST API backed by Oracle SQL; the frontend is plain HTML/CSS/JavaScript with Bootstrap 5, calling the API with `fetch()`.

## Features

- Admin login/logout (Spring Security, session-cookie based, BCrypt-hashed password)
- Dashboard: total students, total departments, average CGPA, final-year student count, students per department
- Full CRUD for students
- Search by name, email, or student ID
- Filter by department and/or year (combinable)
- Department management via REST API
- Bean Validation with field-level error messages
- Centralized exception handling (`@RestControllerAdvice`) with consistent JSON error responses
- Responsive Bootstrap UI with confirmation dialogs and success/error alerts

## Technology Stack

**Backend:** Java 21, Spring Boot 3.5, Spring Web, Spring Data JPA (Hibernate), Spring Security, Bean Validation, Maven
**Database:** Oracle SQL (tested against Oracle XE), Oracle JDBC Driver (ojdbc11)
**Frontend:** HTML5, CSS3, JavaScript (ES6+), Bootstrap 5
**Tools:** Git, Postman

## Architecture

Layered architecture, package `com.sanjay.studentmanagement`:

```
controller/   REST endpoints (StudentController, DepartmentController, AuthController, DashboardController)
service/      Business logic (StudentService, DepartmentService)
repository/   Spring Data JPA interfaces (StudentRepository, DepartmentRepository, AdminUserRepository)
entity/       JPA entities mapped to Oracle tables (Student, Department, AdminUser)
dto/          Request/response shapes (StudentDTO, LoginRequest, DashboardStatsDTO)
exception/    Custom exceptions + GlobalExceptionHandler
security/     SecurityConfig, AdminUserDetailsService
```

The frontend never talks to the database directly - every page calls the REST API and only the API touches Oracle.

## Database Design

| Table | Purpose |
|---|---|
| `DEPARTMENTS` | Department catalog (id, name, unique code) |
| `STUDENTS` | Student records, foreign key to `DEPARTMENTS` |
| `ADMIN_USERS` | Admin login credentials (BCrypt-hashed password) |

Full DDL is in `database/schema.sql`; sample rows are in `database/sample-data.sql`. Tables are created by these scripts, not by Hibernate (`spring.jpa.hibernate.ddl-auto=none`), so the schema is explicit and easy to explain.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Log in, starts a session |
| POST | `/api/auth/logout` | Log out, ends the session |
| GET | `/api/auth/me` | Check current session |
| GET | `/api/students` | All students |
| GET | `/api/students/{id}` | One student |
| POST | `/api/students` | Create a student |
| PUT | `/api/students/{id}` | Update a student |
| DELETE | `/api/students/{id}` | Delete a student |
| GET | `/api/students/search?keyword=` | Search by name / email / ID |
| GET | `/api/students/filter?department=&year=` | Filter (combinable) |
| GET | `/api/departments` | List departments |
| POST/PUT/DELETE | `/api/departments...` | Manage departments |
| GET | `/api/dashboard/stats` | Dashboard statistics |

All `/api/students/**`, `/api/departments/**` and `/api/dashboard/**` endpoints require login. `/api/auth/**` is open.

## Setup Instructions

### 1. Prerequisites
- JDK 21
- Maven 3.9+
- Oracle Database (Oracle XE 21c works well) running and reachable
- Postman (optional, for API testing)

### 2. Oracle Configuration
```bash
# Connect as SYSTEM to the pluggable database, then run:
sqlplus system@localhost:1521/XEPDB1 @database/create-user.sql   # edit the password first!
sqlplus student_app@localhost:1521/XEPDB1 @database/schema.sql
sqlplus student_app@localhost:1521/XEPDB1 @database/sample-data.sql
```
Or run the same three scripts through SQL Developer / SQL*Plus manually.

### 3. Configure the backend connection
Copy `backend/src/main/resources/application-local.properties.example` to `application-local.properties` (same folder) and fill in your real DB user/password - this file is git-ignored so secrets never get committed. Alternatively, set the `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` environment variables.

### 4. Run the backend
```bash
cd backend
mvn spring-boot:run
```
The backend also serves the frontend, so once it starts, open:
```
http://localhost:8080
```
You'll land on the login page automatically.

### 5. Login
```
Username: admin
Password: Admin@123
```
Change this password (re-hash it with BCrypt and update `ADMIN_USERS`) before using the project anywhere public.

### 6. Run the frontend separately (optional)
If you prefer not to have Spring Boot serve static files, open `frontend/login.html` directly in a browser, or serve the `frontend/` folder with any static server. The API calls are relative paths, so as long as the page is opened from the same origin as the backend, no changes are needed. Opening the HTML file with `file://` will not work because of CORS/cookies - use a local server (e.g. `npx serve frontend` or VS Code's Live Server) if you split them.

## Postman Testing

Import `postman/Student-Management-System.postman_collection.json`. Run requests in order:
1. **Login** first — Postman keeps the session cookie for you automatically.
2. Then run any of Get All Students, Get by ID, Create, Update, Delete, Search, Filter, Dashboard Stats, Departments.
3. **Logout** when done.

## Sample Credentials
```
Username: admin
Password: Admin@123
```

## Common Errors and Fixes

| Error | Fix |
|---|---|
| `ORA-01017: invalid username/password` | Check `application-local.properties` or `DB_*` env vars |
| `IO Error: The Network Adapter could not establish the connection` | Oracle isn't running, or the URL/port is wrong |
| `ORA-00942: table or view does not exist` | Run `schema.sql` before starting the app |
| 401 on every API call after refresh | Session expired — log in again |
| `Failed to configure a DataSource` | Oracle connection details are missing/incorrect |

## Screenshots
_Add screenshots of the login page, dashboard, and student list here once the app is running._

## Future Enhancements
- Pagination and sorting on the student list
- Role-based access (multiple admin roles)
- CSV/Excel export of student data
- Password reset flow for the admin
- Unit and integration tests (JUnit, Mockito, `@SpringBootTest`)
- Dockerize backend + Oracle for one-command setup
