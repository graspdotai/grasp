"use client";

import Navbar from "@/components/Navbar";
import { ArrowRightIcon, PlusIcon } from "@phosphor-icons/react";
import Link from "next/link";
import CourseThumbnail from "@/components/CourseThumbnail";

export default function Home() {
  async function createAgent() {
    try {
      const response = await fetch("/api/aethex/create-agent", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to create agent");
      }

      const agent = await response.json();

      console.log("Agent created:", agent.id);

      return agent;
    } catch (error) {
      console.error("Error creating agent:", error);
    }
  }

  const progress = 40; // 0 = not started, 1–100 = in progress

  return (
    <main className="p-6">
      <Navbar />

      <div className="flex items-center gap-3">
        <h1 className="text-4xl tracking-tight font-bold mt-8 mb-5">Courses</h1>
        <h1 className="text-4xl tracking-tight font-bold mt-8 mb-5 text-neutral-300">
          5
        </h1>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="relative overflow-hidden flex flex-col justify-between bg-primary-600 rounded-2xl w-full aspect-video p-8">
          {/* Decorative rings */}
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full border-[40px] border-white/[0.07]" />
          <div className="absolute -bottom-20 left-10 w-72 h-72 rounded-full border-[50px] border-white/[0.05]" />

          {/* Top row */}
          <div className="relative z-10 flex items-start justify-between">
            <button className="h-12 w-12 rounded-full bg-white/15 flex items-center justify-center text-white hover:bg-white/25 transition-colors">
              <PlusIcon size={22} />
            </button>
            <span className="text-[11px] font-medium tracking-widest text-white/45 uppercase">
              New
            </span>
          </div>

          <div className="relative z-10 flex items-end justify-between">
            <div>
              <p className="font-serif text-[28px] text-white leading-tight">
                Learn something new
              </p>
              <p className="text-sm text-white/60">Start a new course</p>
            </div>
          </div>
        </div>

        <Link
          href="/course/thermodynamics-101"
          className="group block cursor-pointer transition-transform duration-200 hover:-translate-y-0.5"
        >
          <CourseThumbnail title="Thermodynamics 101" progress={progress} />

          <div className="flex items-center w-full justify-between mt-5">
            <div>
              <p className="text-lg font-bold tracking-tight group-hover:text-primary transition-colors">
                Thermodynamics 101
              </p>
              <p className="font-medium text-neutral-500 leading-tight text-sm">
                20 Sections • 2 Notes
              </p>
            </div>

            <div className="bg-neutral-100 rounded-full h-10 w-10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-200 group-hover:scale-105">
              <ArrowRightIcon size={18} />
            </div>
          </div>

          <p className="text-xs font-medium text-neutral-400 mt-2">
            Created on Jan 1, 2024
          </p>
        </Link>
      </div>
    </main>
  );
}
