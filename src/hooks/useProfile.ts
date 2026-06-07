"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { useAuthContext } from "@/components/AuthProvider";
import type { Tables } from "@/types/database";

type ProfileRow = Tables<"profiles">;

async function fetchProfile(userId: string): Promise<ProfileRow | null> {
  const res = await fetch(`/api/profile?userId=${userId}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.profile ?? null;
}

export function useProfile() {
  // Reads from React context — re-renders when AuthProvider resolves the session,
  // which triggers this query to actually run after login.
  const { userId } = useAuthContext();

  return useQuery({
    queryKey: queryKeys.profile(userId ?? "anonymous"),
    queryFn: () => fetchProfile(userId!),
    enabled: Boolean(userId),
  });
}

export function useInvalidateProfile() {
  const queryClient = useQueryClient();
  const { userId } = useAuthContext();

  return () => {
    if (userId) {
      void queryClient.invalidateQueries({ queryKey: queryKeys.profile(userId) });
    }
  };
}
