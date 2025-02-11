"use client";
import { useRef } from "react";
import ImageUploader from "@/components/ImageUploader"; // Adjust path if necessary
import Draggable from "react-draggable";

export default function Home() {
  const nodeRef = useRef(null); // Create a ref for Draggable

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Upload an Image</h1>
      <Draggable nodeRef={nodeRef}>
        <div ref={nodeRef}>
          <ImageUploader />
        </div>
      </Draggable>
    </main>
  );
}
