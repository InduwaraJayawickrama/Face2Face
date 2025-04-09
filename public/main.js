const socket = io({
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});
let localStream;
let peerConnections = {}; 
let roomId;
let username;
let isHost = false;
let peerUsernames = {};
let screenStream = null;
let isScreenSharing = false;

// DOM Elements
const localVideo = document.getElementById("localVideo");
const joinButton = document.getElementById("joinButton");
const micButton = document.getElementById("micButton");
const cameraButton = document.getElementById("cameraButton");
const chatbox = document.getElementById("chatbox");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const pageIdentifier = document.getElementById("page-identifier");

const iceServers = {
  iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
  ],
};

// Join a room
async function joinRoom() {
  roomId = document.getElementById("room").value.trim();
  if (!roomId) {
      alert("Please enter a Room ID!");
      return;
  }

  if (!username) {
      username = prompt("Enter your name:") || "Guest";
  }

  try {
      Object.keys(peerConnections).forEach((userId) => {
          if (peerConnections[userId]) {
              peerConnections[userId].close();
              delete peerConnections[userId];
          }
          const oldVideoContainer = document.getElementById(`container-${userId}`);
          if (oldVideoContainer) {
              oldVideoContainer.remove();
          }
      });

      localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
      });

      localVideo.srcObject = localStream;

      socket.emit("join-room", roomId, username);

      document.getElementById("controls").style.display = "flex";
      document.getElementById("chat").style.display = "flex";
      
      document.getElementById("join-section").style.display = "none";

      console.log("Joined room:", roomId);
  } catch (error) {
      console.error("Error accessing media devices:", error);
      alert("Could not access camera or microphone. Please check permissions.");
  }
}

// Create a peer connection for a new user
function createPeerConnection(userId) {
  // Create new RTCPeerConnection
  const peerConnection = new RTCPeerConnection(iceServers);

  peerConnection.onconnectionstatechange = () => {
      console.log(
          `Connection state with ${userId}:`,
          peerConnection.connectionState
      );
  };

  peerConnection.oniceconnectionstatechange = () => {
      console.log(
          `ICE connection state with ${userId}:`,
          peerConnection.iceConnectionState
      );
  };

  localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream);
  });

  peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
          console.log(`Sending ICE candidate to ${userId}`);
          socket.emit("ice-candidate", event.candidate, userId);
      }
  };

  peerConnection.ontrack = (event) => {
      console.log(`Received track from ${userId}`);

      const existingContainer = document.getElementById(`container-${userId}`);
      if (existingContainer) {
          existingContainer.remove();
      }

      const videoContainer = document.createElement("div");
      videoContainer.id = `container-${userId}`;
      videoContainer.className = "video-container";

      const remoteVideoElement = document.createElement("video");
      remoteVideoElement.id = `remote-${userId}`;
      remoteVideoElement.autoplay = true;
      remoteVideoElement.playsInline = true;

      videoContainer.appendChild(remoteVideoElement);

      const usernameLabel = document.createElement("div");
      usernameLabel.className = "username-label";
      usernameLabel.textContent = peerUsernames[userId] || "User";
      videoContainer.appendChild(usernameLabel);

      document.getElementById("videos").appendChild(videoContainer);

      remoteVideoElement.srcObject = event.streams[0];
  };

  peerConnections[userId] = peerConnection;
  return peerConnection;
}

