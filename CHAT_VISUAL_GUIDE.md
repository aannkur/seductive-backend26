# Chat System - Visual Quick Reference

## 📋 File Structure Overview

```
seductive-backend26/
├── src/
│   ├── models/
│   │   ├── message.model.ts           ✨ NEW - Message data model
│   │   ├── conversation.model.ts      ✨ NEW - Conversation data model
│   │   └── index.ts                   ✏️ UPDATED
│   │
│   ├── services/
│   │   └── chat.service.ts            ✨ NEW - Business logic
│   │
│   ├── controllers/
│   │   └── chat.controller.ts         ✨ NEW - API handlers
│   │
│   ├── routes/
│   │   ├── chat.routes.ts             ✨ NEW - Route definitions
│   │   └── index.ts                   ✏️ UPDATED
│   │
│   ├── utils/
│   │   └── socket.handler.ts          ✨ NEW - WebSocket events
│   │
│   ├── server.ts                      ✏️ UPDATED - Socket.IO setup
│   └── app.ts                         (unchanged)
│
└── Documentation/
    ├── CHAT_QUICK_SETUP.md            📖 START HERE - 5 min setup
    ├── CHAT_IMPLEMENTATION.md         📖 Complete API docs
    ├── CHAT_ARCHITECTURE.md           📖 System design
    ├── CHAT_EXAMPLES.md               📖 Code examples
    ├── CHAT_TROUBLESHOOTING.md        📖 Problem solving
    └── CHAT_SYSTEM_SUMMARY.md         📖 Overview
```

---

## 🔄 Message Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND (React/Vue/Angular)                                    │
│ • Socket.IO Client                                              │
│ • REST API Calls                                                │
└────────────────┬─────────────────────────────────────┬──────────┘
                 │                                     │
         REST API │ (JSON)                 WebSocket   │
                 │                         (Real-time) │
                 ▼                                     ▼
    ┌─────────────────────────────────────────────────────┐
    │ BACKEND (Express + Socket.IO)                       │
    │ http://localhost:3010                              │
    └─────────────────────────────────────────────────────┘
                     │
            ┌────────┴──────┬──────────┐
            │               │          │
        Controller      Socket Handler│ Middleware
            │               │          │
        Router          Event Emitter │ Auth Check
            │               │          │
            ├───────────────┴──────────┤
            │                          │
            ▼                          ▼
    ┌──────────────┐           ┌──────────────────┐
    │ ChatService  │           │ Socket.IO Rooms  │
    │ (Logic)      │           │ (Broadcasting)   │
    └──────┬───────┘           └──────────────────┘
           │
           ▼
    ┌──────────────────┐
    │ PostgreSQL DB    │
    │ • Conversations  │
    │ • Messages       │
    │ • Users (FK)     │
    └──────────────────┘
```

---

## 📡 API Endpoint Map

```
REST API ENDPOINTS (/api/chat)
│
├─ POST /send
│  └─ Send a message (creates conversation if needed)
│
├─ GET /conversations
│  └─ List all user conversations (paginated)
│
├─ GET /conversations/:id/messages
│  └─ Get messages in a conversation (paginated)
│
├─ PUT /conversations/:id/read
│  └─ Mark all messages as read
│
├─ GET /unread-count
│  └─ Get total unread message count
│
├─ GET /unread
│  └─ Get unread messages grouped by conversation
│
├─ GET /conversations/:id/search?q=term
│  └─ Search messages in conversation
│
└─ DELETE /messages/:id
   └─ Delete a message (soft delete)
```

---

## 🔌 WebSocket Event Map

```
CLIENT EVENTS (emit)           SERVER EVENTS (on)
│                              │
├─ join_conversation -------→  ├─ new_message
├─ leave_conversation ------→  ├─ message_notification
├─ send_message -----------→   ├─ user_typing
├─ typing ----------------→    ├─ user_stopped_typing
├─ stop_typing ----------→      ├─ messages_read
├─ mark_as_read --------→       ├─ user_joined
└─ join_personal_room --→       ├─ user_left
                               ├─ online_status
                               └─ error
