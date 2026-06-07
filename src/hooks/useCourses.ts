"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchUserCourses } from "@/lib/courseApi";
import { queryKeys } from "@/lib/queryKeys";
import { useAuthContext } from "@/components/AuthProvider";

export function useUserCourses() {
  const { userId } = useAuthContext();

  return useQuery({
    queryKey: queryKeys.courses(userId ?? "anonymous"),
    queryFn: () => fetchUserCourses(userId!),
    enabled: Boolean(userId),
  });
}

export function useInvalidateCourses() {
  const queryClient = useQueryClient();
  const { userId } = useAuthContext();

  return () => {
    if (userId) {
      void queryClient.invalidateQueries({ queryKey: queryKeys.courses(userId) });
    }
  };
}
