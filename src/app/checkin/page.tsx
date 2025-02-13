"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";

export default function EnterNicPage() {
  const [nic, setNic] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false); // For loading state
  const router = useRouter();

  const handleSubmit = () => {
    if (nic.trim() === "") {
      setMessage("Please enter a NIC number.");
      return;
    }
    setIsLoading(true); // Start loading animation
    setTimeout(() => {
      router.push(`/checkin/${nic}`);
    }, 1000); // Simulate a delay for a smoother transition
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white px-6">
      {/* Animated Header */}
      <h1 className="text-4xl tracking-wider font-bold text-yellow-400 mb-6 animate-bounce">
        Check-In 
      </h1>

      {/* NIC Input Card */}
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md text-center transform transition-transform hover:scale-105 duration-300">
        <h2 className="text-2xl font-semibold tracking-wider mb-8 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
          Enter NIC Number
        </h2>

        {/* Input Field */}
        <input
          type="text"
          value={nic}
          onChange={(e) => setNic(e.target.value)}
          placeholder="Enter your NIC number"
          className="w-full p-4 mb-6 text-black rounded-xl outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300"
        />

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="flex items-center justify-center w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-black py-4 rounded-xl font-semibold text-xl uppercase transition-transform hover:scale-105 hover:shadow-lg active:scale-95 duration-300"
        >
          {isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <>
              Submit <ArrowRight className="ml-2 h-6 w-6" />
            </>
          )}
        </button>
      </div>

      {/* Error Message */}
      {message && (
        <div className="mt-6 p-4 bg-red-500/20 border border-red-500 rounded-xl text-red-400 font-semibold animate-fadeIn">
          {message}
        </div>
      )}

      {/* Background Animation */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 w-32 h-32 bg-yellow-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-yellow-500/20 rounded-full blur-3xl animate-float-delay"></div>
      </div>
    </div>
  );
}