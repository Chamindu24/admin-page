import RetroGrid from "@/components/ui/retro-grid"; // Import the RetroGrid component

import { Button } from "@/components/ui/button"; // Import your button component
import FlipText from "@/components/ui/flip-text";



export function RetroGridDemo() {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden">
      <RetroGrid className="opacity-15" />
    </div>
  );
}
  
  export function FlipTextDemo() {
    return (
      <FlipText
      className="text-8xl font-Qwigley tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#ffd700] via-[#c89b3c] to-[#a47f2b] drop-shadow-md"

        word="Celestia'25"
      />
    );
  }
