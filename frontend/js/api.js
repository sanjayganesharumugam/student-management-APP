/**
 * Small wrapper around fetch() used by every page.
 * `credentials: "include"` makes the browser send the JSESSIONID cookie
 * that Spring Security uses to recognise a logged-in admin.
 */
const API_BASE = "/api";

async function apiRequest(path, options = {}) {
  const response = await fetch(API_BASE + path, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  // Session expired or never logged in -> send back to login page
  if (response.status === 401 && !path.startsWith("/auth")) {
    window.location.href = "login.html";
    return null;
  }

  let data = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = null;
    }
  }

  if (!response.ok) {
    const message = (data && data.message) || `Request failed (${response.status})`;
    const error = new Error(message);
    error.status = response.status;
    error.fieldErrors = data && data.errors ? data.errors : null;
    throw error;
  }

  return data;
}

const Api = {
  login: (username, password) =>
    apiRequest("/auth/login", { method: "POST", body: JSON.stringify({ username, password }) }),
  logout: () => apiRequest("/auth/logout", { method: "POST" }),
  me: () => apiRequest("/auth/me"),

  getStudents: () => apiRequest("/students"),
  getStudent: (id) => apiRequest(`/students/${id}`),
  createStudent: (dto) => apiRequest("/students", { method: "POST", body: JSON.stringify(dto) }),
  updateStudent: (id, dto) => apiRequest(`/students/${id}`, { method: "PUT", body: JSON.stringify(dto) }),
  deleteStudent: (id) => apiRequest(`/students/${id}`, { method: "DELETE" }),
  searchStudents: (keyword) => apiRequest(`/students/search?keyword=${encodeURIComponent(keyword)}`),
  filterStudents: (departmentId, year) => {
    const params = new URLSearchParams();
    if (departmentId) params.set("department", departmentId);
    if (year) params.set("year", year);
    return apiRequest(`/students/filter?${params.toString()}`);
  },

  getDepartments: () => apiRequest("/departments"),

  getDashboardStats: () => apiRequest("/dashboard/stats"),
};
