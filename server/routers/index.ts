/**
 * server/routers/index.ts
 *
 * Re-exports the full app router from server/routers.ts.
 * This file exists only so relative imports from tests or sub-modules
 * can use either path.  The client imports from "server/routers" which
 * resolves to server/routers.ts directly.
 */
export { appRouter } from "../routers";
export type { AppRouter } from "../routers";
