import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { syncProfileFromAuthUser } from "@/server/profilesService";

function getSafeNextPath(request: NextRequest) {
  const nextPath = request.nextUrl.searchParams.get("next");

  if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return "/";
  }

  return nextPath;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const nextPath = getSafeNextPath(request);
  const redirectUrl = new URL(nextPath, request.url);

  let response = NextResponse.redirect(redirectUrl);

  if (!code) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.redirect(redirectUrl);

        cookiesToSet.forEach(({ name, options, value }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const signInUrl = new URL("/signin", request.url);
    signInUrl.searchParams.set("error", "email_confirmation_failed");

    return NextResponse.redirect(signInUrl);
  }

  const user = sessionData.user;
  if (user) {
    try {
      await syncProfileFromAuthUser({
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata as Record<string, unknown>,
      });
    } catch (syncError) {
      console.warn("Profile sync after OAuth failed:", syncError);
    }
  }

  return response;
}
