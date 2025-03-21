"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { useSocket } from "./LiveblocksProvider";
import Shape, { ShapeProps } from "./elements/Shape";
import Text, { TextProps } from "./elements/Text";
import Image, { ImageProps } from "./elements/Image";
import Canvas from "./Canvas";

type ElementType = ShapeProps | TextProps | ImageProps;

export interface DesignWorkspaceProps {
  roomId: string;
}

export default function DesignWorkspace({ roomId }: DesignWorkspaceProps) {
  const [elements, setElements] = useState<ElementType[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [activeToolType, setActiveToolType] = useState<"select" | "shape" | "text" | "image">("select");
  const [shapeType, setShapeType] = useState<"rectangle" | "circle" | "triangle">("rectangle");
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#3B82F6");
  const [showUsers, setShowUsers] = useState<{ id: string; position: { x: number; y: number } }[]>([]);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const socket = useSocket();
  
  // Handle room initialization from server
  useEffect(() => {
    socket.on("room:init", (data: { elements: ElementType[] }) => {
      setElements(data.elements);
    });
    
    // Listen for new elements
    socket.on("element:add", (element: ElementType) => {
      setElements((prev) => [...prev, element]);
    });
    
    // Listen for updated elements
    socket.on("element:update", (updatedElement: ElementType) => {
      setElements((prev) =>
        prev.map((el) => (el.id === updatedElement.id ? updatedElement : el))
      );
    });
    
    // Listen for deleted elements
    socket.on("element:delete", (elementId: string) => {
      setElements((prev) => prev.filter((el) => el.id !== elementId));
    });
    
    // Listen for cursor updates
    socket.on("cursor:update", (data: { id: string; position: { x: number; y: number } }) => {
      setShowUsers((prev) => {
        const existingIndex = prev.findIndex((user) => user.id === data.id);
        if (existingIndex >= 0) {
          const newUsers = [...prev];
          newUsers[existingIndex] = data;
          return newUsers;
        }
        return [...prev, data];
      });
    });
    
    // Listen for user disconnections
    socket.on("user:disconnect", (userId: string) => {
      setShowUsers((prev) => prev.filter((user) => user.id !== userId));
    });
    
    return () => {
      socket.off("room:init");
      socket.off("element:add");
      socket.off("element:update");
      socket.off("element:delete");
      socket.off("cursor:update");
      socket.off("user:disconnect");
    };
  }, [socket]);
  
  // Track mouse movements to share cursor position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const workspace = workspaceRef.current;
      if (!workspace) return;
      
      const rect = workspace.getBoundingClientRect();
      const position = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      
      socket.emit("cursor:update", position);
    };
    
    const workspace = workspaceRef.current;
    if (workspace) {
      workspace.addEventListener("mousemove", handleMouseMove);
    }
    
    return () => {
      if (workspace) {
        workspace.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, [socket]);
  
  // Handle click on workspace
  const handleWorkspaceClick = useCallback(
    (e: React.MouseEvent) => {
      const rect = workspaceRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Deselect elements when clicking on the workspace
      if (activeToolType === "select") {
        setSelectedElementId(null);
        return;
      }
      
      const newElementId = uuidv4();
      
      if (activeToolType === "shape") {
        const newShape: ShapeProps = {
          id: newElementId,
          type: shapeType,
          x,
          y,
          width: 100,
          height: 100,
          fill: selectedColor,
        };
        
        setElements((prev) => [...prev, newShape]);
        setSelectedElementId(newElementId);
        socket.emit("element:add", newShape);
      } else if (activeToolType === "text") {
        const newText: TextProps = {
          id: newElementId,
          type: "text" as any, // Not in interface but helps with type discrimination
          x,
          y,
          text: "Double click to edit",
          color: selectedColor,
        };
        
        setElements((prev) => [...prev, newText]);
        setSelectedElementId(newElementId);
        socket.emit("element:add", newText);
      }
    },
    [activeToolType, shapeType, selectedColor, socket]
  );
  
  // Handle file upload for images
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (!event.target?.result) return;
        
        const newElementId = uuidv4();
        const rect = workspaceRef.current?.getBoundingClientRect();
        if (!rect) return;
        
        const newImage: ImageProps = {
          id: newElementId,
          type: "image" as any, // Not in interface but helps with type discrimination
          x: rect.width / 2 - 100,
          y: rect.height / 2 - 100,
          width: 200,
          height: 200,
          src: event.target.result.toString(),
        };
        
        setElements((prev) => [...prev, newImage]);
        setSelectedElementId(newElementId);
        socket.emit("element:add", newImage);
      };
      
      reader.readAsDataURL(file);
    },
    [socket]
  );
  
  // Handle element selection
  const handleElementSelect = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedElementId(id);
  }, []);
  
  // Handle delete key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedElementId) {
        setElements((prev) => prev.filter((el) => el.id !== selectedElementId));
        socket.emit("element:delete", selectedElementId);
        setSelectedElementId(null);
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedElementId, socket]);
  
  // Render individual element based on type
  const renderElement = (element: ElementType) => {
    const isSelected = element.id === selectedElementId;
    
    // Check if the element is a shape
    if ("type" in element && 
        (element.type === "rectangle" || element.type === "circle" || element.type === "triangle")) {
      return (
        <Shape
          key={element.id}
          {...element as ShapeProps}
          isSelected={isSelected}
          onClick={(e) => handleElementSelect(element.id, e)}
        />
      );
    }
    
    // Check if the element is text
    if ("text" in element && !("src" in element)) {
      return (
        <Text
          key={element.id}
          {...element as TextProps}
          isSelected={isSelected}
          onClick={(e) => handleElementSelect(element.id, e)}
        />
      );
    }
    
    // Check if the element is an image
    if ("src" in element) {
      return (
        <Image
          key={element.id}
          {...element as ImageProps}
          isSelected={isSelected}
          onClick={(e) => handleElementSelect(element.id, e)}
        />
      );
    }
    
    return null;
  };
  
  // Generate a sharable link
  const getShareableLink = () => {
    const origin = window.location.origin;
    return `${origin}?room=${roomId}`;
  };
  
  // Copy link to clipboard
  const copyLinkToClipboard = () => {
    const link = getShareableLink();
    navigator.clipboard.writeText(link);
    alert("Link copied to clipboard!");
  };
  
  return (
    <div className="flex flex-col h-screen">
      {/* Top bar with tools */}
      <div className="bg-white border-b p-2 flex justify-between items-center">
        <div className="flex space-x-2">
          <button
            className={`p-2 rounded ${activeToolType === "select" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            onClick={() => setActiveToolType("select")}
            title="Select tool"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clipRule="evenodd" />
            </svg>
          </button>
          
          <div className="relative">
            <button
              className={`p-2 rounded ${activeToolType === "shape" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
              onClick={() => setActiveToolType("shape")}
              title="Shape tool"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
            </button>
            
            {activeToolType === "shape" && (
              <div className="absolute top-full left-0 mt-1 bg-white shadow-lg rounded p-2 flex space-x-2 z-10">
                <button
                  className={`w-8 h-8 rounded ${shapeType === "rectangle" ? "bg-blue-200" : "bg-gray-100"}`}
                  onClick={() => setShapeType("rectangle")}
                  title="Rectangle"
                >
                  <div className="w-4 h-4 bg-current mx-auto" />
                </button>
                <button
                  className={`w-8 h-8 rounded ${shapeType === "circle" ? "bg-blue-200" : "bg-gray-100"}`}
                  onClick={() => setShapeType("circle")}
                  title="Circle"
                >
                  <div className="w-4 h-4 rounded-full bg-current mx-auto" />
                </button>
                <button
                  className={`w-8 h-8 rounded ${shapeType === "triangle" ? "bg-blue-200" : "bg-gray-100"}`}
                  onClick={() => setShapeType("triangle")}
                  title="Triangle"
                >
                  <div className="w-0 h-0 mx-auto border-l-[7px] border-r-[7px] border-b-[14px] border-transparent border-b-current" />
                </button>
              </div>
            )}
          </div>
          
          <button
            className={`p-2 rounded ${activeToolType === "text" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            onClick={() => setActiveToolType("text")}
            title="Text tool"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
          </button>
          
          <div className="relative">
            <button
              className={`p-2 rounded ${activeToolType === "image" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
              onClick={() => setActiveToolType("image")}
              title="Image tool"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </button>
            
            {activeToolType === "image" && (
              <input
                type="file"
                className="hidden"
                id="image-upload"
                accept="image/*"
                onChange={handleFileChange}
              />
            )}
          </div>
          
          {activeToolType === "image" && (
            <label 
              htmlFor="image-upload" 
              className="p-2 bg-blue-500 text-white rounded cursor-pointer"
            >
              Upload Image
            </label>
          )}
          
          <div className="relative">
            <button
              className="p-2 rounded bg-gray-200"
              onClick={() => setColorPickerOpen(!colorPickerOpen)}
              title="Color picker"
            >
              <div 
                className="w-5 h-5 rounded"
                style={{ backgroundColor: selectedColor }}
              />
            </button>
            
            {colorPickerOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white shadow-lg rounded p-2 grid grid-cols-4 gap-1 z-10">
                {["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#6366F1", "#EC4899", "#8B5CF6", "#000000"].map((color) => (
                  <button
                    key={color}
                    className="w-6 h-6 rounded-full border"
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      setSelectedColor(color);
                      setColorPickerOpen(false);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={copyLinkToClipboard}
            title="Copy shareable link"
          >
            Share Link
          </button>
        </div>
      </div>
      
      {/* Main workspace area */}
      <div className="flex-1 relative overflow-hidden" ref={workspaceRef}>
        <Canvas roomId={roomId}>
          <div className="absolute top-0 left-0 min-w-[2000px] min-h-[2000px]" onClick={handleWorkspaceClick}>
            {/* Grid background */}
            <div className="absolute top-0 left-0 w-full h-full bg-white bg-opacity-80" style={{ 
              backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }} />
            
            {/* Render all elements */}
            {elements.map(renderElement)}
            
            {/* Render other users' cursors */}
            {showUsers.map((user) => (
              <div
                key={user.id}
                className="absolute pointer-events-none"
                style={{ left: `${user.position.x}px`, top: `${user.position.y}px` }}
              >
                <div className="w-4 h-4 bg-red-500 rounded-full opacity-50" />
              </div>
            ))}
          </div>
        </Canvas>
      </div>
    </div>
  );
} 