function makeChatDraggable() {
  const chat = document.getElementById("chat");
  const header = document.querySelector(".chat-header");
  let wasDragged = false;

  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  
  header.onmousedown = dragMouseDown;
  
  function dragMouseDown(e) {
      // Skip if chat is minimized or if the click is on the minimize button
      if (/*chat.classList.contains("chat-minimized") ||*/ e.target.id === "minimizeChatButton") {
          return;
      }
      
      e = e || window.event;
      e.preventDefault();

      wasDragged = false;
      // Get the mouse cursor position at startup
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      // Call a function whenever the cursor moves
      document.onmousemove = elementDrag;
  }
  
  function elementDrag(e) {
      wasDragged = true;
      if (chat.classList.contains("chat-minimized")) {
        return;
      }

      e = e || window.event;
      e.preventDefault();
      // Calculate the new cursor position
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      // Set the element's new position
      chat.style.top = (chat.offsetTop - pos2) + "px";
      chat.style.left = (chat.offsetLeft - pos1) + "px";
  }
  
  
  function closeDragElement() {
      // Stop moving when mouse button is released
      document.onmouseup = null;
      document.onmousemove = null;
  }

  header.addEventListener("click", function(e) {
    if (chat.classList.contains("chat-minimized") && 
        e.target.id !== "minimizeChatButton" &&
        !wasDragged) { // Only toggle if not dragged
        toggleChatVisibility();
    }
    // Reset dragged flag
    wasDragged = false; 
});
}

// Toggle microphone
function toggleMic() {
  const audioTrack = localStream.getAudioTracks()[0];
  audioTrack.enabled = !audioTrack.enabled;

  if (audioTrack.enabled) {
      micButton.innerHTML = '<i class="fas fa-microphone"></i>';
      micButton.classList.remove("muted");
  } else {
      micButton.innerHTML = '<i class="fas fa-microphone-slash"></i>';
      micButton.classList.add("muted");
  }
}

// Toggle camera
function toggleCamera() {
  const videoTrack = localStream.getVideoTracks()[0];
  videoTrack.enabled = !videoTrack.enabled;

  if (videoTrack.enabled) {
      cameraButton.innerHTML = '<i class="fas fa-video"></i>';
      cameraButton.classList.remove("muted");
  } else {
      cameraButton.innerHTML = '<i class="fas fa-video-slash"></i>';
      cameraButton.classList.add("muted");
  }
}

function toggleChatVisibility() {
  const chat = document.getElementById("chat");
  chat.classList.toggle("chat-minimized");
  
  // If chat was minimized and is now being maximized
  if (!chat.classList.contains("chat-minimized")) {
      // Restore the chat header with minimize button
      const chatHeader = document.querySelector(".chat-header");
      chatHeader.innerHTML = "";
      
      const textSpan = document.createElement("span");
      textSpan.textContent = "Chat";
      
      const minimizeButton = document.createElement("button");
      minimizeButton.id = "minimizeChatButton";
      minimizeButton.className = "minimize-button";
      minimizeButton.textContent = "-";
      minimizeButton.onclick = function(e) {
        e.stopPropagation(); // Prevent event from bubbling up
        toggleChatVisibility();
    };
      
      chatHeader.appendChild(textSpan);
      chatHeader.appendChild(minimizeButton);
  }

  else {
    // If minimizing, update header for minimized state
    const chatHeader = document.querySelector(".chat-header");
    chatHeader.innerHTML = "";
    
    const chatIcon = document.createElement("i");
    chatIcon.className = "fas fa-comments chat-icon";
    chatHeader.appendChild(chatIcon);
}
}

// End the call
function endCall() {
  Object.values(peerConnections).forEach((connection) => {
      connection.close();
  });

  if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
  }

  if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      screenStream = null;
  }

  socket.emit("leave-room");

  window.location.reload();
}

// Send a chat message
function sendMessage() {
  const message = messageInput.value.trim();
  if (!message) return;

  // Send to server
  socket.emit("send-message", message);

  displayMessage({
      user: username + (isHost ? "(Host)" : ""),
      text: message,
      senderId: socket.id
  });

  messageInput.value = "";
}

// Display a received message
function displayMessage(data) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message");

  if (data.senderId === socket.id) {
      messageDiv.classList.add("my-message");
  } else {
      messageDiv.classList.add("receiver-message");
  }

  const senderElement = document.createElement("div");
  senderElement.classList.add("sender-name");
  senderElement.textContent = data.user;
  
  const textElement = document.createElement("div");
  textElement.textContent = data.text;
  
  messageDiv.appendChild(senderElement);
  messageDiv.appendChild(textElement);
  
  chatbox.appendChild(messageDiv);

  chatbox.scrollTop = chatbox.scrollHeight;
}

