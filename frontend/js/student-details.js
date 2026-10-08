document.addEventListener("DOMContentLoaded", async () => {
  await requireAuth();
  initNavbar("students");

  const params = new URLSearchParams(window.location.search);
  const studentId = params.get("id");
  if (!studentId) { window.location.href = "students.html"; return; }

  try {
    const s = await Api.getStudent(studentId);
    document.getElementById("studentName").textContent = `${s.firstName} ${s.lastName}`;
    document.getElementById("studentId").textContent = s.id;
    document.getElementById("studentEmail").textContent = s.email;
    document.getElementById("studentPhone").textContent = s.phone;
    document.getElementById("studentDob").textContent = s.dateOfBirth || "—";
    document.getElementById("studentGender").textContent = s.gender || "—";
    document.getElementById("studentDepartment").textContent = `${s.departmentName} (${s.departmentCode})`;
    document.getElementById("studentYear").textContent = `Year ${s.yearOfStudy}`;
    document.getElementById("studentCgpa").textContent = s.cgpa.toFixed(2);
    document.getElementById("studentAddress").textContent =
      [s.address, s.city, s.state].filter(Boolean).join(", ") || "—";
    document.getElementById("editLink").href = `edit-student.html?id=${s.id}`;
    document.getElementById("avatarInitials").textContent =
      (s.firstName[0] || "") + (s.lastName[0] || "");
  } catch (err) {
    showAlert("Could not load student: " + err.message, "danger");
  }
});
