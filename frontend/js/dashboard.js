document.addEventListener("DOMContentLoaded", async () => {
  await requireAuth();
  initNavbar("dashboard");

  try {
    const stats = await Api.getDashboardStats();
    document.getElementById("statTotalStudents").textContent = stats.totalStudents;
    document.getElementById("statTotalDepartments").textContent = stats.totalDepartments;
    document.getElementById("statAvgCgpa").textContent = stats.averageCgpa.toFixed(2);
    document.getElementById("statFinalYear").textContent = stats.finalYearStudents;

    const breakdownEl = document.getElementById("departmentBreakdown");
    breakdownEl.innerHTML = "";
    Object.entries(stats.studentsPerDepartment).forEach(([code, count]) => {
      const row = document.createElement("div");
      row.className = "d-flex justify-content-between align-items-center py-2 border-bottom";
      row.innerHTML = `<span>${escapeHtml(code)}</span><span class="fw-semibold">${count} student(s)</span>`;
      breakdownEl.appendChild(row);
    });
    if (Object.keys(stats.studentsPerDepartment).length === 0) {
      breakdownEl.innerHTML = '<p class="text-muted mb-0">No departments yet.</p>';
    }
  } catch (err) {
    showAlert("Could not load dashboard statistics: " + err.message, "danger");
  }
});