// Update setupPageUI function
function setupPageUI(isFirstUser) {
  isHost = isFirstUser;
  
  if (isFirstUser) {
      document.body.classList.add("host-page");
      document.querySelector(".username-label").textContent = username + " (Host)";
      document.getElementById("page-identifier").textContent = `${username}'s page (Host)`;
  } else {
      document.body.classList.add("receiver-page");
      document.getElementById("page-identifier").textContent = `${username}'s page`;
  }
}

// Toggle screen share
async function toggleScreenShare() {
  const screenButton = document.getElementById('screenShareButton');

  try {
      if (!isScreenSharing) {
          screenStream = await navigator.mediaDevices.getDisplayMedia({
              video: true,
              audio: true
          });

          const videoTrack = screenStream.getVideoTracks()[0];
          Object.values(peerConnections).forEach((pc) => {
              const sender = pc.getSenders().find(s => s.track?.kind === 'video');
              if (sender) {
                  sender.replaceTrack(videoTrack);
              }
          });

          localVideo.srcObject = screenStream;

          screenButton.innerHTML = '<i class="fas fa-stop-circle"></i> <span>Stop Sharing</span>';
          screenButton.classList.add('screen-sharing');
          isScreenSharing = true;

          screenStream.getVideoTracks()[0].onended = () => {
              stopScreenSharing();
          };
      } else {
          stopScreenSharing();
      }
  } catch (error) {
      console.error('Error sharing screen:', error);
      alert('Unable to share screen: ' + error.message);
  }
}

// Helper function for stopping screen share
async function stopScreenSharing() {
  if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      screenStream = null;
  }

  const videoTrack = localStream.getVideoTracks()[0];
  Object.values(peerConnections).forEach((pc) => {
      const sender = pc.getSenders().find(s => s.track?.kind === 'video');
      if (sender) {
          sender.replaceTrack(videoTrack);
      }
  });

  localVideo.srcObject = localStream;

  const screenButton = document.getElementById('screenShareButton');
  screenButton.innerHTML = '<i class="fas fa-desktop"></i> <span>Share Screen</span>';
  screenButton.classList.remove('screen-sharing');
  isScreenSharing = false;
}

// Socket event handlers
socket.on("user-connected", async (userId, userName) => {
  console.log(`User connected: ${userId} (${userName})`);
  peerUsernames[userId] = userName; 

  try {
      const peerConnection = createPeerConnection(userId);
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      console.log(`Sending offer to ${userId}`);
      socket.emit("offer", offer, userId);
  } catch (error) {
      console.error("Error in user-connected handler:", error);
  }
});

socket.on("room-users", async (users) => {
  console.log("Existing users in room:", users);

  setupPageUI(users.length === 0);

  users.forEach((user) => {
      peerUsernames[user.id] = user.username;
      createPeerConnection(user.id);
  });
});

socket.on("offer", async (offer, senderId) => {
  console.log("Received offer from:", senderId);

  try {
      let peerConnection = peerConnections[senderId];
      if (!peerConnection) {
          peerConnection = createPeerConnection(senderId);
      }

      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      console.log(`Sending answer to ${senderId}`);
      socket.emit("answer", answer, senderId);
  } catch (error) {
      console.error("Error handling offer:", error);
  }
});

socket.on("answer", async (answer, senderId) => {
  console.log("Received answer from:", senderId);

  const peerConnection = peerConnections[senderId];
  if (peerConnection) {
      try {
          await peerConnection.setRemoteDescription(
              new RTCSessionDescription(answer)
          );
      } catch (error) {
          console.error("Error handling answer:", error);
      }
  }
});

