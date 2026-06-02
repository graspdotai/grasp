"use client";

import Navbar from "@/components/Navbar";

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

      <div className="mt-4">
        <div className="bg-neutral-50 rounded-xl w-full aspect-video"></div>
      </div>
    </main>
  );
}
