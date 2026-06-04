"use client";

import LogoIcon from "./Logo";
import UserAvatar, { type UserAvatarProfile } from "@/components/UserAvatar";
import { GearIcon } from "@phosphor-icons/react";
import { SignOutIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { resolveDisplayName } from "@/lib/profileDisplay";
import { getLocalUserId } from "@/lib/userSession";
import Avatar from "boring-avatars";

export default function Navbar() {
  const [profile, setProfile] = useState<UserAvatarProfile | null>(null);
  const router = useRouter();
  const [email, setEmail] = useState("");

  useEffect(() => {
    const userId = getLocalUserId();
    const supabase = createClient();

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setProfile(null);
        return;
      }

      const { data: row } = await supabase
        .from("profiles")
        .select("full_name, email, avatar_variant, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      setProfile({
        full_name: row?.full_name ?? null,
        email: row?.email ?? user.email ?? null,
        avatar_variant: row?.avatar_variant ?? null,
        avatar_url: row?.avatar_url ?? null,
      });
    }

    void load();

    if (userId) {
      fetch(`/api/profile?userId=${userId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.profile) setProfile(data.profile);
        })
        .catch(() => undefined);
    }
  }, []);

  const displayName = resolveDisplayName({
    fullName: profile?.full_name,
    email: profile?.email,
  });
  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/signin");
    router.refresh();
  }

  return (
    <nav className="w-full py-2 flex items-center justify-between">
      <Link href="/" className="text-xl font-bold block cursor-pointer">
        <LogoIcon />
      </Link>

      <div className="flex items-center gap-3">
        {profile && (
          <span className="hidden sm:block max-w-[160px] truncate text-sm font-medium text-neutral-600">
            {displayName}
          </span>
        )}
        <Link
          href="/settings"
          aria-label="Settings"
        >
          <GearIcon size={18} />
        </Link>
        {/* <Link href="/profile" aria-label="Profile">
          <UserAvatar profile={profile} size={44} />
        </Link> */}
        <Avatar name={email || "Grasp user"} />
        <button
          className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-50 text-neutral-600 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
          onClick={handleSignOut}
          title="Sign out"
          type="button"
        >
          <SignOutIcon aria-hidden size={18} />
        </button>
      </div>
    </nav>
  )
}
