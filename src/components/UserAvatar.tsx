"use client";

import BoringAvatar from "boring-avatars";
import {
  resolveAvatarVariant,
  type AvatarVariant,
} from "@/lib/avatar";
import { resolveDisplayName } from "@/lib/profileDisplay";

export type UserAvatarProfile = {
  full_name?: string | null;
  email?: string | null;
  avatar_variant?: string | null;
  avatar_url?: string | null;
};

interface UserAvatarProps {
  profile?: UserAvatarProfile | null;
  email?: string | null;
  size?: number;
  variant?: AvatarVariant;
  className?: string;
}

export default function UserAvatar({
  profile,
  email,
  size = 44,
  variant: variantOverride,
  className,
}: UserAvatarProps) {
  const resolvedEmail = profile?.email ?? email ?? null;
  const name = resolveDisplayName({
    fullName: profile?.full_name,
    email: resolvedEmail,
  });
  const variant =
    variantOverride ??
    (profile ? resolveAvatarVariant(profile) : "marble");

  const imageUrl = profile?.avatar_url?.trim();
  if (imageUrl?.startsWith("http")) {
    return (
      <img
        src={imageUrl}
        alt=""
        width={size}
        height={size}
        className={`rounded-full object-cover ${className ?? ""}`}
      />
    );
  }

  return (
    <BoringAvatar
      name={name}
      size={size}
      variant={variant}
      className={className}
    />
  );
}
