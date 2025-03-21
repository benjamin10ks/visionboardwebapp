"use client";
import { useState, useRef, useEffect } from "react";
import { useSocket } from "../LiveblocksProvider";

export interface ShapeProps {
  id: string;
  type: "rectangle" | "circle" | "triangle";
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  rotation?: number;
  isSelected?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

export default function Shape({
  id,
  type,
  x,
  y,
  width,
  height,
  fill,
  stroke = "#000000",
  strokeWidth = 1,
  rotation = 0,
  isSelected = false,
  onClick,
}: ShapeProps) {
  const [position, setPosition] = useState({ x, y });
  const [size] = useState({ width, height });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const shapeRef = useRef<HTMLDivElement>(null);
  const socket = useSocket();

  // Shape rendering based on type
  const renderShape = () => {
    switch (type) {
      case "rectangle":
        return <div className="w-full h-full" style={{ backgroundColor: fill, border: `${strokeWidth}px solid ${stroke}` }} />;
      case "circle":
        return <div className="w-full h-full rounded-full" style={{ backgroundColor: fill, border: `${strokeWidth}px solid ${stroke}` }} />;
      case "triangle":
        return (
          <div className="w-full h-full overflow-hidden">
            <div
              className="w-0 h-0"
              style={{
                borderLeft: `${size.width / 2}px solid transparent`,
                borderRight: `${size.width / 2}px solid transparent`,
                borderBottom: `${size.height}px solid ${fill}`,
              }}
            />
          </div>
        );
      default:
        return null;
    }
  };

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
      type,
      ...newPosition,
      width: size.width,
      height: size.height,
      fill,
      stroke,
      strokeWidth,
      rotation,
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
  }, [isDragging, dragStart, handleMouseMove]);

  return (
    <div
      ref={shapeRef}
      className={`absolute transform-gpu ${isSelected ? "ring-2 ring-blue-500" : ""}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        transform: `rotate(${rotation}deg)`,
        cursor: isDragging ? "grabbing" : "grab",
      }}
      onMouseDown={handleMouseDown}
    >
      {renderShape()}
      
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