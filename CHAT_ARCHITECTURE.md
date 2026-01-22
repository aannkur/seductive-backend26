# Chat System Architecture

## System Design

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT APPLICATION                        │
│  (React/Vue/Angular with Socket.IO Client)                      │
└────────────────┬─────────────────────────────────────┬──────────┘
                 │                                     │
                 │ REST API                 WebSocket  │
                 │ (JSON)                  (Socket.IO) │
                 ▼                                     ▼
    ┌────────────────────────────────────────────────────────┐
    │                    EXPRESS SERVER                       │
    │                   (src/server.ts)                       │
    ├────────────────────────────────────────────────────────┤
    │                                                          │
    │  ┌──────────────────────────────────────────────────┐  │
    │  │           MIDDLEWARE LAYER                       │  │
    │  ├──────────────────────────────────────────────────┤  │
    │  │ • Authentication (JWT)                           │  │
    │  │ • CORS                                           │  │
    │  │ • Error Handling                                 │  │
    │  │ • Logging                                        │  │
    │  └──────────────────────────────────────────────────┘  │
    │                                                          │
    │  ┌──────────────────────────────────────────────────┐  │
    │  │        ROUTES & CONTROLLERS LAYER                │  │
    │  ├──────────────────────────────────────────────────┤  │
    │  │ /api/chat/send                                   │  │
    │  │ /api/chat/conversations                          │  │
    │  │ /api/chat/conversations/:id/messages             │  │
    │  │ /api/chat/conversations/:id/read                 │  │
    │  │ /api/chat/unread-count                           │  │
    │  │ /api/chat/messages/:id (DELETE)                  │  │
    │  └──────────────────────────────────────────────────┘  │
    │                                                          │
    │  ┌──────────────────────────────────────────────────┐  │
    │  │          SOCKET.IO EVENT HANDLERS                │  │
    │  │      (src/utils/socket.handler.ts)               │  │
    │  ├──────────────────────────────────────────────────┤  │
    │  │ • join_conversation                              │  │
    │  │ • send_message                                   │  │
    │  │ • typing / stop_typing                           │  │
    │  │ • mark_as_read                                   │  │
    │  │ • message_notification (outgoing)                │  │
    │  └──────────────────────────────────────────────────┘  │
    │                                                          │
    │  ┌──────────────────────────────────────────────────┐  │
    │  │          SERVICE LAYER                           │  │
    │  │       (src/services/chat.service.ts)             │  │
    │  ├──────────────────────────────────────────────────┤  │
    │  │ • sendMessage()                                  │  │
    │  │ • getConversationMessages()                      │  │
    │  │ • getUserConversations()                         │  │
    │  │ • markMessagesAsRead()                           │  │
    │  │ • searchMessages()                               │  │
    │  │ • getUnreadCount()                               │  │
    │  └──────────────────────────────────────────────────┘  │
    │                                                          │
    └────────────────┬────────────────────────────────────┬──┘
                     │                                    │
                     │ ORM (Sequelize)                    │
                     ▼                                    ▼
    ┌────────────────────────────────┐   ┌──────────────────────┐
    │     DATABASE MODELS            │   │   DATABASE TABLES    │
    ├────────────────────────────────┤   ├──────────────────────┤
    │ • Message.model.ts             │   │ • Messages           │
    │ • Conversation.model.ts        │   │ • Conversations      │
    │ • User.model.ts (existing)     │   │ • users              │
    └────────────────────────────────┘   └──────────────────────┘
                     │
                     │ PostgreSQL Connection
                     ▼
    ┌────────────────────────────────────────────────────────┐
    │          POSTGRESQL DATABASE                           │
    │         (Persistent Storage)                           │
    ├────────────────────────────────────────────────────────┤
    │                                                          │
    │  Table: Conversations                                  │
    │  ├── id (PK)                                           │
    │  ├── participant_1_id (FK → users)                     │
    │  ├── participant_2_id (FK → users)                     │
    │  ├── last_message (TEXT)                               │
    │  ├── last_message_at (TIMESTAMP)                       │
    │  └── createdAt, updatedAt                              │
    │                                                          │
    │  Table: Messages                                       │
    │  ├── id (PK)                                           │
    │  ├── sender_id (FK → users)                            │
    │  ├── receiver_id (FK → users)                          │
    │  ├── conversation_id (FK → Conversations)              │
    │  ├── content (TEXT)                                    │
    │  ├── attachment_url (STRING, nullable)                 │
    │  ├── is_read (BOOLEAN)                                 │
    │  ├── read_at (TIMESTAMP, nullable)                     │
    │  ├── deletedAt (TIMESTAMP, nullable) - soft delete     │
    │  └── createdAt, updatedAt                              │
    │                                                          │
    └────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### Sending a Message (Real-Time)

