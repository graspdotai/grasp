import { createClient } from "@/lib/supabase/client";
import {
  setLocalUserId,
  setLocalUserEmail,
  clearLocalUserId,
  clearLocalUserEmail,
} from "@/lib/userSession";

export async function signInWithEmail(email: string, password: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    throw new Error(error.message);
  }

  if (data.user?.id) {
    setLocalUserId(data.user.id);
    if (data.user.email) setLocalUserEmail(data.user.email);
  }

  return data;
}

export async function signUpWithEmail(email: string, password: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    throw new Error(error.message);
  }

  if (data.user?.id) {
    setLocalUserId(data.user.id);
    if (data.user.email) setLocalUserEmail(data.user.email);
  }

  return data;
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  clearLocalUserId();
  clearLocalUserEmail();
}

export async function getClientSession() {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/** Call on app load so localStorage user id matches an existing Supabase session. */
export async function syncLocalUserFromSession(): Promise<void> {
  const session = await getClientSession();
  if (session?.user?.id) {
    setLocalUserId(session.user.id);
    if (session.user.email) setLocalUserEmail(session.user.email);
  }
}
