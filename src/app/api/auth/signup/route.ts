import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { syncProfileFromAuthUser } from "@/server/profilesService";

type CookieToSet = {
  name: string;
  value: string;
  options: Parameters<NextResponse["cookies"]["set"]>[2];
};

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().max(120).optional(),
});

function authCallbackUrl(request: NextRequest) {
  const url = new URL("/auth/callback", request.url);
  url.searchParams.set("next", "/onboarding");
  return url.toString();
}

function applyAuthCookies(response: NextResponse, cookiesToSet: CookieToSet[]) {
  cookiesToSet.forEach(({ name, options, value }) => {
    response.cookies.set(name, value, options);
  });

  return response;
}

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      },
      { status: 500 },
    );
  }

  const body = signupSchema.safeParse(await request.json());

  if (!body.success) {
    return NextResponse.json(
      { ok: false, message: "Enter a valid email and password." },
      { status: 400 },
    );
  }

  const cookiesToSet: CookieToSet[] = [];
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(nextCookiesToSet) {
        nextCookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        cookiesToSet.push(...nextCookiesToSet);
      },
    },
  });

  const fullName = body.data.fullName?.trim();
  const { data, error } = await supabase.auth.signUp({
    email: body.data.email,
    password: body.data.password,
    options: {
      emailRedirectTo: authCallbackUrl(request),
      ...(fullName ? { data: { full_name: fullName } } : {}),
    },
  });

  if (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error.message.toLowerCase().includes("rate limit")
          ? "We could not create your account right now. Please try again shortly."
          : error.message,
      },
      { status: 400 },
    );
  }

  if (!data.session) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "Check your email to confirm your account, then sign in to continue.",
      },
      { status: 409 },
    );
  }

  if (data.user) {
    try {
      await syncProfileFromAuthUser({
        id: data.user.id,
        email: data.user.email,
        user_metadata: data.user.user_metadata as Record<string, unknown>,
      });
    } catch (syncError) {
      console.warn("Profile sync after email signup failed:", syncError);
    }
  }

  return applyAuthCookies(
    NextResponse.json({
      ok: true,
      redirectTo: "/onboarding",
      user: data.user
        ? {
            email: data.user.email,
            id: data.user.id,
          }
        : null,
    }),
    cookiesToSet,
  );
}