```
USER A                                           USER B
  │                                               │
  │  1. Compose & Send Message                   │
  ├─────────────────────────────────────────────►│
  │      socket.emit('send_message')             │
  │                                               │
  │  2. Server receives & saves to DB            │
  │      ChatService.sendMessage()               │
  │                                               │
  │  3. Message stored in DB                     │
  │      ├─ Conversations table updated          │
  │      └─ Messages table record created        │
  │                                               │
  │  4. Broadcast to room                        │
  │      io.to(roomName).emit('new_message')     │
  │                                               │
  ├─────────────────────────────────────────────►│
  │  5. Both users receive real-time update      │
  │                                               │
  │  6. Read receipt (optional)                  │
  │◄─────────────────────────────────────────────┤
  │      socket.emit('mark_as_read')             │
  │                                               │
  │  7. Database updated                         │
  │      Message.is_read = true                  │
  │      Message.read_at = now()                 │
  │                                               │
```

### Retrieving Message History

```
CLIENT                    API                    DATABASE
  │                       │                        │
  │  GET /chat/conv/1     │                        │
  ├──────────────────────►│                        │
  │      /messages        │  Query                 │
  │                       ├───────────────────────►│
  │                       │  SELECT * FROM Messages│
  │                       │  WHERE conversation_id │
  │                       │  = 1 ORDER BY created  │
  │                       │                        │
  │                       │  Return rows           │
  │                       │◄───────────────────────┤
  │                       │                        │
  │  JSON Response        │  Include user data     │
  │◄──────────────────────┤  via associations      │
  │  [                    │                        │
  │    {                  │                        │
  │      id, sender,      │                        │
  │      receiver,        │                        │
  │      content, time    │                        │
  │    }                  │                        │
  │  ]                    │                        │
  │                       │                        │
```

### Conversation List Flow

```
USER                    SERVICE                  DATABASE
  │                       │                        │
  │ Request: Get Convs    │                        │
  ├──────────────────────►│                        │
  │                       │ Query                  │
  │                       ├───────────────────────►│
  │                       │ SELECT * FROM Convs   │
  │                       │ WHERE participant IN  │
  │                       │ (user_id)             │
  │                       │                        │
  │                       │ Results with           │
  │                       │ participants + messages│
  │                       │◄───────────────────────┤
  │ Sort by recent        │                        │
  │ Include unread count  │                        │
  │ Include last message  │                        │
  │◄──────────────────────┤                        │
  │ Paginated results     │                        │
  │                       │                        │
```

## Component Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                     CONTROLLER LAYER                        │
│              ChatController                                 │
├─────────────────────────────────────────────────────────────┤
│  • sendMessage()              ┐                             │
│  • getConversations()         │                             │
│  • getConversationMessages()  ├──► Delegates to             │
│  • markAsRead()               │    ChatService              │
│  • getUnreadCount()           │                             │
│  • searchMessages()           ┘                             │
└────────────────┬──────────────────────────────────┬─────────┘
                 │                                  │
                 ▼                                  ▼
        ┌───────────────────┐            ┌─────────────────┐
        │  ChatService      │            │ SocketHandler   │
        ├───────────────────┤            ├─────────────────┤
        │ Business Logic    │            │ Real-time Event │
        │ • DB operations   │            │ • join_conv     │
        │ • Validation      │            │ • send_msg      │
        │ • Formatting      │            │ • typing        │
        └────────┬──────────┘            └────────┬────────┘
                 │                               │
                 └──────────────┬────────────────┘
                                ▼
                    ┌─────────────────────────┐
                    │   ORM (Sequelize)       │
                    │ Models + Associations   │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │   Database Layer        │
                    │ • Conversations         │
                    │ • Messages              │
                    │ • Users                 │
                    └─────────────────────────┘
