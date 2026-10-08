let allDepartments = [];
let studentPendingDelete = null;
let deleteModal = null;

document.addEventListener("DOMContentLoaded", async () => {
  await requireAuth();
  initNavbar("students");

  deleteModal = new bootstrap.Modal(document.getElementById("deleteModal"));

  await loadDepartmentFilterOptions();
  await loadStudents();

  document.getElementById("searchBtn").addEventListener("click", handleSearch);
  document.getElementById("searchInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); handleSearch(); }
  });
  document.getElementById("departmentFilter").addEventListener("change", handleFilter);
  document.getElementById("yearFilter").addEventListener("change", handleFilter);
  document.getElementById("clearFiltersBtn").addEventListener("click", async () => {
    document.getElementById("searchInput").value = "";
    document.getElementById("departmentFilter").value = "";
    document.getElementById("yearFilter").value = "";
    await loadStudents();
  });
  document.getElementById("confirmDeleteBtn").addEventListener("click", confirmDelete);
});

async function loadDepartmentFilterOptions() {
  try {
    allDepartments = await Api.getDepartments();
    const select = document.getElementById("departmentFilter");
    allDepartments.forEach((dept) => {
      const opt = document.createElement("option");
      opt.value = dept.id;
      opt.textContent = `${dept.departmentName} (${dept.departmentCode})`;
      select.appendChild(opt);
    });
  } catch (err) {
    showAlert("Could not load departments: " + err.message, "danger");
  }
}

async function loadStudents() {
  renderLoadingRow();
  try {
    const students = await Api.getStudents();
    renderStudents(students);
  } catch (err) {
    showAlert("Could not load students: " + err.message, "danger");
    renderStudents([]);
  }
}

async function handleSearch() {
  const keyword = document.getElementById("searchInput").value.trim();
  document.getElementById("departmentFilter").value = "";
  document.getElementById("yearFilter").value = "";

  if (!keyword) { await loadStudents(); return; }

  renderLoadingRow();
  try {
    const students = await Api.searchStudents(keyword);
    renderStudents(students);
  } catch (err) {
    showAlert("Search failed: " + err.message, "danger");
  }
}

async function handleFilter() {
  document.getElementById("searchInput").value = "";
  const departmentId = document.getElementById("departmentFilter").value || null;
  const year = document.getElementById("yearFilter").value || null;

  renderLoadingRow();
  try {
    const students = await Api.filterStudents(departmentId, year);
    renderStudents(students);
  } catch (err) {
    showAlert("Filter failed: " + err.message, "danger");
  }
}

function renderLoadingRow() {
  document.getElementById("studentsTableBody").innerHTML =
    '<tr class="loading-row"><td colspan="7">Loading students...</td></tr>';
}

function renderStudents(students) {
  const tbody = document.getElementById("studentsTableBody");
  document.getElementById("resultCount").textContent = `${students.length} student(s)`;

  if (students.length === 0) {
    tbody.innerHTML = '<tr class="loading-row"><td colspan="7">No students found.</td></tr>';
    return;
  }

  tbody.innerHTML = students.map((s) => {
    const initials = (s.firstName[0] || "") + (s.lastName[0] || "");
    return `
      <tr>
        <td>${s.id}</td>
        <td><span class="avatar-circle">${escapeHtml(initials.toUpperCase())}</span>${escapeHtml(s.firstName)} ${escapeHtml(s.lastName)}</td>
        <td>${escapeHtml(s.email)}</td>
        <td><span class="badge text-bg-light border">${escapeHtml(s.departmentCode)}</span></td>
        <td>Year ${s.yearOfStudy}</td>
        <td><span class="cgpa-badge">${s.cgpa.toFixed(2)}</span></td>
        <td class="text-nowrap">
          <a href="student-details.html?id=${s.id}" class="btn btn-sm btn-outline-secondary" title="View">View</a>
          <a href="edit-student.html?id=${s.id}" class="btn btn-sm btn-outline-primary" title="Edit">Edit</a>
          <button class="btn btn-sm btn-outline-danger" title="Delete" onclick="openDeleteModal(${s.id}, '${escapeHtml(s.firstName)} ${escapeHtml(s.lastName)}')">Delete</button>
        </td>
      </tr>`;
  }).join("");
}

function openDeleteModal(id, name) {
  studentPendingDelete = id;
  document.getElementById("deleteStudentName").textContent = name;
  deleteModal.show();
}

async function confirmDelete() {
  if (!studentPendingDelete) return;
  try {
    await Api.deleteStudent(studentPendingDelete);
    deleteModal.hide();
    showAlert("Student deleted successfully.", "success");
    await loadStudents();
  } catch (err) {
    showAlert("Could not delete student: " + err.message, "danger");
  } finally {
    studentPendingDelete = null;
  }
}
