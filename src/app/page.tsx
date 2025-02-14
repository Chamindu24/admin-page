"use client";

import { FlipTextDemo, RetroGridDemo, TypingAnimationDemo } from "@/components/Home/Hero";
import { useRouter } from "next/navigation"; // Use next/navigation for App Router
import { motion } from "framer-motion";






export default function Page() {
  const router = useRouter(); // Initialize the router

  const handleNavigateToUsers = () => {
    router.push("/users"); // Navigate to the /users page
  };
  const handleNavigateTocheckCoun = () => {
    router.push("/checkCount"); // Navigate to the /users page
  };
  const handleNavigateTocheckIn = () => {
    router.push("/checkin"); // Navigate to the /users page
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
                <motion.div
                  initial={{ opacity: 0, y: -50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1 }}
                  className="mt-32"
                >
                  <FlipTextDemo />
                </motion.div>
              
              {/* Retro Grid Background */}
              <div className="absolute inset-0 z-0">
                <RetroGridDemo />
              </div>

              {/* Button Section */}
             {/* Button Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="z-10 flex flex-col items-center justify-center mt-40"
        >
          <div className="flex flex-col md:flex-row md:space-x-8 space-y-8 md:space-y-0 items-center justify-center">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleNavigateToUsers}
              className="rounded-full bg-gradient-to-r from-black via-gray-800 to-black px-12 py-6 text-white font-bold text-2xl shadow-lg transform transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-2xl hover:bg-gradient-to-l focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600 border-2 border-white"
            >
              Browse Users
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleNavigateTocheckIn}
              className="rounded-full bg-gradient-to-r from-black via-gray-800 to-black px-10 py-8 text-white font-bold text-3xl shadow-lg transform transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-2xl hover:bg-gradient-to-l focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600 border-2 border-white"
            >
              User Verification
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleNavigateTocheckCoun}
              className="rounded-full bg-gradient-to-r from-black via-gray-800 to-black px-12 py-6 text-white font-bold text-2xl shadow-lg transform transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-2xl hover:bg-gradient-to-l focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600 border-2 border-white"
            >
              User Analytics
            </motion.button>
          </div>
        </motion.div>

              {/* Typing Animation Section */}
              <TypingAnimationDemo />
            </div> 
            <footer className="w-full  text-center text-black  tracking-widest font-mono bg-gradient-to-r from-yellow-400 via-yellow-400 to-yellow-400 py-1 mb-1 text-base md:text-base">
              &copy; UoMLeos 2025, All rights reserved.
            </footer>  
    </div>
  );
}
