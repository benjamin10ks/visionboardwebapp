"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { SocketProvider } from "@/components/LiveblocksProvider";
import DesignWorkspace from "@/components/DesignWorkspace";

export default function DesignEditor() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [roomId, setRoomId] = useState<string>("");
  
  useEffect(() => {
    // Check if there's a room ID in the URL
    const roomParam = searchParams.get("room");
    
    if (roomParam) {
      setRoomId(roomParam);
    } else {
      // Generate a new room ID if none is provided
      const newRoomId = uuidv4();
      setRoomId(newRoomId);
      
      // Update URL with the new room ID without page refresh
      const url = new URL(window.location.href);
      url.searchParams.set("room", newRoomId);
      window.history.pushState({}, "", url);
    }
  }, [searchParams]);
  
  // Handle "Create New Board" functionality
  const createNewBoard = () => {
    const newRoomId = uuidv4();
    // Navigate to new URL with the fresh room ID
    router.push(`/?room=${newRoomId}`);
  };
  
  if (!roomId) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }
  
  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b p-2 flex justify-between items-center">
        <div className="font-bold text-lg">Figma Clone</div>
        <button
          onClick={createNewBoard}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Create New Board
        </button>
      </div>
      
      <div className="flex-1">
        <SocketProvider roomId={roomId}>
          <DesignWorkspace roomId={roomId} />
        </SocketProvider>
      </div>
    </div>
  );
} 