# Real-Time Chat Implementation

## Overview
A complete real-time chat system has been implemented with both REST API endpoints and WebSocket (Socket.IO) for real-time messaging between users. Messages are persisted in the database for historical chat records.

## Database Models

### 1. **Conversation Model** (`src/models/conversation.model.ts`)
Represents a chat thread between two users.

**Fields:**
- `id`: Primary key (Integer)
- `participant_1_id`: First user ID (FK to User)
- `participant_2_id`: Second user ID (FK to User)
- `last_message`: Text preview of the last message (String, nullable)
- `last_message_at`: Timestamp of the last message (Date, nullable)
- `createdAt`: Conversation creation timestamp (Date)
- `updatedAt`: Last update timestamp (Date)

**Unique Constraint:** A conversation cannot exist twice between the same two participants.

### 2. **Message Model** (`src/models/message.model.ts`)
Represents individual messages in a conversation.

**Fields:**
- `id`: Primary key (Integer)
- `sender_id`: User ID of the sender (FK to User)
- `receiver_id`: User ID of the receiver (FK to User)
- `conversation_id`: Reference to the conversation (FK to Conversation)
- `content`: Message text (Text, required)
- `attachment_url`: Optional file/media attachment URL (String, nullable)
- `is_read`: Read status flag (Boolean, default: false)
- `read_at`: Timestamp when message was read (Date, nullable)
- `deletedAt`: Soft delete timestamp (Date, nullable)
- `createdAt`: Message creation timestamp (Date)
- `updatedAt`: Last update timestamp (Date)

## Service Layer

### ChatService (`src/services/chat.service.ts`)

**Methods:**

#### 1. `getOrCreateConversation(userId1, userId2)`
- Gets existing conversation or creates a new one
- Ensures consistent participant ordering
- Returns the conversation object

#### 2. `sendMessage(senderId, receiverId, content, attachmentUrl?)`
- Creates a new message in the database
- Automatically gets or creates conversation
- Updates the conversation's `last_message` and `last_message_at`
- Returns the full message with sender/receiver details

#### 3. `getConversationMessages(conversationId, page, limit)`
- Retrieves paginated messages from a conversation
- Includes sender and receiver user details
- Sorted by creation date (ascending)

#### 4. `getUserConversations(userId, page, limit)`
- Gets all conversations for a user
- Includes participant details
- Sorted by `last_message_at` (most recent first)
- Paginated results

#### 5. `markMessagesAsRead(conversationId, userId)`
- Marks all unread messages in a conversation as read for a user
- Sets `read_at` timestamp

#### 6. `getUnreadCount(userId)`
- Returns total count of unread messages for a user

#### 7. `getUnreadMessagesByConversation(userId)`
- Returns unread message count grouped by conversation
- Includes other participant details

#### 8. `searchMessages(conversationId, searchTerm, page, limit)`
- Case-insensitive search within a conversation
- Returns paginated results

#### 9. `deleteMessage(messageId)`
- Soft delete (sets `deletedAt` timestamp)

## REST API Endpoints

All endpoints require authentication (JWT token).

### Base URL: `/api/chat`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/send` | Send a message |
| GET | `/conversations` | Get all user conversations |
| GET | `/conversations/:conversationId/messages` | Get messages in conversation |
| PUT | `/conversations/:conversationId/read` | Mark messages as read |
| GET | `/unread-count` | Get total unread count |
| GET | `/unread` | Get unread messages by conversation |
| GET | `/conversations/:conversationId/search?q=term` | Search messages |
| DELETE | `/messages/:messageId` | Delete a message |

### Example Requests

#### Send Message
```http
POST /api/chat/send
Authorization: Bearer {token}
Content-Type: application/json

{
  "receiverId": 2,
  "content": "Hello! How are you?",
  "attachmentUrl": "https://example.com/image.jpg" (optional)
}

Response:
{
  "success": true,
  "message": "Message sent",
  "data": {
    "id": 1,
    "sender_id": 1,
    "receiver_id": 2,
    "conversation_id": 1,
    "content": "Hello! How are you?",
    "attachment_url": null,
    "is_read": false,
    "createdAt": "2026-01-21T10:30:00Z"
  }
}
```

#### Get Conversations
```http
GET /api/chat/conversations?page=1&limit=20
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": 1,
        "participant_1_id": 1,
        "participant_2_id": 2,
        "last_message": "Hello! How are you?",
        "last_message_at": "2026-01-21T10:30:00Z",
        "participant1": { /* user details */ },
        "participant2": { /* user details */ }
      }
    ],
    "total": 5,
    "page": 1,
    "totalPages": 1
  }
}
```

#### Get Messages in Conversation
```http
GET /api/chat/conversations/1/messages?page=1&limit=50
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": 1,
        "sender_id": 1,
        "receiver_id": 2,
        "conversation_id": 1,
        "content": "Hello! How are you?",
        "is_read": true,
        "createdAt": "2026-01-21T10:30:00Z",
        "sender": { /* user details */ },
        "receiver": { /* user details */ }
      }
    ],
    "total": 10,
    "page": 1,
    "totalPages": 1
  }
}
```

## Real-Time WebSocket Events (Socket.IO)