```

## Message Lifecycle

```
CREATED STATE
    │
    ├─ Message created in DB
    ├─ Conversation updated
    ├─ Sender: sees message immediately
    └─ Receiver: gets real-time notification
    │
    ▼
IN_TRANSIT
    │
    ├─ Message in Messages table
    ├─ is_read = false
    ├─ Receiver notified via Socket.IO
    └─ May remain unread if user offline
    │
    ▼
RECEIVED
    │
    ├─ User opens conversation
    ├─ Queries message history from DB
    ├─ Displays all messages
    └─ Marks read messages
    │
    ▼
READ STATE
    │
    ├─ Receiver sends mark_as_read event
    ├─ Server updates: is_read = true, read_at = now()
    ├─ DB persists read status
    └─ Sender receives read notification
    │
    ▼
DELETED STATE (optional)
    │
    ├─ Soft delete: deletedAt timestamp set
    ├─ Message not returned in queries
    ├─ Can be recovered if needed
    └─ Data remains in DB for audit trail
```

## Performance Considerations

```
OPTIMIZATION STRATEGIES
│
├─ Database Indexes
│  ├─ idx_messages_conversation_id
│  ├─ idx_messages_receiver_id
│  ├─ idx_conversations_participant1
│  └─ idx_conversations_participant2
│
├─ Socket.IO Rooms
│  ├─ conversation_{id} - Message distribution
│  └─ user_{id} - Personal notifications
│
├─ Pagination
│  ├─ Messages: limit 50 per page
│  └─ Conversations: limit 20 per page
│
├─ Caching (Future Enhancement)
│  ├─ Redis for recent conversations
│  ├─ Cache unread counts
│  └─ Cache user online status
│
└─ Query Optimization
   ├─ Include only needed fields
   ├─ Use associations (eager loading)
   ├─ Avoid N+1 queries
   └─ Soft delete filters
```

## Security Flow

```
CLIENT                              SERVER
  │                                  │
  │ 1. Login (existing)              │
  │ ┌────────────────────────────┐  │
  │ │ Receive JWT token          │◄─┤
  │ └────────────────────────────┘  │
  │                                  │
  │ 2. Connect Socket               │
  │ ┌────────────────────────────┐  │
  │ │ Send token in auth header  │  │
  │ └────────────────────────────┼─►│
  │                              │   │ Verify JWT
  │                              │   │ Extract userId
  │                              │   │ Attach to socket
  │                              │  │
  │ 3. Send Message             │  │ Authenticate user
  │ ┌────────────────────────────┼─►│ Validate receiver exists
  │ │ Emit send_message event    │  │ Check authorization
  │ └────────────────────────────┼─►│ Save to DB
  │                              │  │ Broadcast to room
  │ 4. Receive Message          │  │
  │ ┌────────────────────────────┤◄─┤
  │ │ new_message event         │  │
  │ └────────────────────────────┘  │
  │                                  │
```

## Scalability Path

```
CURRENT ARCHITECTURE (Single Server)
│
└─ Express + Socket.IO on one instance
   └─ PostgreSQL for persistence
   
SCALABLE ARCHITECTURE (Future)
│
├─ Load Balancer
│  │
│  ├─ Express Server 1
│  │  └─ Socket.IO
│  │
│  ├─ Express Server 2
│  │  └─ Socket.IO
│  │
│  └─ Express Server N
│     └─ Socket.IO
│
├─ Redis (Message Queue + Adapter)
│  └─ Socket.IO Adapter for cross-server communication
│
└─ PostgreSQL (Cluster)
   └─ Persistent message storage
```

## Flow Summary

1. **REST API**: Traditional HTTP requests for fetching data
2. **WebSocket**: Real-time message delivery and notifications
3. **Database**: PostgreSQL stores all messages and conversations
4. **Service Layer**: Business logic encapsulation
5. **Controllers**: Request handling and response formatting
6. **Middleware**: Authentication, validation, error handling
