import RetroGrid from "@/components/ui/retro-grid"; // Import the RetroGrid component
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button"; // Import your button component
import FlipText from "@/components/ui/flip-text";



export  function RetroGridDemo() {
    return (
      <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden">
        <RetroGrid className="opacity-20" />
      </div>
    );
  }
  
  // Confetti Component
  export function ConfettiFireworks({ handleNavigateToUsers }: { handleNavigateToUsers: () => void }) {
    const handleClick = () => {
      // Trigger confetti
      const duration = 5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
  
      const randomInRange = (min: number, max: number) =>
        Math.random() * (max - min) + min;
  
      const interval = window.setInterval(() => {
        const timeLeft = animationEnd - Date.now();
  
        if (timeLeft <= 0) {
          return clearInterval(interval);
        }
  
        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);
  
      // Navigate to the users page after confetti is triggered
      handleNavigateToUsers();
    };
  
    return (
      <div className="relative">
        <button
          onClick={handleClick}
          className="rounded-full bg-gradient-to-r from-[#282c34] via-[#21252b] to-[#1a1d23] px-10 py-4 text-white font-bold shadow-lg transform transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-2xl hover:bg-gradient-to-l focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#39414c]"
        >
          Go to Users
        </button>
      </div>
    );
  }
  
  export function FlipTextDemo() {
    return (
      <FlipText
        className="text-5xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#f8f8f2] via-[#cfcfcf] to-[#a1a1a1] animate-gradient-blur drop-shadow-xl md:text-7xl md:leading-[5rem]"
        word="Celestia'24"
      />
    );
  }
  