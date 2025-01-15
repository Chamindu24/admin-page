"use client";

import { ConfettiFireworks, FlipTextDemo, RetroGridDemo } from "@/components/Home/Hero";
import { useRouter } from "next/navigation"; // Use next/navigation for App Router
export default function Page() {
  const router = useRouter(); // Initialize the router

  const handleNavigateToUsers = () => {
    // Navigate to the /users page when the button is clicked
    router.push("/users");
  };

  return (
    <div className="relative flex h-screen w-full flex-col items-center overflow-hidden bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#121212]">
      {/* FlipText Component */}
      <div className="mt-24"> {/* Adjusted margin-top for gap */}
        <FlipTextDemo />
      </div>
      
      {/* Background Component */}
      <div className="absolute inset-0 z-0">
        <RetroGridDemo />
      </div>

      {/* Content Section */}
      <div className="z-10 flex flex-col items-center mt-40">
        {/* Confetti Component */}
        <ConfettiFireworks handleNavigateToUsers={handleNavigateToUsers} />
      </div>
    </div>
  );
}

