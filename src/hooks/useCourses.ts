"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchUserCourses } from "@/lib/courseApi";
import { queryKeys } from "@/lib/queryKeys";
import { getLocalUserId } from "@/lib/userSession";

export function useUserCourses() {
  const userId = getLocalUserId();

  return useQuery({
    queryKey: queryKeys.courses(userId ?? "anonymous"),
    queryFn: () => fetchUserCourses(userId!),
    enabled: Boolean(userId),
  });
}

export function useInvalidateCourses() {
  const queryClient = useQueryClient();
  const userId = getLocalUserId();

  return () => {
    if (userId) {
      void queryClient.invalidateQueries({ queryKey: queryKeys.courses(userId) });
    }
  };
}
