"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { SocketProvider } from "@/components/LiveblocksProvider";
import DesignWorkspace from "@/components/DesignWorkspace";

export default function DesignEditor() {
  const searchParams = useSearchParams();
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
  
  if (!roomId) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }
  
  return (
    <SocketProvider roomId={roomId}>
      <DesignWorkspace roomId={roomId} />
    </SocketProvider>
  );
} 