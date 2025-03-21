const { spawn } = require("child_process");
const path = require("path");

// Start the Next.js app
const nextApp = spawn("npm", ["run", "dev"], {
  stdio: "inherit",
  shell: true,
});

// Start the Socket.io server
const socketServer = spawn("node", ["server.js"], {
  stdio: "inherit",
  shell: true,
});

// Handle process exit
process.on("SIGINT", () => {
  console.log("Shutting down...");
  nextApp.kill();
  socketServer.kill();
  process.exit();
});

console.log("Both servers are running!");
console.log("Next.js app: http://localhost:3000");
console.log("Socket.io server: http://localhost:3001"); 