socket.on("ice-candidate", async (candidate, senderId) => {
  console.log("Received ICE candidate from:", senderId);

  const peerConnection = peerConnections[senderId];
  if (peerConnection) {
      try {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
          console.error("Error adding ICE candidate:", error);
      }
  }
});

socket.on("user-disconnected", (userId, userName) => {
  console.log(`User ${userName} (${userId}) disconnected`);

  if (peerConnections[userId]) {
      peerConnections[userId].close();
      delete peerConnections[userId];
  }

  const videoContainer = document.getElementById(`container-${userId}`);
  if (videoContainer) {
      videoContainer.remove();
  }

  displayMessage({
      user: "System",
      text: `${userName} has left the room`,
      senderId: "system"
  });
});

socket.on("receive-message", (data) => {
  displayMessage(data);
});

messageInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
      sendMessage();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  makeChatDraggable();
  
  // Add chat header with minimize button
  const chatHeader = document.querySelector(".chat-header");
  chatHeader.innerHTML = "";
  
  // Create chat icon for minimized state
  const chatIcon = document.createElement("i");
  chatIcon.className = "fas fa-comments chat-icon";
  
  // Create text span for normal state
  const textSpan = document.createElement("span");
  textSpan.textContent = "Chat";
  
  // Create minimize button
  const minimizeButton = document.createElement("button");
  minimizeButton.id = "minimizeChatButton";
  minimizeButton.className = "minimize-button";
  minimizeButton.textContent = "-";
  minimizeButton.onclick = function(e) {
    e.stopPropagation(); // Prevent event from bubbling up
    toggleChatVisibility();
  };
  
  // Add elements to chat header
  chatHeader.appendChild(chatIcon);
  chatHeader.appendChild(textSpan);
  chatHeader.appendChild(minimizeButton);
  
  // Make minimized chat clickable to maximize
  chatHeader.addEventListener("click", function(e) {
      if (document.getElementById("chat").classList.contains("chat-minimized") && 
          e.target.id !== "minimizeChatButton") {
          toggleChatVisibility();
      }
  });
});

// Global variable to track recording state
let mediaRecorder;
let recordedChunks = [];
let isRecording = false;

// Toggle recording function
function toggleRecording() {
    const recordButton = document.getElementById('recordButton');
    
    if (!isRecording) {
        // Start recording
        startRecording();
        recordButton.innerHTML = '<i class="fas fa-stop"></i>';
        recordButton.classList.add('recording');
        isRecording = true;
    } else {
        // Stop recording
        stopRecording();
        recordButton.innerHTML = '<i class="fas fa-record-vinyl"></i>';
        recordButton.classList.remove('recording');
        isRecording = false;
    }
}

// Start recording function
function startRecording() {
    recordedChunks = [];
    const videoStream = document.getElementById('localVideo').srcObject;
    
    try {
        mediaRecorder = new MediaRecorder(videoStream);
        
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };
        
        mediaRecorder.onstop = () => {
            // Create a blob from the recorded chunks
            const blob = new Blob(recordedChunks, {
                type: 'video/webm'
            });
            
            // Create download link
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            document.body.appendChild(a);
            a.style.display = 'none';
            a.href = url;
            a.download = `recording-${new Date().toISOString()}.webm`;
            a.click();
            
            // Cleanup
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        };
        
        // Start recording
        mediaRecorder.start();
        
        // Display a notification
        displayMessage({
            user: "System",
            text: "Recording started",
            senderId: "system"
        });
        
    } catch (error) {
        console.error('Error starting recording:', error);
        alert('Unable to record: ' + error.message);
    }
}

// Stop recording function
function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        
        displayMessage({
            user: "System",
            text: "Recording stopped. Download started.",
            senderId: "system"
        });
    }
}

// End the call
function endCall() {
  // Stop recording if active
  if (isRecording) {
      stopRecording();
  }
  
  Object.values(peerConnections).forEach((connection) => {
      connection.close();
  });

  if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
  }

  if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      screenStream = null;
  }

  socket.emit("leave-room");

  window.location.reload();
}