import { useState, forwardRef } from "react";
import Draggable, { DraggableEvent, DraggableData } from "react-draggable";
import Image from "next/image";
import ReactDOM from "react-dom";

interface DraggableImageProps {
    src: string;
    id: number;
}

// Wrapping with forwardRef to ensure compatibility
const DraggableImage = forwardRef<HTMLImageElement, DraggableImageProps>(({ src, id }, ref) => {
    const [position, setPosition] = useState({ x: 100, y: 100 });

    const handleStop = (_e: DraggableEvent, data: DraggableData) => {
        setPosition({ x: data.x, y: data.y });
    };

    return (
        <Draggable defaultPosition={position} onStop={handleStop}>
            <img ref={ref} src={src} alt="Draggable" className="w-32 h-32 cursor-pointer" />
        </Draggable>
    );
});

DraggableImage.displayName = "DraggableImage"; // Required when using forwardRef

export default DraggableImage;
