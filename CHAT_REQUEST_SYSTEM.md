# Chat Request System - Documentation

## Overview

A **chat request/invitation system** has been added to the chat feature. Users must now:
1. Send a chat request to another user
2. Wait for the receiver to accept the request
3. Only then can they start messaging

This prevents unsolicited messages and gives users control over who can message them.

---

## 🗄️ Database Model

### ChatRequests Table
```
id (PK) - Integer
sender_id (FK → users) - Integer
receiver_id (FK → users) - Integer
status - ENUM('pending', 'accepted', 'rejected')
message - Text, nullable
deletedAt - Timestamp, nullable (soft delete)
createdAt - Timestamp
updatedAt - Timestamp

Unique Constraint: (sender_id, receiver_id)
```

**Statuses:**
- `pending` - Request awaiting acceptance
- `accepted` - Chat is now allowed
- `rejected` - Request was declined

---

## 🔌 REST API Endpoints

### Chat Request Endpoints

#### 1. Send Chat Request
```
POST /api/chat/request/send
Authorization: Bearer TOKEN
Content-Type: application/json

Body:
{
  "receiverId": 2,
  "message": "Hi, I'd like to chat with you!" (optional)
}

Response (201 Created):
{
  "success": true,
  "message": "Chat request sent",
  "data": {
    "id": 1,
    "sender_id": 1,
    "receiver_id": 2,
    "status": "pending",
    "message": "Hi, I'd like to chat with you!",
    "createdAt": "2026-01-21T10:30:00Z",
    "sender": { /* user details */ },
    "receiver": { /* user details */ }
  }
}
```

#### 2. Accept Chat Request
```
POST /api/chat/request/:requestId/accept
Authorization: Bearer TOKEN

Response (200 OK):
{
  "success": true,
  "message": "Chat request accepted",
  "data": {
    "id": 1,
    "sender_id": 1,
    "receiver_id": 2,
    "status": "accepted",
    "sender": { /* user details */ },
    "receiver": { /* user details */ }
  }
}
```

#### 3. Reject Chat Request
```
POST /api/chat/request/:requestId/reject
Authorization: Bearer TOKEN

Response (200 OK):
{
  "success": true,
  "message": "Chat request rejected"
}
```

#### 4. Cancel Chat Request
```
DELETE /api/chat/request/:requestId
Authorization: Bearer TOKEN

Response (200 OK):
{
  "success": true,
  "message": "Chat request cancelled"
}
```

#### 5. Get Pending Requests (for current user)
```
GET /api/chat/request/pending?page=1&limit=20
Authorization: Bearer TOKEN

Response (200 OK):
{
  "success": true,
  "data": {
    "requests": [
      {
        "id": 1,
        "sender_id": 3,
        "receiver_id": 1,
        "status": "pending",
        "message": "Can we chat?",
        "createdAt": "2026-01-21T10:30:00Z",
        "sender": { /* user details */ }
      }
    ],
    "total": 5,
    "page": 1,
    "totalPages": 1
  }
}
```

#### 6. Get Sent Requests
```
GET /api/chat/request/sent?page=1&limit=20
Authorization: Bearer TOKEN

Response (200 OK):
{
  "success": true,
  "data": {
    "requests": [
      {
        "id": 2,
        "sender_id": 1,
        "receiver_id": 4,
        "status": "pending",
        "createdAt": "2026-01-21T10:30:00Z",
        "receiver": { /* user details */ }
      }
    ],
    "total": 3,
    "page": 1,
    "totalPages": 1
  }
}
```

#### 7. Get All Requests (sent and received)
```
GET /api/chat/request/all?page=1&limit=20
Authorization: Bearer TOKEN

Response (200 OK):
{
  "success": true,
  "data": {
    "requests": [
      {
        "id": 1,
        "sender_id": 3,
        "receiver_id": 1,
        "status": "pending",
        "sender": { /* user details */ },
        "receiver": { /* user details */ }
      },
      {
        "id": 2,
        "sender_id": 1,
        "receiver_id": 4,
        "status": "accepted",
        "sender": { /* user details */ },
        "receiver": { /* user details */ }
      }
    ],
    "total": 8,
    "page": 1,
    "totalPages": 1
  }
}
```

