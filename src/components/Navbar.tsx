"use client";

import LogoIcon from "./Logo";
import Avatar from "boring-avatars";
import { GearIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Navbar() {
  const [email, setEmail] = useState("");

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? "");
    });
  }, []);

  return (
    <nav className="w-full py-2 flex items-center justify-between">
      <Link href="/" className="text-xl font-bold block cursor-pointer">
        <LogoIcon />
      </Link>

      <div className="flex items-center gap-3">
        {email && (
          <span className="hidden sm:block max-w-[190px] truncate text-sm font-medium text-neutral-600">
            {email}
          </span>
        )}
        <Link
          href="/settings"
          className="bg-neutral-50 text-neutral-600 rounded-2xl h-11 w-11 flex items-center justify-center hover:bg-neutral-100 transition-colors"
          aria-label="Settings"
        >
          <GearIcon size={18} />
        </Link>
        <Link href="/profile" aria-label="Profile">
          <Avatar name={email || "Grasp user"} size={44} variant="beam" />
        </Link>
      </div>
    </nav>
  );
}
