```markdown
**WebRTC Video Conference Application – Face2Face**

A real-time video conferencing application built with **WebRTC**, **Socket.IO**, and **Express.js**. This application allows users to create or join video chat rooms, share screens, and communicate via text chat. It's a fully responsive and scalable solution designed to provide an excellent video conferencing experience.

## 🚀 Live Demo

🌐 **Frontend (Firebase Hosting)**: [https://face2face-793a0.web.app/](https://face2face-793a0.web.app/)  
🌐 **Backend (Railway Deployment)**: [https://face2face-production.up.railway.app/](https://face2face-production.up.railway.app/)

## 🌟 Features

- 🔗 **Multi-user video conferencing** – Connect with multiple participants in a video chat room.
- 💬 **Real-time text chat** – Communicate with others during the call.
- 🖥️ **Screen sharing** – Share your entire screen or a window.
- 🎤 **Microphone mute/unmute** – Easily toggle mic input.
- 🎥 **Camera on/off toggle** – Control your video feed.
- 📶 **Connection status indicators** – See peer connectivity in real time.
- 📱 **Responsive design** – Works across desktop and mobile devices.
- 🏠 **Room-based communication** – Join specific rooms for private conversations.

## 🖼️ Screenshots

```
![Homepage Screenshot](Screenshots/1.PNG)
![Video Room](Screenshots/2.PNG)
![Screen Sharing Example](Screenshots/3.PNG)
```

## 📦 Prerequisites

- [Node.js](https://nodejs.org/) (v14.0.0 or higher)
- [npm](https://www.npmjs.com/) (v6.0.0 or higher)

## ⚙️ Installation

### 1. Clone the repository
```bash
git clone https://github.com/InduwaraJayawickrama/Face2Face
cd webrtc-video-conference
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start the server
```bash
npm start
```

```bash
npm run dev
```

### 4. Open in browser
```
http://localhost:3000
```

## 🧑‍💻 Usage

1. **Join a Room**
   - Enter a room ID in the input field
   - Click “Join Room” to start a session

2. **Grant Permissions**
   - Allow camera/microphone access when prompted

3. **Control Your Feed**
   - Toggle mic, camera, and screen share
   - Use text chat to message participants

4. **Exit Room**
   - Click the “Leave” button to end your session

## 💻 Deployment

### 🔹 Frontend (Firebase)
```bash
cd public
firebase login
firebase init
firebase deploy
```

### 🔹 Backend (Vercel)
1. Visit [https://railway.com/](https://railway.com/)
2. Import your GitHub repo
3. Set `server` as the root for backend
4. Deploy it

## ⚙️ Tech Stack

| Technology   | Usage                            |
|--------------|----------------------------------|
| WebRTC       | Peer-to-peer video/audio         |
| Socket.IO    | Real-time communication          |
| Express.js   | Backend routing + signaling      |
| HTML/CSS/JS  | Frontend structure & interaction |

## 🛠 Folder Structure

```
webrtc-video-conference/
├── public/              # Frontend (Firebase Hosting)
│   ├── index.html
│   ├── style.css
│   └── script.js
├── server/              # Backend (Vercel)
│   ├── index.js
│   └── socketHandler.js
├── vercel.json
└── README.md
```

## 🧩 How It Works

- **WebRTC** enables direct video/audio peer-to-peer communication.
- **Socket.IO** handles signaling & room logic in real-time.
- **Express.js** serves static files and handles WebSocket connections.

## ❓ Troubleshooting

- 🎙️ No audio/video? Grant browser permissions.
- 🔐 Room issues? Use a unique ID to avoid conflicts.

## 📜 License

This project is licensed under the **ISC License** – see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Author

**Your Name**  
GitHub: [@InduwaraJayawickrama](https://github.com/InduwaraJayawickrama)  
LinkedIn: [https://www.linkedin.com/in/induwara-jayawickrama](https://www.linkedin.com/in/induwara-jayawickrama)

> ⭐ Don't forget to star the repo if you like it!
```
