export async function http(path, options = {}) {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL || "";
  const hostname = typeof window !== "undefined" ? window.location.hostname : "";
  const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";
  const fallbackProductionBaseUrl = "https://virtual-cloud-computing-project.onrender.com";
  const baseUrl = configuredBaseUrl || (isLocalhost ? "" : fallbackProductionBaseUrl);
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${baseUrl}${normalizedPath}`;

  return fetch(url, {
    credentials: "include",
    ...options,
  });
}
