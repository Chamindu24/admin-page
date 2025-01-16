"use client";

import { FlipTextDemo, RetroGridDemo, TypingAnimationDemo } from "@/components/Home/Hero";
import { useRouter } from "next/navigation"; // Use next/navigation for App Router

export default function Page() {
  const router = useRouter(); // Initialize the router

  const handleNavigateToUsers = () => {
    router.push("/users"); // Navigate to the /users page
  };

  return (
    <div className="relative flex h-screen w-full flex-col items-center overflow-hidden bg-gradient-to-br from-black via-gray-900 to-black" >
            <div className="relative flex h-screen w-full flex-col items-center overflow-hidden bg-cover bg-center"
              style={{
              backgroundImage: "url('/bg.jpg')",
              backgroundColor: "rgba(0, 0, 0, 0.9)",
              backgroundBlendMode: "darken",
              }}
            > 
              {/* Hero Text Section */}
              <div className="mt-24">
                <FlipTextDemo />
              </div>

              {/* Retro Grid Background */}
              <div className="absolute inset-0 z-0">
                <RetroGridDemo />
              </div>

              {/* Button Section */}
              <div className="z-10 flex flex-col items-center mt-40">
                <button
                  onClick={handleNavigateToUsers}
                  className="rounded-full bg-gradient-to-r from-black via-gray-800 to-black px-12 py-6 text-white font-bold text-2xl shadow-lg transform transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-2xl  hover:bg-gradient-to-l focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600 border-2 border-white"
                >
                  See All Users
                </button>
              </div>

              {/* Typing Animation Section */}
              <TypingAnimationDemo />
            </div>   
    </div>
  );
}
