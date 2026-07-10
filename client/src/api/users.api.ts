import type { CreateUserInput, User } from "@squadup/shared";
import { apiRequest } from "./client";

type SyncUserInput = {
  displayName: string | null;
  email: string | null;
};

export function createUser(input: CreateUserInput) {
  return apiRequest<User>("/users", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getUser(id: string) {
  return apiRequest<User>(`/users/${id}`);
}

export function syncUser(input: SyncUserInput) {
  return apiRequest<User>("/users/sync", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
