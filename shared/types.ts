/**
 * shared/types.ts
 * Shared type definitions used by both client and server.
 */

export type UserRole = "admin" | "manager" | "delivery" | "reader" | "buyer" | "developer";

export interface SessionPayload {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
}
