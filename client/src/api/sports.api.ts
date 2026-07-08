import type { Sport } from "@squadup/shared";
import { apiRequest } from "./client";

export function getSports() {
  return apiRequest<Sport[]>("/sports");
}
