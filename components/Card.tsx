"use client";
import { useState, useRef, useEffect } from "react";

export default function DraggableCard() {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const positionRef = useRef({ x: 0, y: 0 });
  const startRef = useRef({ x: 0, y: 0 });
  const [, setRender] = useState(false); // Used to force re-render

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const mouseDown = (e: MouseEvent) => {
      startRef.current = { x: e.clientX, y: e.clientY };

      document.addEventListener("mousemove", mouseMove);
      document.addEventListener("mouseup", mouseUp);
    };

    const mouseMove = (e: MouseEvent) => {
      const dx = e.clientX - startRef.current.x;
      const dy = e.clientY - startRef.current.y;

      positionRef.current = {
        x: positionRef.current.x + dx,
        y: positionRef.current.y + dy,
      };

      startRef.current = { x: e.clientX, y: e.clientY };

      setRender((prev) => !prev); // Forces a re-render to update styles
    };

    const mouseUp = () => {
      document.removeEventListener("mousemove", mouseMove);
      document.removeEventListener("mouseup", mouseUp);
    };

    card.addEventListener("mousedown", mouseDown);

    return () => {
      card.removeEventListener("mousedown", mouseDown);
      document.removeEventListener("mousemove", mouseMove);
      document.removeEventListener("mouseup", mouseUp);
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className="absolute w-40 h-40 bg-blue-500 text-white flex items-center justify-center rounded-md fixed cursor-grab active:cursor-grabbing"
      style={{
        left: `${positionRef.current.x}px`,
        top: `${positionRef.current.y}px`,
      }}
    >
      Drag me
    </div>
  );
}