### Authentication
Connect with authentication token:
```javascript
const socket = io('http://localhost:3010', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Client-to-Server Events

#### 1. `join_conversation`
Join a conversation room to receive real-time messages
```javascript
socket.emit('join_conversation', { conversationId: 1 });
```

#### 2. `leave_conversation`
Leave a conversation room
```javascript
socket.emit('leave_conversation', { conversationId: 1 });
```

#### 3. `send_message`
Send a real-time message (also saves to DB)
```javascript
socket.emit('send_message', {
  receiverId: 2,
  conversationId: 1,
  content: "Hello!",
  attachmentUrl: "https://example.com/image.jpg" (optional)
});
```

#### 4. `typing`
Notify others that you're typing
```javascript
socket.emit('typing', { conversationId: 1 });
```

#### 5. `stop_typing`
Notify others that you stopped typing
```javascript
socket.emit('stop_typing', { conversationId: 1 });
```

#### 6. `mark_as_read`
Mark conversation messages as read
```javascript
socket.emit('mark_as_read', { conversationId: 1 });
```

#### 7. `join_personal_room`
Join personal notification room
```javascript
socket.emit('join_personal_room');
```

### Server-to-Client Events

#### 1. `new_message`
Receive new messages in a conversation
```javascript
socket.on('new_message', (data) => {
  // data: { id, senderId, receiverId, conversationId, content, attachmentUrl, isRead, createdAt, sender }
});
```

#### 2. `message_notification`
Receive notification when you're not in the conversation
```javascript
socket.on('message_notification', (data) => {
  // data: { from, conversationId, content, timestamp }
});
```

#### 3. `user_typing`
Receive typing notification
```javascript
socket.on('user_typing', (data) => {
  // data: { userId, conversationId }
});
```

#### 4. `user_stopped_typing`
Receive stop typing notification
```javascript
socket.on('user_stopped_typing', (data) => {
  // data: { userId, conversationId }
});
```

#### 5. `messages_read`
Receive notification that messages were read
```javascript
socket.on('messages_read', (data) => {
  // data: { conversationId, userId }
});
```

#### 6. `user_joined`
Receive notification when user joins conversation
```javascript
socket.on('user_joined', (data) => {
  // data: { userId, message }
});
```

#### 7. `user_left`
Receive notification when user leaves conversation
```javascript
socket.on('user_left', (data) => {
  // data: { userId, message }
});
```

## Frontend Integration Example (React)

```javascript
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const ChatWindow = ({ conversationId, currentUserId, token }) => {
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize Socket.IO
    const newSocket = io('http://localhost:3010', {
      auth: { token }
    });

    // Join conversation
    newSocket.emit('join_conversation', { conversationId });

    // Listen for new messages
    newSocket.on('new_message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    // Listen for typing indicators
    newSocket.on('user_typing', (data) => {
      // Show typing indicator
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, [conversationId, token]);

  const sendMessage = (content) => {
    socket.emit('send_message', {
      receiverId: 2, // recipient ID
      conversationId,
      content
    });
  };

  const handleTyping = () => {
    socket.emit('typing', { conversationId });
  };

  return (
    <div>
      {/* Chat UI */}
    </div>
  );
};

export default ChatWindow;
```

## Features

✅ Real-time messaging with WebSocket (Socket.IO)
✅ Message persistence in PostgreSQL database
✅ Read/unread status tracking
✅ Typing indicators
✅ Message search functionality
✅ Conversation pagination
✅ Message attachment support
✅ Soft delete for messages
✅ User online status tracking
✅ Notification system
✅ Conversation history
✅ User authentication via JWT

## Files Created/Modified

### New Files:
- `src/models/message.model.ts` - Message model
- `src/models/conversation.model.ts` - Conversation model
- `src/services/chat.service.ts` - Chat service layer
- `src/controllers/chat.controller.ts` - Chat controller
- `src/routes/chat.routes.ts` - Chat routes
- `src/utils/socket.handler.ts` - Socket.IO event handlers

### Modified Files:
- `src/models/index.ts` - Added Message and Conversation models
- `src/server.ts` - Integrated Socket.IO
- `src/routes/index.ts` - Added chat routes

## Environment Variables Needed

Ensure your `.env` file has:
```
PORT=3010
DB_SYNC=true
DB_SEED=false
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-secret-key
```

## Installation Notes

Socket.IO is already in your `package.json` dependencies. No additional packages needed.

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad request
- `401`: Unauthorized
- `500`: Server error

## Database Considerations

1. **Performance**: Add indexes on frequently queried fields:
   ```sql
   CREATE INDEX idx_messages_conversation_id ON Messages(conversation_id);
   CREATE INDEX idx_messages_receiver_id ON Messages(receiver_id);
   CREATE INDEX idx_conversations_participant1 ON Conversations(participant_1_id);
   CREATE INDEX idx_conversations_participant2 ON Conversations(participant_2_id);
   ```

2. **Soft Delete**: Messages with `deletedAt` are not returned by default

3. **Unique Conversations**: Only one conversation exists between two participants

## Security Considerations

1. All chat endpoints require JWT authentication
2. Socket.IO connections verified with JWT token
3. Users can only see their own messages
4. Input validation on all endpoints
5. Rate limiting recommended on chat routes
