-- Run ONCE as SYSTEM, connected to the pluggable database (XEPDB1).
-- SQL*Plus example:  sqlplus system@localhost:1521/XEPDB1
-- Replace <YOUR_PASSWORD> with your own password. Never commit the real one.

CREATE USER student_app IDENTIFIED BY "<YOUR_PASSWORD>";
GRANT CONNECT, RESOURCE TO student_app;
ALTER USER student_app QUOTA UNLIMITED ON USERS;