---

## 🔌 WebSocket Events

### Chat Request Events

#### Client → Server

**1. Send Chat Request**
```javascript
socket.emit('send_chat_request', {
  receiverId: 2,
  message: "Hi! Can we chat?" // optional
});
```

**2. Accept Chat Request**
```javascript
socket.emit('accept_chat_request', {
  requestId: 1
});
```

**3. Reject Chat Request**
```javascript
socket.emit('reject_chat_request', {
  requestId: 1
});
```

---

#### Server → Client

**1. Chat Request Sent Confirmation**
```javascript
socket.on('chat_request_sent', (data) => {
  // data: { requestId, receiverId, status: 'pending' }
  console.log('Request sent to user:', data.receiverId);
});
```

**2. Chat Request Received Notification**
```javascript
socket.on('chat_request_received', (data) => {
  // data: { requestId, sender: {...}, message: "..." }
  console.log('New chat request from:', data.sender.name);
  // Show notification to user
});
```

**3. Chat Request Accepted Confirmation**
```javascript
socket.on('chat_request_accepted', (data) => {
  // data: { requestId, conversationId }
  console.log('Request accepted! Conversation ID:', data.conversationId);
  // Can now start messaging
});
```

**4. Chat Request Accepted Notification**
```javascript
socket.on('chat_request_accepted_notification', (data) => {
  // data: { requestId, receiver: {...}, conversationId }
  console.log('Request accepted by:', data.receiver.name);
  // Can now start messaging
});
```

**5. Chat Request Rejected Notification**
```javascript
socket.on('chat_request_rejected', (data) => {
  // data: { requestId }
  console.log('Request was rejected');
});
```

---

## 📊 Chat Request Workflow

### Happy Path: Request → Accept → Chat

```
User A (Sender)                    Backend                User B (Receiver)
│                                  │                      │
├─ POST /request/send ────────────►├─ Validate          │
│                                  ├─ Create request     │
│                                  │                      ├─ Emit notification ──────────►
│                                  │                      │
│                                  │                   Display "Request from A"
│                                  │                      │
│                                  │◄─── POST /request/:id/accept
│                                  ├─ Accept request     │
│                                  ├─ Create conversation│
│                                  │                      ├─ Emit confirmation ────────►
│                                  │                      │
│◄─ Emit accepted ────────────────┤                      │
│ notification                      │                      │
│                                  │                   "Request Accepted!"
├─ POST /send ──────────────────►  ├─ Check allowed     │
│ (send message)                   ├─ Save message      │
│                                  ├─ Broadcast ────────────────────►
│                                  │                      │
│                                  │                   Receive message
```

### Rejected Path

```
User A (Sender)                    Backend                User B (Receiver)
│                                  │                      │
├─ POST /request/send ────────────►├─ Create request     │
│                                  │                      ├─ Emit notification ──────────►
│                                  │                      │
│                                  │                   Display "Request from A"
│                                  │                      │
│                                  │◄─── POST /request/:id/reject
│                                  ├─ Reject request     │
│                                  │                      ├─ Emit confirmation ────────►
│                                  │                      │
│◄─ Emit rejected ────────────────┤                      │
│ notification                      │                      │
```

---

## 🔐 Security & Validation

### Checks Performed

1. **Self-Request Prevention**
   - Cannot send request to yourself
   - Error: "Cannot send chat request to yourself"

2. **Duplicate Prevention**
   - Cannot have multiple pending requests
   - Error: "Chat request already pending"

3. **Already Connected**
   - Cannot request if already accepted
   - Error: "Chat already enabled with this user"

4. **Chat Authorization**
   - Can only message if request is accepted
   - Error: "Chat not allowed. Please send a chat request first."

5. **User Existence**
   - Receiver must exist in database
   - Error: "Receiver not found"

---

## 💻 Frontend Integration Example

### React Component

