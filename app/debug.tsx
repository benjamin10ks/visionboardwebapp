"use client";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export default function DebugPage() {
  const [status, setStatus] = useState("Initializing...");
  const [socketUrl, setSocketUrl] = useState("");
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get the socket URL from environment variables
    const url = process.env.NEXT_PUBLIC_SOCKET_URL || "Missing URL";
    setSocketUrl(url);

    // Don't try to connect if we don't have a URL
    if (url === "Missing URL") {
      setStatus("Error: No socket URL configured");
      setError("Environment variable NEXT_PUBLIC_SOCKET_URL is not set");
      return;
    }

    setStatus("Connecting...");

    try {
      const socket = io(url, {
        transports: ['websocket', 'polling'],
        withCredentials: false
      });

      socket.on('connect_error', (err) => {
        console.error('Socket connection error:', err);
        setStatus("Connection error");
        setError(err.message);
        setConnected(false);
      });

      socket.on('connect', () => {
        setStatus("Connected");
        setConnected(true);
        setError(null);
      });

      socket.on('disconnect', () => {
        setStatus("Disconnected");
        setConnected(false);
      });

      return () => {
        socket.disconnect();
      };
    } catch (err) {
      setStatus("Error initializing");
      setError(err instanceof Error ? err.message : String(err));
      return () => {};
    }
  }, []);

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Socket.io Connection Debug</h1>
      
      <div className="mb-6 p-4 border rounded bg-gray-50">
        <div className="mb-2">
          <span className="font-semibold">Socket URL:</span> {socketUrl}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Status:</span>
          <span className={`ml-2 px-2 py-1 rounded ${
            connected ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}>
            {status}
          </span>
        </div>
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
            <div className="font-semibold">Error:</div>
            <div className="mt-1">{error}</div>
          </div>
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Troubleshooting Steps:</h2>
        <ol className="list-decimal pl-6 space-y-2">
          <li>Verify your Socket.io server is running on Render</li>
          <li>Check that WebSockets are enabled in your Render configuration</li>
          <li>Ensure your NEXT_PUBLIC_SOCKET_URL environment variable is set correctly</li>
          <li>Make sure CORS is configured to allow your Vercel domain</li>
        </ol>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded">
        <p className="text-sm text-blue-700">
          This page is for debugging only. Access your Figma clone at the <a href="/" className="underline">main page</a>.
        </p>
      </div>
    </div>
  );
} 