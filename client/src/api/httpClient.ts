import type { ApiResponse } from "@squadup/shared";
import { auth } from "../config/firebase";

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ??
  `${import.meta.env.VITE_API_URL ?? "http://localhost:5000"}/api`;

export async function apiRequest<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const headers = new Headers(options?.headers);

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const currentUser = auth.currentUser;
  if (currentUser) {
    const token = await currentUser.getIdToken();
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers,
  });

  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !payload.success) {
    const message =
      "error" in payload ? payload.error.message : "Request failed";
    throw new Error(message);
  }

  return payload.data;
}

