'use client';

import Links from "@/components/links";
import CanvasPianoScene from "@/components/piano";

export default function Home() {
  return (
    <div className="font-sans grid">
      <main className="flex flex-col items-center sm:items-center p-1">
        <h1 className="text-[32px]">c30.life</h1>
        <p>I don't have the energy to make a website.</p>
        <p>ced</p>
        <CanvasPianoScene />
        <div className="bg-[#3f3f3f] w-full h-1 my-2 rounded" />
        <h1 className="text-[24px]">Links</h1>
        <Links />
      </main>
    </div>
  );
}
