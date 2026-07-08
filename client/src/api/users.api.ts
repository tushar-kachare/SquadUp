import type { CreateUserInput, User } from "@squadup/shared";
import { apiRequest } from "./client";

export function createUser(input: CreateUserInput) {
  return apiRequest<User>("/users", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getUser(id: string) {
  return apiRequest<User>(`/users/${id}`);
}
