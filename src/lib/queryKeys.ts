export const queryKeys = {
  courses: (userId: string) => ["courses", userId] as const,
  course: (sessionId: string) => ["course", sessionId] as const,
  profile: (userId: string) => ["profile", userId] as const,
};
