"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchCourse, isUuid } from "@/lib/courseApi";
import { queryKeys } from "@/lib/queryKeys";

export function useCourse(sessionId: string) {
  const enabled = isUuid(sessionId);

  return useQuery({
    queryKey: queryKeys.course(sessionId),
    queryFn: () => fetchCourse(sessionId),
    enabled,
  });
}

export function useInvalidateCourse(sessionId: string) {
  const queryClient = useQueryClient();

  return () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.course(sessionId) });
  };
}
