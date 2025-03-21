"use client";
import { useState, useRef, useEffect } from "react";
import { useSocket } from "../LiveblocksProvider";

export interface TextProps {
  id: string;
  type?: string;
  x: number;
  y: number;
  text: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  isSelected?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

export default function Text({
  id,
  x,
  y,
  text,
  fontSize = 16,
  fontFamily = "Arial",
  color = "#000000",
  isSelected = false,
  onClick,
}: TextProps) {
  const [position, setPosition] = useState({ x, y });
  const [content, setContent] = useState(text);
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const textRef = useRef<HTMLDivElement>(null);
  const socket = useSocket();

  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isEditing) return;
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
      type: "text",
      ...newPosition,
      text: content,
      fontSize,
      fontFamily,
      color,
    });
  };

  // Handle mouse up to stop dragging
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle double click to edit text
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  // Handle text change during editing
  const handleTextChange = (e: React.FormEvent<HTMLDivElement>) => {
    const newText = e.currentTarget.textContent || "";
    setContent(newText);
  };

  // Handle blur to exit editing mode
  const handleBlur = () => {
    setIsEditing(false);
    
    // Emit text update to other clients
    socket.emit("element:update", {
      id,
      type: "text",
      x: position.x,
      y: position.y,
      text: content,
      fontSize,
      fontFamily,
      color,
    });
  };

  // Handle key press events during editing
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      textRef.current?.blur();
    }
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
      ref={textRef}
      className={`absolute p-1 ${isSelected && !isEditing ? "ring-2 ring-blue-500" : ""}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        fontSize: `${fontSize}px`,
        fontFamily,
        color,
        cursor: isEditing ? "text" : isDragging ? "grabbing" : "grab",
        minWidth: "20px",
        minHeight: "1em",
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      contentEditable={isEditing}
      suppressContentEditableWarning={true}
      onInput={handleTextChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    >
      {content}
    </div>
  );
} 