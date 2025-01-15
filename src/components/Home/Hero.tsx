import RetroGrid from "@/components/ui/retro-grid"; // Import the RetroGrid component

import { Button } from "@/components/ui/button"; // Import your button component
import FlipText from "@/components/ui/flip-text";



export function RetroGridDemo() {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden">
      <RetroGrid className="opacity-20" />
    </div>
  );
}
  
  export function FlipTextDemo() {
    return (
      <FlipText
        className="text-5xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#f8f8f2] via-[#cfcfcf] to-[#a1a1a1] animate-gradient-blur drop-shadow-xl md:text-7xl md:leading-[5rem]"
        word="Celestia'25"
      />
    );
  }
  