const functions = require("firebase-functions");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Optional: serve static files (not needed unless you're serving public files via backend too)
app.use(express.static(__dirname + "/../public"));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"],
  pingTimeout: 60000,
  pingInterval: 25000,
});

const rooms = {};

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  let currentRoom = null;

  socket.on("join-room", (roomId, username) => {
    currentRoom = roomId;
    if (!rooms[roomId]) rooms[roomId] = [];

    socket.join(roomId);
    rooms[roomId].push({ id: socket.id, username: username || "Guest" });

    socket.to(roomId).emit("user-connected", socket.id, username);
    socket.emit(
      "room-users",
      rooms[roomId].filter((u) => u.id !== socket.id)
    );
  });

  socket.on("send-message", (message) => {
    if (!currentRoom) return;
    const user = rooms[currentRoom]?.find((u) => u.id === socket.id);
    const username = user ? user.username : "Guest";
    const isHost = rooms[currentRoom][0]?.id === socket.id;
    const displayName = username + (isHost ? "(Host)" : "");
    socket.to(currentRoom).emit("receive-message", {
      user: displayName,
      text: message,
      senderId: socket.id,
    });
  });

  socket.on("offer", (offer, targetId) => {
    socket.to(targetId).emit("offer", offer, socket.id);
  });

  socket.on("answer", (answer, targetId) => {
    socket.to(targetId).emit("answer", answer, socket.id);
  });

  socket.on("ice-candidate", (candidate, targetId) => {
    socket.to(targetId).emit("ice-candidate", candidate, socket.id);
  });

  socket.on("leave-room", () => {
    handleDisconnect();
  });

  const handleDisconnect = () => {
    if (currentRoom && rooms[currentRoom]) {
      const user = rooms[currentRoom].find((u) => u.id === socket.id);
      const username = user ? user.username : "Guest";
      rooms[currentRoom] = rooms[currentRoom].filter((u) => u.id !== socket.id);
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

// 👇 THIS is what lets Firebase use your server
exports.api = functions.https.onRequest((req, res) => {
  server.emit("request", req, res);
});
