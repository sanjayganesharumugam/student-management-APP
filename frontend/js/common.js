/**
 * Shared helpers used across every page: alerts, navbar highlighting,
 * logout wiring, and a guard that redirects to login.html if not authenticated.
 */

function showAlert(message, type = "success") {
  let box = document.getElementById("alertBox");
  if (!box) {
    box = document.createElement("div");
    box.id = "alertBox";
    document.body.appendChild(box);
  }
  const alertId = "alert-" + Date.now();
  const alertEl = document.createElement("div");
  alertEl.id = alertId;
  alertEl.className = `alert alert-${type} alert-dismissible fade show shadow-sm`;
  alertEl.role = "alert";
  alertEl.innerHTML = `${escapeHtml(message)}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`;
  box.appendChild(alertEl);

  setTimeout(() => {
    const el = document.getElementById(alertId);
    if (el) bootstrap.Alert.getOrCreateInstance(el).close();
  }, 4000);
}

function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function setActiveNav(page) {
  document.querySelectorAll(".navbar-nav .nav-link[data-page]").forEach((link) => {
    if (link.dataset.page === page) link.classList.add("active");
  });
}

function initNavbar(page) {
  setActiveNav(page);
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        await Api.logout();
      } catch (err) {
        // Ignore errors - we redirect to login regardless
      }
      window.location.href = "login.html";
    });
  }
}

// Call at the top of every protected page. Redirects to login.html if the
// session is missing/expired, otherwise shows the admin's username.
async function requireAuth() {
  try {
    const user = await Api.me();
    const usernameEl = document.getElementById("navUsername");
    if (usernameEl && user) usernameEl.textContent = user.username;
    return user;
  } catch (err) {
    window.location.href = "login.html";
    return null;
  }
}

function fieldErrorMessages(error) {
  if (!error.fieldErrors) return error.message;
  return Object.values(error.fieldErrors).join(" | ");
}

function applyFieldErrors(formEl, fieldErrors) {
  formEl.querySelectorAll(".is-invalid").forEach((el) => el.classList.remove("is-invalid"));
  if (!fieldErrors) return;
  Object.entries(fieldErrors).forEach(([field, message]) => {
    const input = formEl.querySelector(`[name="${field}"]`);
    if (input) {
      input.classList.add("is-invalid");
      const feedback = input.closest(".mb-3, .col-md-6, .col-12")?.querySelector(".invalid-feedback");
      if (feedback) feedback.textContent = message;
    }
  });
}
