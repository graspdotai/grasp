"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { syncLocalUserFromSession } from "@/lib/auth";
import { getLocalUserId } from "@/lib/userSession";

interface AuthContextValue {
  userId: string | null;
}

const AuthContext = createContext<AuthContextValue>({ userId: null });

export function useAuthContext() {
  return useContext(AuthContext);
}

/**
 * On load, restore grasp_user_id from Supabase session if the user is already
 * signed in, then surfaces it via React context so hooks can react to it.
 */
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  // Initialise from localStorage synchronously so the value is available on
  // the very first render (avoids a flicker when the user is already signed in).
  const [userId, setUserId] = useState<string | null>(() => getLocalUserId());

  useEffect(() => {
    // Async session sync — updates state once resolved so downstream hooks
    // re-run their queries with the correct userId.
    void syncLocalUserFromSession().then(() => {
      setUserId(getLocalUserId());
    });
  }, []);

  return (
    <AuthContext.Provider value={{ userId }}>
      {children}
    </AuthContext.Provider>
  );
}
