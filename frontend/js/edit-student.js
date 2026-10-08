document.addEventListener("DOMContentLoaded", async () => {
  await requireAuth();
  initNavbar("students");

  const params = new URLSearchParams(window.location.search);
  const studentId = params.get("id");
  if (!studentId) { window.location.href = "students.html"; return; }

  await populateDepartmentSelect("departmentId");
  await loadStudentIntoForm(studentId);

  const form = document.getElementById("studentForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    applyFieldErrors(form, null);

    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    const dto = collectFormData(form);
    const submitBtn = form.querySelector("button[type=submit]");
    submitBtn.disabled = true;
    submitBtn.textContent = "Saving...";

    try {
      await Api.updateStudent(studentId, dto);
      showAlert("Student updated successfully.", "success");
      setTimeout(() => { window.location.href = "students.html"; }, 800);
    } catch (err) {
      applyFieldErrors(form, err.fieldErrors);
      showAlert(fieldErrorMessages(err), "danger");
      submitBtn.disabled = false;
      submitBtn.textContent = "Save Changes";
    }
  });
});

async function populateDepartmentSelect(selectId) {
  try {
    const departments = await Api.getDepartments();
    const select = document.getElementById(selectId);
    departments.forEach((dept) => {
      const opt = document.createElement("option");
      opt.value = dept.id;
      opt.textContent = `${dept.departmentName} (${dept.departmentCode})`;
      select.appendChild(opt);
    });
  } catch (err) {
    showAlert("Could not load departments: " + err.message, "danger");
  }
}

async function loadStudentIntoForm(id) {
  try {
    const s = await Api.getStudent(id);
    document.getElementById("firstName").value = s.firstName || "";
    document.getElementById("lastName").value = s.lastName || "";
    document.getElementById("email").value = s.email || "";
    document.getElementById("phone").value = s.phone || "";
    document.getElementById("dateOfBirth").value = s.dateOfBirth || "";
    document.getElementById("gender").value = s.gender || "";
    document.getElementById("departmentId").value = s.departmentId || "";
    document.getElementById("yearOfStudy").value = s.yearOfStudy || "";
    document.getElementById("cgpa").value = s.cgpa ?? "";
    document.getElementById("address").value = s.address || "";
    document.getElementById("city").value = s.city || "";
    document.getElementById("state").value = s.state || "";
  } catch (err) {
    showAlert("Could not load student: " + err.message, "danger");
  }
}

function collectFormData(form) {
  const fd = new FormData(form);
  return {
    firstName: fd.get("firstName")?.trim(),
    lastName: fd.get("lastName")?.trim(),
    email: fd.get("email")?.trim(),
    phone: fd.get("phone")?.trim(),
    dateOfBirth: fd.get("dateOfBirth") || null,
    gender: fd.get("gender") || null,
    departmentId: fd.get("departmentId") ? Number(fd.get("departmentId")) : null,
    yearOfStudy: fd.get("yearOfStudy") ? Number(fd.get("yearOfStudy")) : null,
    cgpa: fd.get("cgpa") ? Number(fd.get("cgpa")) : null,
    address: fd.get("address")?.trim() || null,
    city: fd.get("city")?.trim() || null,
    state: fd.get("state")?.trim() || null,
  };
}
