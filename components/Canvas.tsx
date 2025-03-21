"use client";
import { useState, useRef, useEffect, ReactNode } from "react";
import { useSocket } from "./LiveblocksProvider";

interface CanvasProps {
  children: ReactNode;
}

export default function Canvas({ children }: CanvasProps) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [start, setStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const socket = useSocket();

  // Handle panning with middle mouse button
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 1) return; // Only allow middle mouse button for panning
    e.preventDefault();
    setDragging(true);
    setStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const newOffset = { x: e.clientX - start.x, y: e.clientY - start.y };
    setOffset(newOffset);
    
    // Broadcast canvas position changes
    socket.emit("canvas:update", { offset: newOffset, scale });
  };

  const handleMouseUp = () => setDragging(false);

  // Handle zooming with wheel
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY * -0.01;
    const newScale = Math.min(Math.max(0.1, scale + delta), 5);
    setScale(newScale);
    
    // Broadcast scale changes
    socket.emit("canvas:update", { offset, scale: newScale });
  };

  // Listen for canvas updates from other users
  useEffect(() => {
    socket.on("canvas:update", (data: { offset: { x: number, y: number }, scale: number }) => {
      if (!dragging) {
        setOffset(data.offset);
        setScale(data.scale);
      }
    });

    return () => {
      socket.off("canvas:update");
    };
  }, [socket, dragging]);

  return (
    <div 
      className="relative w-full h-full overflow-hidden bg-gray-100"
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      <div 
        className="absolute origin-center" 
        style={{ 
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          transition: dragging ? 'none' : 'transform 0.1s ease-out',
        }}
      >
        {children}
      </div>
    </div>
  );
} 