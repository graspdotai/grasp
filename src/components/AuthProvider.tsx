"use client";

import { useEffect } from "react";
import { syncLocalUserFromSession } from "@/lib/auth";

/** On load, restore grasp_user_id from Supabase session if the user is already signed in. */
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    void syncLocalUserFromSession();
  }, []);

  return <>{children}</>;
}
