/**
 * main.tsx — tRPC v11 + React 19 entry point
 *
 * Key changes from original:
 *  - httpBatchStreamLink (tRPC v11) replaces httpBatchLink with transformer
 *  - tanstack/react-query v5 API (no transformer on QueryClient)
 *  - Redirect to /auth on UNAUTHORIZED, matching server's exact error message
 */

import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from "@shared/const";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchStreamLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import App from "./App";
import { getLoginUrl } from "./const";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

// ── Global error handler: redirect to login on 401 ───────────────────────────

function redirectIfUnauthorized(error: unknown) {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;
  if (error.message === UNAUTHED_ERR_MSG) {
    window.location.href = getLoginUrl();
  }
}

queryClient.getQueryCache().subscribe((event) => {
  if (event.type === "updated" && event.action.type === "error") {
    redirectIfUnauthorized(event.query.state.error);
  }
});

queryClient.getMutationCache().subscribe((event) => {
  if (event.type === "updated" && event.action.type === "error") {
    redirectIfUnauthorized(event.mutation.state.error);
  }
});

// ── tRPC client (v11 — no transformer option here) ───────────────────────────

const trpcClient = trpc.createClient({
  links: [
    httpBatchStreamLink({
      url: "/api/trpc",
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

// ── Mount ─────────────────────────────────────────────────────────────────────

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);
