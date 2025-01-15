"use client";

import {  FlipTextDemo, RetroGridDemo } from "@/components/Home/Hero";
import { useRouter } from "next/navigation"; // Use next/navigation for App Router
export default function Page() {
  const router = useRouter(); // Initialize the router

  const handleNavigateToUsers = () => {
    // Navigate to the /users page when the button is clicked
    router.push("/users");
  };

  return (
    <div className="relative flex h-screen w-full flex-col items-center overflow-hidden bg-gradient-to-br from-[#000000] via-[#09090c] to-[#000000]">
      {/* FlipText Component */}
      <div className="mt-24 "> {/* Adjusted margin-top for gap */}
        <FlipTextDemo />
      </div>
      
      {/* Background Component */}
      <div className="absolute inset-0 z-0">
        <RetroGridDemo />
      </div>

      {/* Content Section */}
      <div className="z-10 flex flex-col items-center mt-40">
        <button
          onClick={handleNavigateToUsers}
          className="rounded-full bg-gradient-to-r from-[#000000] via-[#21252b] to-[#000000] px-10 py-4 text-white font-bold shadow-lg transform transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-2xl hover:bg-gradient-to-l focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#39414c]"
        >
          Go to Users
        </button>
      </div>

      
    </div>
  );
}