```

---

## 🗄️ Database Schema Relationships

```
┌─────────────────────┐
│     users (FK)      │
│  ┌────────────────┐ │
│  │ id (PK)        │ │
│  │ name           │ │
│  │ email          │ │
│  │ profile_photo  │ │
│  │ ...            │ │
│  └────────────────┘ │
└──────────┬──────────┘
           │ (references)
           ├─────────────────────────────────────┐
           │                                     │
     ┌─────▼─────────────────────┐       ┌──────▼──────────────────┐
     │  Conversations            │       │                         │
     ├───────────────────────────┤       │                         │
     │ id (PK)                   │       │                         │
     │ participant_1_id (FK) ────┼───────┤                         │
     │ participant_2_id (FK) ────┼───┐   │                         │
     │ last_message              │   │   │                         │
     │ last_message_at           │   │   │                         │
     │ createdAt                 │   │   │                         │
     └───────────────────────────┘   │   │                         │
              │ (references)         │   │                         │
              │                      │   │                         │
     ┌────────▼──────────────────────▼──┴──────────────────────┐  │
     │  Messages                                               │  │
     ├──────────────────────────────────────────────────────────┤ │
     │ id (PK)                                                  │ │
     │ conversation_id (FK) ─────→ Conversations.id            │ │
     │ sender_id (FK) ────────────→ users.id          ◄────────┤─┘
     │ receiver_id (FK) ──────────→ users.id          ◄────────┘
     │ content (TEXT)                                          │
     │ attachment_url                                          │
     │ is_read (BOOLEAN)                                       │
     │ read_at (TIMESTAMP nullable)                            │
     │ deletedAt (TIMESTAMP nullable - soft delete)            │
     │ createdAt, updatedAt                                    │
     └──────────────────────────────────────────────────────────┘
```

---

## 🔐 Authentication & Authorization Flow

```
FRONTEND                          BACKEND
│                                 │
├─ User logs in ───────────────→  ├─ Generate JWT token
│                                 │
├─ Store token in state ◄────────┤
│                                 │
├─ REST: Send token in header ─→ ├─ authenticateUser middleware
│  (Authorization: Bearer TOKEN)  │ ├─ Verify token
│                                 │ ├─ Extract user ID
│                                 │ ├─ Attach to req.user
│                                 │ └─ Grant access
│                                 │
├─ WebSocket: Send token ───────→ ├─ Socket middleware
│  ({ auth: { token } })          │ ├─ Verify token
│                                 │ ├─ Extract user ID
│                                 │ ├─ Attach to socket.userId
│                                 │ └─ Grant access
│                                 │
└─ Use authenticated endpoints    └─ All requests verified
```

---

## 💾 Data Persistence Lifecycle

```
User A sends message to User B
│
└─ REST/WebSocket ─→ Controller
                     │
                     └─→ Service.sendMessage()
                         │
                         ├─→ Get/Create Conversation
                         │   └─ Save to DB: Conversations table
                         │
                         ├─→ Create Message
                         │   └─ Save to DB: Messages table
                         │   • is_read: false
                         │   • read_at: null
                         │
                         └─→ Emit WebSocket event 'new_message'
                             │
                             ├─→ Broadcast to conversation room
                             │   └─ User A receives: message saved confirmation
                             │   └─ User B receives: new message (if in room)
                             │
                             └─→ If User B not in room:
                                 └─ Send to personal notification room
                                    'message_notification'

Later, User B opens the chat:
│
└─ GET /api/chat/conversations/:id/messages
   │
   └─→ Service.getConversationMessages()
       │
       └─→ Query DB: SELECT * FROM Messages
           WHERE conversation_id = ? AND deletedAt IS NULL
           │
           └─→ Return with user details (sender/receiver)
               │
               └─→ UI displays message history

User B reads the message:
│
└─ Event: mark_as_read
   │
   └─→ Service.markMessagesAsRead()
       │
       └─→ UPDATE Messages SET is_read = true, read_at = NOW()
           │
           └─→ Emit 'messages_read' to conversation room
               │
               └─→ User A receives: message marked as read
```

---

## 🚀 Quick Start Checklist

```
□ Step 1: Environment Setup
  □ Verify .env has all database credentials
  □ Set DB_SYNC=true
  □ Set JWT_SECRET
  
□ Step 2: Code Review
  □ Review new models (message.model.ts, conversation.model.ts)
  □ Review service (chat.service.ts)
  □ Review controller (chat.controller.ts)
  □ Review routes (chat.routes.ts)
  
□ Step 3: Database
  □ Start PostgreSQL
  □ Verify database exists
  □ Run server with npm run dev
  □ Verify "Database synchronized" in logs
  
