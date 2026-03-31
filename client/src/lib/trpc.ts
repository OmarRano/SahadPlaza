/**
 * trpc.ts — tRPC React client
 *
 * Imports AppRouter from server/routers.ts (the full router, not the stub).
 * The path goes up 3 levels: src/lib -> src -> client -> project root,
 * then into server/routers.
 */
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../../../server/routers";

export const trpc = createTRPCReact<AppRouter>();
