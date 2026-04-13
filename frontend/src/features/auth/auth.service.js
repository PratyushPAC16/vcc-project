import { http } from "../../lib/http";

function readErrorMessage(payload, fallback) {
  if (Array.isArray(payload?.details) && payload.details.length > 0) {
    return payload.details
      .map((item) => {
        const field = item?.path ? `${item.path}: ` : "";
        return `${field}${item?.message || "Invalid value"}`;
      })
      .join("; ");
  }

  return payload?.error || fallback;
}

export async function registerRequest(email, password) {
  const response = await http("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(readErrorMessage(payload, "Registration failed."));
  }

  return response.json();
}

export async function loginRequest(email, password) {
  const response = await http("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(readErrorMessage(payload, "Login failed."));
  }

  return response.json();
}

export async function logoutRequest() {
  await http("/api/auth/logout", { method: "POST" });
}
