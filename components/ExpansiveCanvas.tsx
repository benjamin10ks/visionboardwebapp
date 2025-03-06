"use client";
import { useState, ReactNode, MouseEvent } from "react";

interface ExpansiveCanvasProps {
    children: ReactNode;
}

const ExpansiveCanvas: React.FC<ExpansiveCanvasProps> = ({ children }) => {
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [dragging, setDragging] = useState(false);
    const [start, setStart] = useState({ x: 0, y: 0 });

    const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
        if (e.button !== 1) return; // Only allow middle mouse button to start drag
        e.preventDefault(); // Prevent default middle-click behavior
        setDragging(true);
        setStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    };

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!dragging) return;
        setOffset({ x: e.clientX - start.x, y: e.clientY - start.y });
    };

    const handleMouseUp = () => setDragging(false);

    return (
        <div
            className="absolute top-0 left-0 w-full h-full overflow-hidden active:cursor-grabbing border"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp} // Stop dragging if the cursor leaves the canvas
            style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
        >
            {children}
        </div>
    );
};

export default ExpansiveCanvas;
