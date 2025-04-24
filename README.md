# 🎥 Face2Face – Real-Time Video Conferencing App

**Face2Face** is a sleek and simple web-based video conferencing platform built with WebRTC, Socket.IO, and custom HTML/CSS/JS. It supports live video/audio calls, screen sharing, chat functionality, and responsive UI design.

This app is deployed with:
- **Frontend** on [Firebase Hosting](https://your-firebase-project.web.app)
- **Backend** on [Vercel](https://face2face-backend.vercel.app) *(alternative to Railway)*

---

## 🚀 Quick Start

> 🔧 Make sure you have [Node.js](https://nodejs.org), [Firebase CLI](https://firebase.google.com/docs/cli), and a GitHub account.

1. Clone the repo  
   ```bash
   git clone https://github.com/yourusername/face2face.git
   cd face2face
   ```

2. Deploy Frontend (Firebase)
   ```bash
   cd public
   firebase login
   firebase init
   firebase deploy
   ```

3. Deploy Backend (Vercel)
   - Visit [https://vercel.com](https://vercel.com)
   - Click “New Project” → Import your repo
   - Set `server` folder as your backend root
   - Deploy!

---

## 🌟 Features Used

- 🔗 **Room-based Video Chat** – Join using room ID
- 🎥 **WebRTC Peer Connections** – Real-time media streaming
- 💬 **Live Chat System** – Send messages during calls
- 🖥️ **Screen Sharing** – Share your full screen or window
- 🎤 **Mute/Unmute Microphone**
- 🛑 **Leave Call Button**
- 🟥 **Recording State UI Styling**
- 📱 **Responsive UI** – Works on all screen sizes
- ⚡ **Socket.IO** – Real-time signaling & chat
- 🎨 **Custom CSS Styling** – Clean design with hover effects, cards, shadows

---

## 📁 Project Structure

```
face2face/
├── public/              # Frontend (Firebase)
│   ├── index.html
│   ├── main.css
│   └── script.js
├── server/              # Backend (Vercel or Railway)
│   ├── index.js
│   └── socketHandler.js
├── vercel.json
└── README.md
```

---

## 🧠 Tech Stack

| Frontend        | Backend         | Deployment         |
|----------------|-----------------|--------------------|
| HTML, CSS, JS   | Node.js, Express | Firebase (Frontend)|
| WebRTC, Socket.IO | Socket.IO     | Vercel (Backend)   |

---

## 🛠️ Environment Setup

For local development:

### Backend (`server/`)
```bash
cd server
npm install
node index.js
```

Ensure this is running before joining rooms.

---

## 🌐 Live Demo

- 🔗 **Frontend (Firebase)**: [https://your-firebase-project.web.app](https://your-firebase-project.web.app)
- 🔗 **Backend API (Vercel)**: [https://face2face-backend.vercel.app](https://face2face-backend.vercel.app)

> Replace the links above with your actual deployed project URLs.

---

## 🙋‍♂️ Author

**Your Name**  
📎 [GitHub](https://github.com/yourusername) | 💼 [LinkedIn](https://linkedin.com/in/yourprofile)

---
