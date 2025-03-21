"use client";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

// Create context for the socket
const SocketContext = createContext<Socket | null>(null);

// Hook to use the socket
export const useSocket = () => {
  const socket = useContext(SocketContext);
  if (!socket) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return socket;
};

interface SocketProviderProps {
  children: ReactNode;
  roomId: string;
}

export function SocketProvider({ children, roomId }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Initialize socket connection
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001", {
      query: { roomId },
    });

    setSocket(socketInstance);

    // Clean up on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, [roomId]);

  if (!socket) {
    return <div>Connecting to room...</div>;
  }

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
} 