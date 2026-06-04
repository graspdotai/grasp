"use client";

import LogoIcon from "./Logo";
import UserAvatar, { type UserAvatarProfile } from "@/components/UserAvatar";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { resolveDisplayName } from "@/lib/profileDisplay";
import { getLocalUserId } from "@/lib/userSession";
import { signOut } from "@/lib/auth";
import { useRouter } from "next/navigation";
import {
  CaretDownIcon,
  GearIcon,
  GraduationCapIcon,
  SignOutIcon,
  UserIcon,
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [profile, setProfile] = useState<UserAvatarProfile | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSignOut() {
    setIsOpen(false);
    await signOut();
    router.push("/signin");
  }

  return (
    <nav className="w-full py-2 flex items-center justify-between">
      <Link href="/" className="text-xl font-bold block cursor-pointer">
        <LogoIcon />
      </Link>

      <div className="flex items-center gap-3">
        {profile ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-1.5 p-1 rounded-full hover:bg-neutral-50 active:scale-95 transition-all duration-200 focus:outline-none cursor-pointer"
              aria-haspopup="true"
              aria-expanded={isOpen}
            >
              <UserAvatar profile={profile} size={42} />
              {/* <CaretDownIcon
                size={14}
                className={`text-neutral-500 transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              /> */}
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute right-0 mt-2 w-56 origin-top-right bg-white border border-neutral-100 rounded-2xl shadow-xl py-2 z-50 focus:outline-none"
                >
                  {/* User Profile Header */}
                  <div className="px-4 py-2 border-b border-neutral-100">
                    <p className="text-sm font-semibold text-neutral-800 truncate">
                      {displayName}
                    </p>
                    {profile.email && profile.email !== displayName && (
                      <p
                        className="text-xs text-neutral-400 truncate mt-0.5"
                        title={profile.email}
                      >
                        {profile.email}
                      </p>
                    )}
                  </div>

                  {/* Menu items */}
                  <div className="p-1.5 flex flex-col gap-0.5">
                    <Link
                      href="/"
                      className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-neutral-600 rounded-xl hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <GraduationCapIcon
                        size={16}
                        className="text-neutral-400"
                      />
                      <span>My Courses</span>
                    </Link>

                    <Link
                      href="/profile"
                      className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-neutral-600 rounded-xl hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <UserIcon size={16} className="text-neutral-400" />
                      <span>Profile</span>
                    </Link>

                    <Link
                      href="/settings"
                      className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-neutral-600 rounded-xl hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <GearIcon size={16} className="text-neutral-400" />
                      <span>Settings</span>
                    </Link>

                    <hr className="my-1 border-neutral-100" />

                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-red-600 rounded-xl hover:bg-red-50 text-left transition-colors cursor-pointer"
                    >
                      <SignOutIcon size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <UserAvatar profile={null} size={36} />
        )}
      </div>
    </nav>
  );
}
