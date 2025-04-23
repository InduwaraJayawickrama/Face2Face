const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",  // You can restrict this to your Firebase domain if needed
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"],
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Serve your frontend files (public directory)
app.use(express.static("public"));

const rooms = {};

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  let currentRoom = null;

  socket.on("join-room", (roomId, username) => {
    console.log(`User ${socket.id} attempting to join room ${roomId}`);

    currentRoom = roomId;

    if (!rooms[roomId]) {
      rooms[roomId] = [];
    }

    socket.join(roomId);
    rooms[roomId].push({
      id: socket.id,
      username: username || "Guest",
    });

    socket.to(roomId).emit("user-connected", socket.id, username);

    socket.emit(
      "room-users",
      rooms[roomId].filter((user) => user.id !== socket.id)
    );

    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on("send-message", (message) => {
    if (!currentRoom) return;
    
    const user = rooms[currentRoom]?.find(u => u.id === socket.id);
    const username = user ? user.username : "Guest";
    
    const isHost = rooms[currentRoom] && rooms[currentRoom][0]?.id === socket.id;
    const displayName = username + (isHost ? "(Host)" : "");
    
    socket.to(currentRoom).emit("receive-message", {
      user: displayName,
      text: message,
      senderId: socket.id,
    });
  });

  socket.on("offer", (offer, targetId) => {
    console.log(`Forwarding offer from ${socket.id} to ${targetId}`);
    socket.to(targetId).emit("offer", offer, socket.id);
  });

  socket.on("answer", (answer, targetId) => {
    console.log(`Forwarding answer from ${socket.id} to ${targetId}`);
    socket.to(targetId).emit("answer", answer, socket.id);
  });

  socket.on("ice-candidate", (candidate, targetId) => {
    console.log(`Forwarding ICE candidate from ${socket.id} to ${targetId}`);
    socket.to(targetId).emit("ice-candidate", candidate, socket.id);
  });

  socket.on("leave-room", () => {
    handleDisconnect();
  });

  const handleDisconnect = () => {
    if (currentRoom && rooms[currentRoom]) {
      console.log(`User ${socket.id} left room ${currentRoom}`);

      const user = rooms[currentRoom].find((u) => u.id === socket.id);
      const username = user ? user.username : "Guest";

      rooms[currentRoom] = rooms[currentRoom].filter((user) => user.id !== socket.id);

      if (rooms[currentRoom].length === 0) {
        delete rooms[currentRoom];
      } else {
        socket.to(currentRoom).emit("user-disconnected", socket.id, username);
      }

      socket.leave(currentRoom);
      currentRoom = null;
    }
  };

  socket.on("disconnect", handleDisconnect);
});

// Server port from environment variable (set by Railway)
const PORT = process.env.PORT || 3000;  // Default to 3000 for Railway
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
