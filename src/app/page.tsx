"use client";

import Navbar from "@/components/Navbar";
import { ArrowRightIcon } from "@phosphor-icons/react";

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

  return (
    <main className="p-6">
      <Navbar />

      <div className="flex items-center gap-3">
        <h1 className="text-4xl tracking-tight font-bold mt-8 mb-5">Courses</h1>

        <h1 className="text-4xl tracking-tight font-bold mt-8 mb-5 text-neutral-300">
          5
        </h1>
      </div>
      <div className="mt-4 grid grid-cols-4">
        <div>
          <div className="bg-neutral-50 rounded-2xl w-full aspect-video"></div>
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
