
const API_URL = "https://mini-ats-oolj.onrender.com/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed: ${response.status}`);
  }

  return data;
}

export const getCandidates = (search = "", stage = "All stages") => {
  const params = new URLSearchParams();

  if (search.trim()) params.set("search", search.trim());
  if (stage !== "All stages") params.set("stage", stage);

  return request(`/candidates?${params.toString()}`);
};

export const createCandidate = (candidate) =>
  request("/candidates", {
    method: "POST",
    body: JSON.stringify(candidate),
  });

export const updateCandidate = (id, updates) =>
  request(`/candidates/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });

export const removeCandidate = (id) =>
  request(`/candidates/${id}`, {
    method: "DELETE",
  });

export const getDashboardStats = () => request("/dashboard/stats");
