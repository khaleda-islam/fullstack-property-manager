# Messaging & Notification System Guide

## Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Real-Time Messaging System](#real-time-messaging-system)
4. [Notification System](#notification-system)
5. [Setup Guide](#setup-guide)
6. [Frontend Integration](#frontend-integration)
7. [Backend Implementation](#backend-implementation)
8. [API Endpoints](#api-endpoints)
9. [Socket.IO Events](#socketio-events)
10. [Testing & Troubleshooting](#testing--troubleshooting)
11. [Best Practices](#best-practices)

---

## Overview

The Property Management System includes two real-time communication features:

### 1. **Real-Time Messaging System**
- Direct messaging (DM) between any two users
- Room-based chat architecture
- Online/offline status tracking
- Typing indicators
- Message delivery confirmation
- Unread message counters

### 2. **Notification System**
- In-app notifications for maintenance updates
- Real-time push notifications via Socket.IO
- Persistent storage in MongoDB
- Read/unread status tracking
- Notification history (last 50 notifications)

**Technology Stack**:
- **Socket.IO**: Real-time bidirectional communication
- **MongoDB**: Message and notification persistence
- **JWT Authentication**: Secure WebSocket connections
- **React Context**: Frontend state management

---

## System Architecture

### High-Level Flow

```
┌─────────────────┐         WebSocket          ┌─────────────────┐
│                 │ ◄──────────────────────────►│                 │
│  React Client   │    Socket.IO + JWT Auth     │  Node.js Server │
│  (Frontend)     │                             │   (Backend)     │
│                 │ ◄──────────────────────────►│                 │
└─────────────────┘         REST API            └─────────────────┘
                                                         │
                                                         ▼
                                                 ┌───────────────┐
                                                 │   MongoDB     │
                                                 │  • Room       │
                                                 │  • Message    │
                                                 │  • Notification│
                                                 └───────────────┘
```

### Data Models

#### **Room Model** (Chat Rooms)
```javascript
{
  participants: ["auth0|user1", "auth0|user2"],  // Exactly 2 users
  lastMessage: {
    text: "Hello!",
    senderId: "auth0|user1",
    senderName: "John Doe",
    sentAt: Date
  },
  unreadCount: {
    "auth0|user1": 0,
    "auth0|user2": 3
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### **Message Model**
```javascript
{
  roomId: ObjectId,              // Reference to Room
  senderId: "auth0|user1",       // Sender's auth0 ID
  senderName: "John Doe",        // Cached for display
  message: "Hello!",             // Message content
  read: false,                   // Read status
  deleted: false,                // Soft delete flag
  createdAt: Date
}
```

#### **Notification Model**
```javascript
{
  userId: "auth0|user1",         // Recipient's auth0 ID
  type: "maintenance_status",    // Notification type
  title: "Request Updated",      // Notification title
  message: "Status: In Progress",// Notification body
  read: false,                   // Read status
  data: {                        // Additional context
    requestId: "abc123",
    status: "In Progress"
  },
  createdAt: Date
}
```

---

## Real-Time Messaging System

### Key Features

#### 1. **Room-Based Architecture**
- Each conversation is a "Room" with exactly 2 participants
- Rooms are automatically created when users first message each other
- Room IDs are MongoDB ObjectIds for efficient indexing

#### 2. **Message Persistence**
- All messages saved to MongoDB before broadcast
- Message history loaded on room open
- Supports pagination for large chat histories

#### 3. **Online Status Tracking**
```javascript
const onlineUsers = {
  "auth0|user1": "socketId_abc123",
  "auth0|user2": "socketId_xyz789"
};
```

#### 4. **Unread Message Counters**
- Tracked per user in Room model
- Incremented on new message
- Reset when user opens room

#### 5. **Typing Indicators**
- Real-time "User is typing..." feedback
- Broadcast only to other participant
- Auto-clears after timeout

### Message Flow

**Sending a Message**:
```
1. User types message in frontend
2. Frontend emits "send_dm" event to Socket.IO
3. Backend validates room membership
4. Backend saves message to MongoDB
5. Backend updates Room's lastMessage & unreadCount
6. Backend broadcasts "receive_dm" to all room members
7. Frontend receives event and updates UI
8. Backend sends notification if recipient is offline
```

---

## Notification System

### Notification Types

| Type | Triggered By | Recipient | Purpose |
|------|-------------|-----------|---------|
| `maintenance_status` | Contractor updates job | Resident | Job status changed |
| `maintenance_assigned` | Landlord assigns contractor | Contractor | New job assignment |
| `new_message` | User sends message | Other user | New chat message |
| `lease_expiring` | Cron job (future) | Landlord | Lease renewal reminder |

### Notification Flow

**Creating a Notification**:
```javascript
// Backend controller calls
await sendNotification({
  userId: "auth0|resident1",
  type: "maintenance_status",
  title: "Maintenance Request Updated",
  message: "Your request status changed to: In Progress",
  data: { requestId: maintenanceId, status: "In Progress" }
});
```

**What Happens**:
1. ✅ Notification saved to MongoDB (persistent)
2. 🔍 Check if user is online (lookup in `onlineUsers`)
3. 📡 If online → push via Socket.IO (`notification` event)
4. 📭 If offline → user sees it next login
5. 🔔 Frontend displays notification banner
6. ✔️ User marks as read → updates MongoDB

### Persistent vs. Real-Time
- **Persistent**: All notifications stored in DB (last 50 shown)
- **Real-Time**: Only pushed if user currently online
- **Hybrid Approach**: Ensures no notification is ever lost

---

## Setup Guide

### Prerequisites
- Node.js backend with Express running
- React frontend with Vite
- MongoDB database configured
- Auth0 authentication setup complete

### Backend Setup

#### Step 1: Install Dependencies
```bash
cd backend
npm install socket.io
```

#### Step 2: Environment Variables
No additional environment variables needed for Socket.IO.
The system uses existing `CLIENT_URL` for CORS:

```env
CLIENT_URL=http://localhost:5173
```

#### Step 3: Initialize Socket.IO in `server.js`
Already configured in your `server.js`:
```javascript
const { initSocket } = require('./socket/socketHandler');

// After creating HTTP server
const server = http.createServer(app);
initSocket(server);  // ✅ Initializes Socket.IO

server.listen(PORT, () => {
  console.log(`🚀 Server on http://localhost:${PORT}`);
});
```

### Frontend Setup

#### Step 4: Install Socket.IO Client
```bash
cd frontend
npm install socket.io-client
```

#### Step 5: Socket Service Already Configured
The socket connection is automatically established in `App.jsx`:
```javascript
import { connectSocket, disconnectSocket } from "./services/socket";

useEffect(() => {
  if (!isAuthenticated || !user) return;

  const init = async () => {
    const token = await getAccessTokenSilently();
    connectSocket(token);  // ✅ Connects to Socket.IO
  };

  init();
  return () => disconnectSocket();  // Cleanup on unmount
}, [isAuthenticated, user]);
```

---

## Frontend Integration

### Connecting to Socket.IO

**File**: `frontend/src/services/socket.js`

```javascript
import { io } from "socket.io-client";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || window.location.origin;
let socket = null;

export const connectSocket = (token) => {
  if (socket?.connected) return socket;

  socket = io(SERVER_URL, {
    auth: { token },           // JWT authentication
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  return socket;
};

export const getSocket = () => socket;
export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};
```

### Sending Messages

**File**: `frontend/src/pages/MessagesPage.jsx`

```javascript
import { getSocket } from "../services/socket";

const handleSend = () => {
  const socket = getSocket();
  if (!socket || !input.trim()) return;

  socket.emit("send_dm", {
    roomId: activeRoom.roomId,
    message: input.trim(),
    senderName: dbUser.name
  });

  setInput("");  // Clear input after sending
};
```

### Receiving Messages

```javascript
useEffect(() => {
  const socket = getSocket();
  if (!socket || !activeRoom) return;

  // Join the room
  socket.emit("open_dm", { roomId: activeRoom.roomId });

  // Listen for new messages
  socket.on("receive_dm", (msg) => {
    setMessages((prev) => [...prev, msg]);
  });

  return () => {
    socket.off("receive_dm");
  };
}, [activeRoom]);
```

### Handling Notifications

```javascript
useEffect(() => {
  const socket = getSocket();
  if (!socket) return;

  socket.on("notification", (notification) => {
    // Show notification banner
    setNotifications((prev) => [notification, ...prev]);
    
    // Play sound or show toast
    showNotificationToast(notification.title);
  });

  return () => socket.off("notification");
}, []);
```

---

## Backend Implementation

### Socket.IO Authentication Middleware

**File**: `backend/socket/socketHandler.js`

```javascript
const { verifySocketToken } = require("../middleware/auth");

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("No token"));
    
    const payload = await verifySocketToken(token);
    socket.userId = payload.sub;  // Attach user ID to socket
    next();
  } catch {
    next(new Error("Unauthorized"));
  }
});
```

### Tracking Online Users

```javascript
const onlineUsers = {};

io.on("connection", (socket) => {
  const userId = socket.userId;
  onlineUsers[userId] = socket.id;
  console.log(`🔌 ${userId} connected`);

  socket.on("disconnect", () => {
    delete onlineUsers[userId];
    console.log(`❌ ${userId} disconnected`);
  });
});
```

### Sending Notifications

**File**: `backend/controllers/notificationController.js`

```javascript
const sendNotification = async ({ userId, type, title, message, data = {} }) => {
  try {
    // 1. Save to database (persistent)
    const notification = await Notification.create({
      userId, type, title, message, data
    });

    // 2. Push to socket if user is online
    const { getIO, getOnlineUsers } = require("../socket/socketHandler");
    const io = getIO();
    const onlineUsers = getOnlineUsers();
    const socketId = onlineUsers[userId];

    if (io && socketId) {
      io.to(socketId).emit("notification", notification);
      console.log(`📡 Notification pushed to ${userId}`);
    } else {
      console.log(`📭 User offline — saved to DB only`);
    }

    return notification;
  } catch (err) {
    console.error("sendNotification error:", err);
  }
};
```

---

## API Endpoints

### Messaging Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/rooms` | Get user's chat rooms | ✅ Required |
| `POST` | `/api/rooms/find-or-create` | Create/find room with user | ✅ Required |
| `GET` | `/api/messages/:roomId` | Get room message history | ✅ Required |
| `PATCH` | `/api/rooms/:roomId/read` | Mark room messages as read | ✅ Required |

### Notification Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/notifications` | Get user's notifications | ✅ Required |
| `PATCH` | `/api/notifications/:id/read` | Mark notification as read | ✅ Required |
| `PATCH` | `/api/notifications/read-all` | Mark all as read | ✅ Required |

---

## Socket.IO Events

### Client → Server (Emit)

| Event | Payload | Description |
|-------|---------|-------------|
| `open_dm` | `{ roomId }` | Join a chat room |
| `send_dm` | `{ roomId, message, senderName }` | Send a message |
| `delete_dm` | `{ roomId, messageId }` | Delete own message |
| `typing` | `{ roomId, isTyping, senderName }` | Broadcast typing status |

### Server → Client (Listen)

| Event | Payload | Description |
|-------|---------|-------------|
| `receive_dm` | `{ _id, roomId, senderId, message, ... }` | New message received |
| `message_deleted` | `{ messageId }` | Message was deleted |
| `user_typing` | `{ isTyping, senderName }` | Other user typing |
| `notification` | `{ userId, type, title, message, ... }` | New notification |
| `new_message_notification` | `{ from, roomId, preview }` | New message alert |

---

## Testing & Troubleshooting

### Testing the Messaging System

#### 1. Test Socket Connection
Open browser console on frontend:
```javascript
// Check if connected
const socket = window.socket;  // If exposed globally
console.log(socket.connected);  // Should be true
```

#### 2. Test Message Sending
1. Log in as two different users (use incognito mode for second user)
2. User 1: Navigate to Messages
3. User 1: Start conversation with User 2
4. User 2: Navigate to Messages
5. Both users should see the conversation in real-time

#### 3. Test Notifications
1. Log in as resident
2. Submit maintenance request
3. Log in as contractor (different browser)
4. Accept the maintenance request
5. Resident should receive notification instantly

### Common Issues

#### Issue: "Socket not connected"
**Solution**:
- Check if backend server is running
- Verify `CLIENT_URL` in backend `.env`
- Check browser console for CORS errors
- Ensure JWT token is valid

#### Issue: "Messages not appearing in real-time"
**Solution**:
- Check if both users are in the same room
- Verify `socket.emit("open_dm", { roomId })` is called
- Check backend logs for errors
- Ensure room ID is correct

#### Issue: "Notifications not pushed"
**Solution**:
- Verify user is online (check `onlineUsers` object)
- Ensure `getIO()` returns valid Socket.IO instance
- Check if notification saved to database
- Verify socket ID is correct

#### Issue: "CORS errors on Socket.IO connection"
**Solution**:
```javascript
// backend/socket/socketHandler.js
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  },
});
```

---

## Best Practices

### Security

1. **Always Authenticate Sockets**
   - Validate JWT token on connection
   - Attach `userId` to socket for authorization

2. **Validate Room Membership**
   - Check if user is participant before emitting events
   - Prevent unauthorized access to other users' messages

3. **Sanitize Input**
   - Trim whitespace from messages
   - Limit message length (2000 characters)
   - Prevent empty messages

### Performance

1. **Limit Message History**
   - Paginate old messages (load 50 at a time)
   - Don't load all messages upfront

2. **Limit Notifications**
   - Show last 50 notifications only
   - Clean up old notifications periodically

3. **Use Indexes**
   - Index `roomId` on Message model
   - Index `userId` on Notification model
   - Index `participants` on Room model

### User Experience

1. **Show Loading States**
   - Display spinner while loading messages
   - Show "Connecting..." during socket connection

2. **Handle Disconnections**
   - Auto-reconnect on connection loss
   - Show offline indicator
   - Buffer messages and resend on reconnect

3. **Provide Feedback**
   - Show "Message sent" confirmation
   - Display "User is typing..." indicator
   - Show notification count badge

4. **Accessibility**
   - Use ARIA labels for screen readers
   - Keyboard navigation for messages
   - High contrast notification badges

---

## Advanced Features

### 1. Message Deletion (Soft Delete)
```javascript
// Backend
socket.on("delete_dm", async ({ roomId, messageId }) => {
  const msg = await Message.findById(messageId);
  if (!msg || msg.senderId !== userId) return;

  msg.message = "This message was deleted";
  msg.deleted = true;
  await msg.save();

  io.to(roomId).emit("message_deleted", { messageId });
});
```

### 2. Read Receipts
```javascript
// Backend - Mark room messages as read
router.patch("/rooms/:roomId/read", checkJwt, async (req, res) => {
  const userId = req.auth.payload.sub;
  const room = await Room.findById(req.params.roomId);
  
  room.unreadCount.set(userId, 0);
  await room.save();
  
  res.json({ success: true });
});
```

### 3. Typing Indicators
```javascript
// Frontend
const handleTyping = () => {
  const socket = getSocket();
  socket.emit("typing", {
    roomId: activeRoom.roomId,
    isTyping: true,
    senderName: dbUser.name
  });
};

// Backend
socket.on("typing", ({ roomId, isTyping, senderName }) => {
  socket.to(roomId).emit("user_typing", { isTyping, senderName });
});
```

---

## Monitoring & Debugging

### Backend Logs
```javascript
// View connected users
console.log("Online users:", Object.keys(onlineUsers));

// Log message delivery
console.log(`📧 Message sent: ${message.message}`);

// Log notification delivery
console.log(`🔔 Notification pushed to: ${userId}`);
```

### Frontend Debugging
```javascript
// Log socket events
socket.onAny((eventName, ...args) => {
  console.log(`Socket event: ${eventName}`, args);
});

// Check connection status
console.log("Socket connected:", socket.connected);
```

---

## Summary

The Messaging & Notification System provides:
- ✅ Real-time bidirectional communication via Socket.IO
- ✅ Persistent message and notification storage
- ✅ JWT-authenticated WebSocket connections
- ✅ Online/offline status tracking
- ✅ Unread counters and read receipts
- ✅ Typing indicators and message deletion
- ✅ Hybrid push/persistent notification delivery

This system ensures users stay connected and informed, whether they're online or offline, providing a seamless communication experience across the Property Management platform.
