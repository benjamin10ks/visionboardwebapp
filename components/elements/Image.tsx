"use client";
import { useState, useRef, useEffect } from "react";
import { useSocket } from "../LiveblocksProvider";

export interface ImageProps {
  id: string;
  type?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  src: string;
  isSelected?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

export default function Image({
  id,
  type,
  x,
  y,
  width,
  height,
  src,
  isSelected = false,
  onClick,
}: ImageProps) {
  const [position, setPosition] = useState({ x, y });
  const [size, setSize] = useState({ width, height });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);
  const socket = useSocket();

  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Call the onClick handler if provided
    if (onClick) {
      onClick(e);
    }
    
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  // Handle mouse move for dragging
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const newPosition = {
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    };
    
    setPosition(newPosition);
    
    // Emit position update to other clients
    socket.emit("element:update", {
      id,
      type: "image",
      ...newPosition,
      width: size.width,
      height: size.height,
      src,
    });
  };

  // Handle mouse up to stop dragging
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add and remove event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragStart]);

  return (
    <div
      ref={imageRef}
      className={`absolute ${isSelected ? "ring-2 ring-blue-500" : ""}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        cursor: isDragging ? "grabbing" : "grab",
      }}
      onMouseDown={handleMouseDown}
    >
      <img
        src={src}
        alt="User uploaded"
        className="w-full h-full object-cover"
        draggable={false}
      />
      
      {/* Resize handles - only show when selected */}
      {isSelected && (
        <>
          <div className="absolute w-2 h-2 bg-white border border-blue-500 top-0 left-0 -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute w-2 h-2 bg-white border border-blue-500 top-0 right-0 translate-x-1/2 -translate-y-1/2" />
          <div className="absolute w-2 h-2 bg-white border border-blue-500 bottom-0 left-0 -translate-x-1/2 translate-y-1/2" />
          <div className="absolute w-2 h-2 bg-white border border-blue-500 bottom-0 right-0 translate-x-1/2 translate-y-1/2" />
        </>
      )}
    </div>
  );
} 