□ Step 4: Test REST API
  □ Create 2 test users
  □ Send message: curl POST /api/chat/send
  □ Get conversations: curl GET /api/chat/conversations
  □ Get messages: curl GET /api/chat/conversations/1/messages
  □ Mark as read: curl PUT /api/chat/conversations/1/read
  
□ Step 5: Test WebSocket
  □ Connect client with Socket.IO
  □ Join conversation: socket.emit('join_conversation')
  □ Send message: socket.emit('send_message')
  □ Listen for events: socket.on('new_message')
  
□ Step 6: Frontend Integration
  □ Install socket.io-client: npm install socket.io-client
  □ Create chat component
  □ Connect socket with JWT token
  □ Implement message UI
  □ Test real-time delivery
```

---

## 📊 Performance Metrics

```
SCALABILITY TARGETS

Messages per conversation: 10,000+
Active conversations: 1,000+
Concurrent WebSocket connections: 500+
Message delivery latency: < 100ms
Database query time: < 50ms

OPTIMIZATION STRATEGIES

✓ Indexed columns (conversation_id, receiver_id, etc.)
✓ Pagination (50 messages per page)
✓ Eager loading (include associations)
✓ Soft deletes (no table locks)
✓ Socket.IO rooms (efficient broadcasting)
✓ Connection pooling (Sequelize)
```

---

## 🔄 Request/Response Examples

### Example 1: Send Message
```
REQUEST:
POST /api/chat/send
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "receiverId": 2,
  "content": "Hello!",
  "attachmentUrl": "https://example.com/image.jpg"
}

RESPONSE (201 Created):
{
  "success": true,
  "message": "Message sent",
  "data": {
    "id": 1,
    "sender_id": 1,
    "receiver_id": 2,
    "conversation_id": 1,
    "content": "Hello!",
    "attachment_url": "https://example.com/image.jpg",
    "is_read": false,
    "read_at": null,
    "createdAt": "2026-01-21T10:30:00Z"
  }
}
```

### Example 2: Get Conversations
```
REQUEST:
GET /api/chat/conversations?page=1&limit=20
Authorization: Bearer TOKEN

RESPONSE (200 OK):
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": 1,
        "participant_1_id": 1,
        "participant_2_id": 2,
        "last_message": "Hello!",
        "last_message_at": "2026-01-21T10:30:00Z",
        "participant1": { /* user data */ },
        "participant2": { /* user data */ }
      }
    ],
    "total": 5,
    "page": 1,
    "totalPages": 1
  }
}
```

---

## 🎯 Key Features at a Glance

```
REAL-TIME MESSAGING
├─ WebSocket-based instant delivery
├─ <100ms message delivery
├─ Typing indicators
├─ Read receipts
└─ User online status

MESSAGE MANAGEMENT
├─ Message history with pagination
├─ Search functionality
├─ Soft delete support
├─ Attachment support
└─ Read/unread tracking

CONVERSATION MANAGEMENT
├─ 1-to-1 chat threads
├─ Automatic conversation creation
├─ Last message preview
├─ Sorted by recent activity
└─ Pagination support

AUTHENTICATION & SECURITY
├─ JWT-based authentication
├─ Token verification for WebSocket
├─ User isolation (privacy)
├─ Input validation
└─ Error handling
```

---

## 📚 Documentation Map

| Document | Purpose | Read Time |
|----------|---------|-----------|
| `CHAT_QUICK_SETUP.md` | Get started in 5 minutes | 5 min |
| `CHAT_SYSTEM_SUMMARY.md` | Overview of what's built | 10 min |
| `CHAT_IMPLEMENTATION.md` | Complete API reference | 20 min |
| `CHAT_ARCHITECTURE.md` | System design & diagrams | 15 min |
| `CHAT_EXAMPLES.md` | Real-world code examples | 30 min |
| `CHAT_TROUBLESHOOTING.md` | Problem solving guide | As needed |

---

## 🚀 Next Steps

1. **Start Server**: `npm run dev`
2. **Read Quick Setup**: `CHAT_QUICK_SETUP.md`
3. **Test Endpoints**: Use provided cURL examples
4. **Connect Frontend**: Use Socket.IO examples
5. **Monitor Performance**: Check database indexes
6. **Scale Features**: Add features from roadmap

---

**You're all set! The chat system is ready to use.** ✅
