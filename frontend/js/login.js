document.addEventListener("DOMContentLoaded", () => {
  // If already logged in, skip straight to the dashboard
  Api.me().then(() => { window.location.href = "dashboard.html"; }).catch(() => {});

  const form = document.getElementById("loginForm");
  const errorBox = document.getElementById("loginError");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorBox.classList.add("d-none");

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    const submitBtn = form.querySelector("button[type=submit]");
    submitBtn.disabled = true;
    submitBtn.textContent = "Signing in...";

    try {
      await Api.login(username, password);
      window.location.href = "dashboard.html";
    } catch (err) {
      errorBox.textContent = err.message || "Invalid username or password";
      errorBox.classList.remove("d-none");
      submitBtn.disabled = false;
      submitBtn.textContent = "Login";
    }
  });
});
