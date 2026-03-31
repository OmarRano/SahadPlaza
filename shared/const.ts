/**
 * shared/const.ts
 *
 * Constants shared between the server and client.
 * UNAUTHED_ERR_MSG must exactly match what server/_core/trpc.ts throws.
 */

export const COOKIE_NAME = "sahad_session";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
export const AXIOS_TIMEOUT_MS = 30_000;

// ⚠️  Must match the message thrown in server/_core/trpc.ts requireUser middleware
export const UNAUTHED_ERR_MSG = "Please log in to continue.";
export const NOT_ADMIN_ERR_MSG = "You do not have the required permission. (10002)";
