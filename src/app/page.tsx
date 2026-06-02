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
      <p>Welcome to Grasp!</p>

      <button
        onClick={createAgent}
        className="mt-4 rounded bg-black px-4 py-2 text-white"
      >
        Create Agent
      </button>
    </main>
  );
}
