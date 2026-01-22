# Chat Feature - Quick Setup Guide

## What Was Implemented

A complete real-time chat system with:
- ✅ Real-time messaging via WebSocket (Socket.IO)
- ✅ Message storage in PostgreSQL database
- ✅ Conversation management
- ✅ Read/unread status tracking
- ✅ Message search
- ✅ Typing indicators
- ✅ REST API + WebSocket support

## File Structure

```
src/
├── models/
│   ├── message.model.ts          (NEW - Message storage)
│   ├── conversation.model.ts     (NEW - Chat threads)
│   └── index.ts                  (UPDATED - Added models)
├── services/
│   └── chat.service.ts           (NEW - Business logic)
├── controllers/
│   └── chat.controller.ts        (NEW - API handlers)
├── routes/
│   ├── chat.routes.ts            (NEW - Chat endpoints)
│   └── index.ts                  (UPDATED - Added route)
├── utils/
│   └── socket.handler.ts         (NEW - WebSocket events)
├── server.ts                     (UPDATED - Socket.IO setup)
└── app.ts                        (No changes needed)
```

## Quick Start

### 1. Database Setup
Ensure your `.env` file has:
```env
DB_NAME=your_db_name
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432
DB_SYNC=true
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-secret-key
```

### 2. Start the Server
```bash
npm run dev
```

The server now includes Socket.IO on the same port.

### 3. Database will automatically create tables:
- `Conversations` table
- `Messages` table

## REST API Usage

### Send a Message
```bash
curl -X POST http://localhost:3010/api/chat/send \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"receiverId": 2, "content": "Hello!"}'
```

### Get Conversations
```bash
curl http://localhost:3010/api/chat/conversations \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Messages from Conversation
```bash
curl "http://localhost:3010/api/chat/conversations/1/messages?page=1&limit=50" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Mark as Read
```bash
curl -X PUT http://localhost:3010/api/chat/conversations/1/read \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## WebSocket Usage (JavaScript)

```javascript
import io from 'socket.io-client';

// Connect
const socket = io('http://localhost:3010', {
  auth: { token: 'your-jwt-token' }
});

// Join a conversation
socket.emit('join_conversation', { conversationId: 1 });

// Send a message
socket.emit('send_message', {
  receiverId: 2,
  conversationId: 1,
  content: 'Hello!'
});

// Listen for new messages
socket.on('new_message', (message) => {
  console.log('New message:', message);
});

// Typing indicator
socket.emit('typing', { conversationId: 1 });
socket.on('user_typing', (data) => {
  console.log('User is typing:', data.userId);
});

// Mark as read
socket.emit('mark_as_read', { conversationId: 1 });
```

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/send` | Send message |
| GET | `/api/chat/conversations` | List conversations |
| GET | `/api/chat/conversations/:id/messages` | Get messages |
| PUT | `/api/chat/conversations/:id/read` | Mark as read |
| GET | `/api/chat/unread-count` | Get unread count |
| GET | `/api/chat/unread` | Get unread messages |
| GET | `/api/chat/conversations/:id/search?q=term` | Search messages |
| DELETE | `/api/chat/messages/:id` | Delete message |

## WebSocket Events

**Client → Server:**
- `join_conversation` - Join chat room
- `send_message` - Send message
- `typing` - User typing
- `stop_typing` - Stop typing
- `mark_as_read` - Mark messages read
- `join_personal_room` - Join notification room

**Server → Client:**
- `new_message` - New message in room
- `message_notification` - Message notification
- `user_typing` - Someone typing
- `user_stopped_typing` - Stop typing
- `messages_read` - Messages marked read

## Features

### Message Features
- Text messages
- File/image attachments
- Read receipts
- Soft delete
- Message search

### Conversation Features
- Automatic conversation creation
- Participant tracking
- Last message preview
- Sorted by recent activity

### Real-Time Features
- Live message delivery
- Typing indicators
- Read notifications
- User presence tracking

### Data Persistence
- All messages stored in PostgreSQL
- Conversation history
- Read/unread status
- Message timestamps

## Testing

### Create 2 Users First
Use your existing auth endpoints to create 2 users with IDs 1 and 2.

### Send Message via REST
```bash
POST /api/chat/send
{ "receiverId": 2, "content": "Hello" }
```

### Send Message via WebSocket
```javascript
socket.emit('send_message', {
  receiverId: 2,
  conversationId: 1,
  content: "Hello via Socket!"
})
```

### Verify in Database
```sql
SELECT * FROM "Conversations";
SELECT * FROM "Messages";
```

## Database Optimization (Optional)

Add indexes for better performance:
```sql
CREATE INDEX idx_msg_conv ON "Messages"(conversation_id);
CREATE INDEX idx_msg_receiver ON "Messages"(receiver_id);
CREATE INDEX idx_conv_p1 ON "Conversations"(participant_1_id);
CREATE INDEX idx_conv_p2 ON "Conversations"(participant_2_id);
```

## Common Issues

### Issue: Messages not appearing real-time
**Solution**: Ensure client is joined to the conversation room
```javascript
socket.emit('join_conversation', { conversationId: 1 });
```

### Issue: Token authentication failing
**Solution**: Pass token in Socket.IO auth during connection
```javascript
const socket = io(url, { auth: { token: 'your-token' } });
```

### Issue: Database sync failing
**Solution**: Ensure DB_SYNC=true in .env and restart server

## Next Steps

1. ✅ Chat infrastructure is set up
2. Test with 2 user accounts
3. Connect frontend with Socket.IO client
4. Implement UI for chat
5. Add message notifications
6. Deploy to production

## See Full Documentation
Check `CHAT_IMPLEMENTATION.md` for detailed API documentation and examples.
