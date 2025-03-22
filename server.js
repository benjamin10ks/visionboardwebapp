const http = require('http');
const { Server } = require('socket.io');

// Create server without Next.js integration for deployment
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Socket.io server running');
});

const io = new Server(server, {
  cors: {
    // Allow connections from any origin for now - in production you might want to restrict this
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: false,
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  transports: ['websocket', 'polling']
});

// Store active rooms and their elements
const rooms = new Map();

io.on('connection', (socket) => {
  const { roomId } = socket.handshake.query;
  
  console.log(`User connected to room ${roomId} from ${socket.handshake.headers.origin || 'unknown origin'}`);
  socket.join(roomId);

  // Initialize room if it doesn't exist
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      elements: [],
      users: new Set(),
      canvas: { offset: { x: 0, y: 0 }, scale: 1 }
    });
  }

  const room = rooms.get(roomId);
  room.users.add(socket.id);

  // Send current room state to the new user
  socket.emit('room:init', {
    elements: room.elements,
    canvas: room.canvas,
    users: Array.from(room.users)
  });

  // Handle canvas updates
  socket.on('canvas:update', (data) => {
    room.canvas = data;
    socket.to(roomId).emit('canvas:update', data);
  });

  // Handle element creation
  socket.on('element:add', (element) => {
    room.elements.push(element);
    socket.to(roomId).emit('element:add', element);
  });

  // Handle element updates
  socket.on('element:update', (element) => {
    const index = room.elements.findIndex(el => el.id === element.id);
    if (index !== -1) {
      room.elements[index] = element;
      socket.to(roomId).emit('element:update', element);
    }
  });

  // Handle element deletion
  socket.on('element:delete', (elementId) => {
    const index = room.elements.findIndex(el => el.id === elementId);
    if (index !== -1) {
      room.elements.splice(index, 1);
      socket.to(roomId).emit('element:delete', elementId);
    }
  });

  // Handle user cursor position
  socket.on('cursor:update', (position) => {
    socket.to(roomId).emit('cursor:update', { id: socket.id, position });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected from room ${roomId}`);
    room.users.delete(socket.id);
    socket.to(roomId).emit('user:disconnect', socket.id);
    
    // Clean up room if empty
    if (room.users.size === 0) {
      rooms.delete(roomId);
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`);
}); 