```javascript
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const ChatRequestComponent = ({ userId, token, onRequestAccepted }) => {
  const [socket, setSocket] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [newRequest, setNewRequest] = useState(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3010', { auth: { token } });

    // Listen for incoming requests
    newSocket.on('chat_request_received', (data) => {
      setNewRequest(data);
      // Show notification
      showNotification(`${data.sender.name} wants to chat!`);
    });

    // Listen for acceptance notifications
    newSocket.on('chat_request_accepted_notification', (data) => {
      // Navigate to chat
      onRequestAccepted(data.conversationId);
    });

    setSocket(newSocket);
    return () => newSocket.close();
  }, [token]);

  // Send chat request
  const sendRequest = async (receiverId, message) => {
    // Option 1: Via REST API
    const response = await fetch('http://localhost:3010/api/chat/request/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ receiverId, message })
    });

    // Option 2: Via WebSocket
    socket.emit('send_chat_request', { receiverId, message });
  };

  // Accept request
  const acceptRequest = async (requestId) => {
    // Option 1: Via REST API
    await fetch(`http://localhost:3010/api/chat/request/${requestId}/accept`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    // Option 2: Via WebSocket
    socket.emit('accept_chat_request', { requestId });
  };

  // Reject request
  const rejectRequest = async (requestId) => {
    // Option 1: Via REST API
    await fetch(`http://localhost:3010/api/chat/request/${requestId}/reject`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    // Option 2: Via WebSocket
    socket.emit('reject_chat_request', { requestId });
  };

  // Fetch pending requests
  const fetchPendingRequests = async () => {
    const response = await fetch(
      'http://localhost:3010/api/chat/request/pending?page=1&limit=20',
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    const data = await response.json();
    setPendingRequests(data.data.requests);
  };

  return (
    <div>
      {/* New incoming request notification */}
      {newRequest && (
        <div className="notification">
          <h3>{newRequest.sender.name} sent you a chat request</h3>
          <p>{newRequest.message}</p>
          <button onClick={() => acceptRequest(newRequest.requestId)}>
            Accept
          </button>
          <button onClick={() => rejectRequest(newRequest.requestId)}>
            Reject
          </button>
        </div>
      )}

      {/* List of pending requests */}
      <div className="pending-requests">
        <h2>Pending Requests ({pendingRequests.length})</h2>
        {pendingRequests.map(req => (
          <div key={req.id} className="request-card">
            <img src={req.sender.profile_photo} alt={req.sender.name} />
            <div>
              <h4>{req.sender.name}</h4>
              <p>{req.message}</p>
              <small>{new Date(req.createdAt).toLocaleDateString()}</small>
            </div>
            <div className="actions">
              <button onClick={() => acceptRequest(req.id)}>
                Accept
              </button>
              <button onClick={() => rejectRequest(req.id)}>
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Send request button */}
      <button onClick={() => {
        const receiverId = prompt('User ID to request chat:');
        const message = prompt('Optional message:');
        sendRequest(parseInt(receiverId), message);
      }}>
        Send Chat Request
      </button>
    </div>
  );
};

export default ChatRequestComponent;
```

---

## 📋 Service Methods

```typescript
ChatService.sendChatRequest(senderId, receiverId, message?)
  → Sends request to another user

ChatService.acceptChatRequest(requestId)
  → Accepts a pending request and creates conversation

ChatService.rejectChatRequest(requestId)
  → Rejects a pending request

ChatService.cancelChatRequest(requestId)
  → Cancels a sent request (sender only)

ChatService.getPendingRequests(userId, page, limit)
  → Gets pending requests for user

ChatService.getSentRequests(userId, page, limit)
  → Gets requests sent by user

ChatService.getAllChatRequests(userId, page, limit)
  → Gets all requests (sent and received)

ChatService.isChatAllowed(userId1, userId2)
  → Checks if two users can message
```

---

## ⚡ Implementation Changes

### Files Modified
```
src/models/chatRequest.model.ts (NEW)
  └─ ChatRequest model with relationships

src/models/index.ts (UPDATED)
  └─ Added ChatRequest export

src/services/chat.service.ts (UPDATED)
  ├─ Added: isChatAllowed() check
  ├─ Added: sendChatRequest()
  ├─ Added: acceptChatRequest()
  ├─ Added: rejectChatRequest()
  ├─ Added: cancelChatRequest()
  ├─ Added: getPendingRequests()
  ├─ Added: getSentRequests()
  ├─ Added: getAllChatRequests()
  └─ Modified: sendMessage() - now checks isChatAllowed()

src/controllers/chat.controller.ts (UPDATED)
  ├─ Added: sendChatRequest()
  ├─ Added: acceptChatRequest()
  ├─ Added: rejectChatRequest()
  ├─ Added: cancelChatRequest()
  ├─ Added: getPendingRequests()
  ├─ Added: getSentRequests()
  ├─ Added: getAllRequests()
  └─ Modified: sendMessage() - error handling updated

src/routes/chat.routes.ts (UPDATED)
  ├─ Added: POST /request/send
  ├─ Added: POST /request/:requestId/accept
  ├─ Added: POST /request/:requestId/reject
  ├─ Added: DELETE /request/:requestId
  ├─ Added: GET /request/pending
  ├─ Added: GET /request/sent
  └─ Added: GET /request/all

src/utils/socket.handler.ts (UPDATED)
  ├─ Added: send_chat_request event
  ├─ Added: accept_chat_request event
  ├─ Added: reject_chat_request event
  └─ Added: related notifications
```

---

## 🧪 Testing the Feature

### Via REST API

```bash
# 1. Send chat request (User 1 → User 2)
curl -X POST http://localhost:3010/api/chat/request/send \
  -H "Authorization: Bearer USER1_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"receiverId": 2, "message": "Hi! Want to chat?"}'

# 2. Get pending requests (User 2)
curl http://localhost:3010/api/chat/request/pending \
  -H "Authorization: Bearer USER2_TOKEN"

# 3. Accept request (User 2)
curl -X POST http://localhost:3010/api/chat/request/1/accept \
  -H "Authorization: Bearer USER2_TOKEN"

# 4. Send message (now allowed)
curl -X POST http://localhost:3010/api/chat/send \
  -H "Authorization: Bearer USER1_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"receiverId": 2, "content": "Now we can chat!"}'
```

### Via WebSocket

```javascript
import io from 'socket.io-client';

const socket1 = io('http://localhost:3010', { auth: { token: USER1_TOKEN } });
const socket2 = io('http://localhost:3010', { auth: { token: USER2_TOKEN } });

// Join personal rooms
socket1.emit('join_personal_room');
socket2.emit('join_personal_room');

// User 1 sends request to User 2
socket1.emit('send_chat_request', { 
  receiverId: 2, 
  message: "Hi! Want to chat?" 
});

// User 2 accepts
socket2.on('chat_request_received', (data) => {
  console.log('Request received:', data);
  socket2.emit('accept_chat_request', { requestId: data.requestId });
});

// User 1 receives acceptance notification
socket1.on('chat_request_accepted_notification', (data) => {
  console.log('Request accepted!');
  // Now can send messages
});
```

---

## 🔄 Message Sending Flow (Updated)

```
Before: User A → Send Message → Database → User B

After:  User A → Send Request → Pending
              ↓
        User B → Accept Request → Conversation Created
              ↓
        User A → Send Message → Chat Allowed Check → Database → User B
```

---

## 📊 Database Schema

```sql
CREATE TABLE "ChatRequests" (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  receiver_id INTEGER NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
  message TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  "deletedAt" TIMESTAMP,
  UNIQUE (sender_id, receiver_id)
);
```

---

## ✅ Key Features

✅ Request-based chat initiation  
✅ User control over messaging  
✅ Real-time notifications via WebSocket  
✅ Request history tracking  
✅ Accept/Reject/Cancel operations  
✅ Prevents unsolicited messages  
✅ Automatic conversation creation on acceptance  
✅ Full pagination support  

---

## 🚀 Getting Started

1. **Database:** Will auto-create on next sync (DB_SYNC=true)
2. **Start Server:** `npm run dev`
3. **Send Request:** POST /api/chat/request/send
4. **Accept Request:** POST /api/chat/request/:id/accept
5. **Start Messaging:** Messages now allowed between users

All existing chat features still work once request is accepted!
