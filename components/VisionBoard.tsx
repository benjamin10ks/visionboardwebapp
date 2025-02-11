"use client";

import { useRef, useState } from "react";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";

interface VisionItem {
  id: number;
  title: string;
  x: number;
  y: number;
}

export default function VisionBoard() {
  const [items, setItems] = useState<VisionItem[]>([
    { id: 1, title: "🏆 Achieve My Goals", x: 50, y: 50 },
    { id: 2, title: "🌍 Travel the World", x: 200, y: 150 },
    { id: 3, title: "📚 Read More Books", x: 400, y: 250 },
  ]);

  // Use refs to attach draggable items without findDOMNode
  const nodeRef = useRef(null);

  const handleStop = (e: DraggableEvent, data: DraggableData, id: number) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, x: data.x, y: data.y } : item
      )
    );
  };

  return (
    <div className="relative w-screen h-screen bg-gray-100 p-4 overflow-hidden">
      <h1 className="text-3xl font-bold text-center mb-4 text-gray-800">
        ✨ My Vision Board ✨
      </h1>
      <div className="relative w-full h-[80vh] bg-white shadow-lg rounded-lg border border-gray-300 p-2">
        {items.map((item) => (
          <Draggable
            key={item.id}
            defaultPosition={{ x: item.x, y: item.y }}
            onStop={(e, data) => handleStop(e, data, item.id)}
            bounds="parent"
            nodeRef={nodeRef} // Attach the ref to avoid findDOMNode issues
          >
            <div
              ref={nodeRef} // Pass the ref to the draggable element
              className="absolute p-4 bg-white shadow-md border border-gray-300 rounded-lg cursor-move hover:scale-105 transition-transform duration-200"
            >
              {item.title}
            </div>
          </Draggable>
        ))}
      </div>
    </div>
  );
}
