"use client";
import { useRef } from "react";
import ImageUploader from "@/components/ImageUploader";
import Draggable from "react-draggable";

export default function Home() {
  const nodeRef = useRef<HTMLDivElement | null>(null); // Fix: Use HTMLDivElement

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Upload an Image</h1>
      <Draggable nodeRef={nodeRef}>
        <div className="hover: cursor-pointer" ref={nodeRef}>
          <ImageUploader />
        </div>
      </Draggable>
    </main>
  );
}
