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
    // Get socket URL from environment or use fallback for Render
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 
                      "https://visionboardwebapp.onrender.com";
    
    console.log("Connecting to socket server:", socketUrl);
    
    // Initialize socket connection with CORS and transport options
    const socketInstance = io(socketUrl, {
      query: { roomId },
      transports: ['websocket', 'polling'],
      withCredentials: false
    });

    // Listen for connection errors
    socketInstance.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected successfully');
    });

    setSocket(socketInstance);

    // Clean up on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, [roomId]);

  if (!socket) {
    return <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
        <p>Connecting to collaboration server...</p>
      </div>
    </div>;
  }

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
} 