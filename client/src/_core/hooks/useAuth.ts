/**
 * useAuth.ts — Authentication hook
 *
 * Wraps trpc.auth.me to provide user/loading/error state.
 * Compatible with tRPC v11 + @tanstack/react-query v5.
 */

import { trpc } from "@/lib/trpc";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useMemo } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectPath = "/auth" } = options ?? {};

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      meQuery.refetch();
    },
  });

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error: unknown) {
      if (error instanceof TRPCClientError && error.data?.code === "UNAUTHORIZED") return;
      throw error;
    }
  }, [logoutMutation]);

  const state = useMemo(
    () => ({
      user: meQuery.data ?? null,
      loading: meQuery.isLoading,
      error: meQuery.error ?? logoutMutation.error ?? null,
      isAuthenticated: Boolean(meQuery.data),
    }),
    [meQuery.data, meQuery.error, meQuery.isLoading, logoutMutation.error]
  );

  return { ...state, refresh: () => meQuery.refetch(), logout };
}
