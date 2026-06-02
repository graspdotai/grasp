"use client";

import Navbar from "@/components/Navbar";
import { ArrowRightIcon, PlusIcon } from "@phosphor-icons/react";

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

          {/* Bottom row */}
          <div className="relative z-10 flex items-end justify-between">
            <div>
              <p className="font-serif text-[28px] text-white leading-tight">
                Learn something new
              </p>
              <p className="text-sm text-white/60">Start a new course</p>
            </div>
          </div>
        </div>
        <div>
          {/* Thumbnail with badge + progress bar */}
          <div className="relative bg-neutral-50 rounded-2xl w-full aspect-video overflow-hidden">
            {/* Top-left badge */}
            {progress === 0 ? (
              <span className="absolute top-3 left-3 text-xs font-semibold text-neutral-500 bg-white/80 backdrop-blur-sm rounded-full px-2.5 py-1">
                Not started
              </span>
            ) : (
              <span className="absolute top-3 left-3 text-xs font-semibold text-primary bg-primary-200/20 backdrop-blur-sm rounded-full px-2.5 py-1">
                {progress}% complete
              </span>
            )}

            {/* Bottom progress bar */}
            {progress > 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-neutral-200">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>

          <div className="flex items-center w-full justify-between mt-5">
            <div>
              <p className="text-lg font-bold tracking-tight">
                Thermodynamics 101
              </p>
              <p className="font-medium text-neutral-500 leading-tight text-sm">
                20 Sections • 2 Notes
              </p>
            </div>

            <button className="bg-neutral-100 rounded-full h-10 w-10 flex items-center justify-center">
              <ArrowRightIcon size={18} />
            </button>
          </div>

          <p className="text-xs font-medium text-neutral-400 mt-2">
            Created on Jan 1, 2024
          </p>
        </div>
      </div>
    </main>
  );
}
