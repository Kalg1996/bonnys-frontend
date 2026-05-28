export const API_URL = process.env.NEXT_PUBLIC_API_URL;

function buildUrl(path) {
  const normalizedBaseUrl = API_URL?.replace(/\/$/, "") ?? "";
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${normalizedBaseUrl}${normalizedPath}`;
}

export async function apiFetch(path, options = {}) {
  const { headers, body, ...restOptions } = options;
  const isFormData = body instanceof FormData;

  const response = await fetch(buildUrl(path), {
    ...restOptions,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...headers,
    },
    body: isFormData || typeof body === "string" ? body : JSON.stringify(body),
  });

  const contentType = response.headers.get("content-type");
  const data = contentType?.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    throw new Error(data?.mensaje || "Error al consumir la API");
  }

  return data;
}

const api = {
  fetch: apiFetch,
};

export default api;
