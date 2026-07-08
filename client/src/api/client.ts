import type { ApiResponse } from "@squadup/shared";

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ??
  `${import.meta.env.VITE_API_URL ?? "http://localhost:5000"}/api`;

export async function apiRequest<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !payload.success) {
    const message =
      "error" in payload ? payload.error.message : "Request failed";
    throw new Error(message);
  }

  return payload.data;
}
