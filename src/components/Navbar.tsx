import LogoIcon from "./Logo";
import Avatar from "boring-avatars";
import { GearIcon } from "@phosphor-icons/react";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full py-2 flex items-center justify-between">
      <Link href="/" className="text-xl font-bold block cursor-pointer">
        <LogoIcon />
      </Link>

      <div className="flex items-center gap-3">
        {/* <button className="bg-neutral-50 text-neutral-600 rounded-2xl h-11 w-11 flex items-center justify-center">
          <GearIcon size={18} />
        </button> */}
        <Avatar name="Precious Kayili" />
      </div>
    </nav>
  );
}
