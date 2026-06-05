"use client";

import LogoIcon from "./Logo";
import UserAvatar, { type UserAvatarProfile } from "@/components/UserAvatar";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { resolveDisplayName } from "@/lib/profileDisplay";
import { getLocalUserId } from "@/lib/userSession";
import {
  CaretDownIcon,
  GearIcon,
  GraduationCapIcon,
  UserIcon,
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { useProfile } from "@/hooks/useProfile";

export default function Navbar() {
  const userId = getLocalUserId();
  const { data: profileRow } = useProfile();
  const [profile, setProfile] = useState<UserAvatarProfile | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!profileRow) {
      if (!userId) setProfile(null);
      return;
    }

    setProfile({
      full_name: profileRow.full_name,
      email: profileRow.email,
      avatar_variant: profileRow.avatar_variant,
      avatar_url: profileRow.avatar_url,
    });
  }, [profileRow, userId]);

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

  return (
    <nav className="w-full py-2 flex items-center justify-between">
      <Link href="/" className="text-xl font-bold block cursor-pointer">
        <LogoIcon />
      </Link>

      <div className="flex items-center gap-3">
        {profile ? (
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsOpen((open) => !open)}
              className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 hover:bg-neutral-100 transition-colors"
            >
              <UserAvatar profile={profile} size={40} />
              <div className="flex flex-col leading-tight text-left">
                <p className="text-xs text-neutral-500">
                  What are we learning,
                </p>
                <p className="text-sm font-medium text-neutral-800 hidden sm:inline">
                  {displayName}
                </p>
              </div>
              <CaretDownIcon
                size={12}
                weight="bold"
                className={`text-neutral-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-lg border border-neutral-100 py-2 z-50"
                >
                  {/* User Profile Header */}
                  <div className="px-4 py-2 border-b border-neutral-100">
                    <p className="text-sm font-semibold text-neutral-800 truncate">
                      {displayName}
                    </p>
                    {profile.email && profile.email !== displayName && (
                      <p className="text-xs text-neutral-400 truncate mt-0.5" title={profile.email}>
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

                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <Link
            href="/signin"
            className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            <GraduationCapIcon size={18} weight="duotone" />
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );
}
