# Chat System - Troubleshooting Guide

## Common Issues and Solutions

### 1. Database Connection Errors

#### Issue: "Unable to connect to database"
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solutions:**
1. Verify PostgreSQL is running
2. Check `.env` database credentials
3. Verify DB_HOST and DB_PORT in `.env`
4. Test connection manually:
   ```bash
   psql -h localhost -U your_user -d your_db
   ```

---

### 2. Socket.IO Connection Failures

#### Issue: WebSocket connection refused
```javascript
Error: Error: websocket error
```

**Solutions:**
1. **Check token is provided:**
   ```javascript
   const socket = io('http://localhost:3010', {
     auth: { token: 'your-jwt-token' }  // ← Must not be empty
   });
   ```

2. **Verify JWT_SECRET in .env matches auth token generation**

3. **Check CORS configuration:**
   ```typescript
   // In server.ts
   const io = new SocketIOServer(httpServer, {
     cors: {
       origin: process.env.FRONTEND_URL || "http://localhost:3000",
       credentials: true,
     },
   });
   ```

4. **Ensure correct WebSocket URL:**
   ```javascript
   // ✓ Correct (http without /socket.io)
   const socket = io('http://localhost:3010', { auth: { token } });
   
   // ✗ Incorrect
   const socket = io('http://localhost:3010/socket.io', { auth: { token } });
   ```

---

### 3. Authentication Errors

#### Issue: "Unauthorized: Invalid token"
```json
{ "error": "Unauthorized: Invalid token", "UA": true }
```

**Solutions:**
1. Generate valid JWT token:
   ```bash
   # Use your auth endpoint to generate token
   POST /api/auth/login
   ```

2. Include token in all requests:
   ```bash
   curl -H "Authorization: Bearer TOKEN" http://localhost:3010/api/chat/conversations
   ```

3. Verify JWT_SECRET matches across app:
   ```bash
   # Check .env
   JWT_SECRET=your-actual-secret-key
   ```

---

### 4. Message Not Appearing in Real-Time

#### Issue: Message sent but other user doesn't receive it immediately
```javascript
// Socket sends, but other user doesn't see it
socket.emit('send_message', { ... });
```

**Solutions:**
1. **Ensure user is joined to conversation:**
   ```javascript
   // Before sending message
   socket.emit('join_conversation', { conversationId: 1 });
   ```

2. **Listen for the correct event:**
   ```javascript
   // ✓ Correct
   socket.on('new_message', (message) => { ... });
   
   // ✗ Incorrect (event name typo)
   socket.on('newMessage', (message) => { ... });
   ```

3. **Check if both users are in the same room:**
   ```javascript
   // User A
   socket.emit('join_conversation', { conversationId: 1 });
   
   // User B must also join
   socket.emit('join_conversation', { conversationId: 1 });
   ```

4. **Verify receiverId is correct:**
   ```javascript
   // Make sure receiverId is the OTHER user's ID
   socket.emit('send_message', {
     receiverId: 2,  // ← Must be different from current user ID
     conversationId: 1,
     content: 'Hello'
   });
   ```

---

### 5. Messages Not Saving to Database

#### Issue: Messages sent but not stored in database
```sql
SELECT * FROM "Messages";  -- Empty result
```

**Solutions:**
1. **Verify DB_SYNC=true:**
   ```bash
   # .env
   DB_SYNC=true  # ← Must be true for first run
   ```

2. **Check database tables exist:**
   ```sql
   \dt  -- List tables in psql
   SELECT * FROM "Messages";
   SELECT * FROM "Conversations";
   ```

3. **Manually create tables if missing:**
   ```bash
   # Restart server with DB_SYNC=true
   npm run dev
   ```

4. **Check server logs:**
   ```bash
   # Look for "Database synchronized" message
   npm run dev  # Check output
   ```

---

### 6. Unread Count Not Updating

#### Issue: `getUnreadCount()` returns 0 even when messages exist
```javascript
const count = await ChatService.getUnreadCount(userId);
console.log(count);  // 0 (but messages exist)
```

**Solutions:**
1. **Verify receiver_id matches userId:**
   ```sql
   -- Check if receiver_id matches the user requesting
   SELECT * FROM "Messages" WHERE receiver_id = 2 AND is_read = false;
   ```

2. **Ensure is_read is false:**
   ```sql
   UPDATE "Messages" SET is_read = false WHERE receiver_id = 2;
   ```

3. **Check message timestamps:**
   ```sql
   SELECT * FROM "Messages" ORDER BY "createdAt" DESC LIMIT 10;
   ```

---

### 7. Conversations List Empty

#### Issue: `getUserConversations()` returns empty array
```javascript
const result = await ChatService.getUserConversations(userId);
console.log(result.conversations);  // []
```

**Solutions:**
1. **Verify user ID:**
   ```sql
   -- Check if user exists
   SELECT * FROM "users" WHERE id = 1;
   ```

2. **Check conversations exist:**
   ```sql
   SELECT * FROM "Conversations" 
   WHERE participant_1_id = 1 OR participant_2_id = 1;
   ```

3. **Send message first to create conversation:**
   ```bash
   POST /api/chat/send
   { "receiverId": 2, "content": "test" }
   ```

4. **Check participant ordering:**
   ```javascript
   // Conversations ordered regardless of participant order
   // Should return conversations where userId is either participant
   ```

---

### 8. CORS Errors

#### Issue: "Access to XMLHttpRequest blocked by CORS"
```
CORS error: Access-Control-Allow-Origin
```

**Solutions:**
1. **Check CORS configuration in app.ts:**
   ```typescript
   app.use(cors({
     origin: process.env.FRONTEND_URL || "http://localhost:3000",
     credentials: true,
   }));
   ```

2. **Update FRONTEND_URL in .env:**
   ```bash
   FRONTEND_URL=http://localhost:3000  # ← Your frontend URL
   ```

3. **For local testing:**
   ```bash
   FRONTEND_URL=http://localhost:3000
   # or
   FRONTEND_URL=http://127.0.0.1:3000
   ```

4. **For production:**
   ```bash
   FRONTEND_URL=https://your-domain.com
   ```

---

### 9. Port Already in Use

#### Issue: "Error: listen EADDRINUSE :::3010"
```
EADDRINUSE: address already in use :::3010
```

**Solutions:**
1. **Change PORT in .env:**
   ```bash
   PORT=3011  # Use different port
   ```

2. **Kill process on port 3010:**
   ```bash
   # Windows
   netstat -ano | findstr :3010
   taskkill /PID <PID> /F
   
   # Mac/Linux
   lsof -i :3010
   kill -9 <PID>
   ```

3. **Use different port in test:**
   ```javascript
   const socket = io('http://localhost:3011', { auth: { token } });
   ```

---

### 10. Typing Indicator Not Working

#### Issue: Typing event not triggering
```javascript
socket.emit('typing', { conversationId: 1 });
// Other user doesn't see "user is typing"
```

**Solutions:**
1. **Emit stop_typing after typing:**
   ```javascript
   // Good practice
   socket.emit('typing', { conversationId: 1 });
   
   setTimeout(() => {
     socket.emit('stop_typing', { conversationId: 1 });
   }, 3000);
   ```

2. **Listen for typing events:**
   ```javascript
   socket.on('user_typing', (data) => {
     console.log('User ' + data.userId + ' is typing');
   });
   
   socket.on('user_stopped_typing', (data) => {
     console.log('User ' + data.userId + ' stopped typing');
   });
   ```

3. **Ensure user is in room:**
   ```javascript
   // Must join before seeing typing events
   socket.emit('join_conversation', { conversationId: 1 });
   ```

---

### 11. Delete Message Not Working

#### Issue: Message still visible after delete
```bash
DELETE /api/chat/messages/101
```

**Solutions:**
1. **Understand soft delete:**
   ```sql
   -- Message not deleted from DB, just marked
   SELECT * FROM "Messages" WHERE "deletedAt" IS NULL;
   -- Deleted messages have deletedAt timestamp
   ```

2. **Check service filters:**
   ```typescript
   // Service queries exclude soft-deleted messages
   // Check ChatService.getConversationMessages()
   ```

3. **To permanently delete:**
   ```sql
   DELETE FROM "Messages" WHERE id = 101;
   ```

---

### 12. Search Not Finding Messages

#### Issue: Search returns no results
```bash
GET /api/chat/conversations/1/search?q=hello
```

**Solutions:**
1. **Verify message exists:**
   ```sql
   SELECT * FROM "Messages" 
   WHERE conversation_id = 1 
   AND content ILIKE '%hello%';
   ```

2. **Check case sensitivity:**
   ```javascript
   // Search is case-insensitive (ILIKE)
   // "Hello", "HELLO", "hello" all match
   ```

3. **Ensure proper URL encoding:**
   ```javascript
   const term = encodeURIComponent('search term');
   const url = `/api/chat/conversations/1/search?q=${term}`;
   ```

4. **Test in database:**
   ```sql
   SELECT * FROM "Messages" 
   WHERE conversation_id = 1;
   -- If empty, no messages in conversation
   ```

---

### 13. Database Sync Issues

#### Issue: Tables not created on startup
```
Database synchronized (but no tables created)
```

**Solutions:**
1. **Enable sync in .env:**
   ```bash
   DB_SYNC=true
   ```

2. **Check server logs:**
   ```bash
   npm run dev
   # Should show: "Database synchronized"
   ```

3. **Verify models are imported:**
   ```typescript
   // In src/models/index.ts
   import Message from "./message.model";
   import Conversation from "./conversation.model";
   ```

4. **Force resync:**
   ```bash
   # Delete tables manually
   psql -U user -d db -c "DROP TABLE IF EXISTS Messages;"
   psql -U user -d db -c "DROP TABLE IF EXISTS Conversations;"
   
   # Restart with DB_SYNC=true
   npm run dev
   ```

---

### 14. Performance Issues

#### Issue: Slow message loading or high CPU usage

**Solutions:**
1. **Add database indexes:**
   ```sql
   CREATE INDEX idx_msg_conv ON "Messages"(conversation_id);
   CREATE INDEX idx_msg_receiver ON "Messages"(receiver_id);
   CREATE INDEX idx_conv_p1 ON "Conversations"(participant_1_id);
   CREATE INDEX idx_conv_p2 ON "Conversations"(participant_2_id);
   ```

2. **Verify pagination is used:**
   ```javascript
   // Good (paginated)
   GET /api/chat/conversations/1/messages?page=1&limit=50
   
   // Bad (no pagination)
   GET /api/chat/conversations/1/messages
   ```

3. **Monitor query performance:**
   ```typescript
   // In src/config/db.ts
   logging: console.log,  // Log all queries to debug slow queries
   ```

---

### 15. Testing Checklist

Before going to production, verify:

```
✓ Database tables created (Messages, Conversations)
✓ Can send message via REST API
✓ Can send message via WebSocket
✓ Can retrieve conversation list
✓ Can retrieve message history
✓ Can mark messages as read
✓ Can get unread count
✓ Typing indicators work
✓ Real-time delivery works
✓ CORS allows frontend requests
✓ JWT authentication works
✓ Soft delete works
✓ Search works
✓ Pagination works
✓ Error handling returns proper status codes
```

---

## Quick Diagnostic Commands

```bash
# 1. Check if server is running
curl http://localhost:3010

# 2. Check if chat API is accessible
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3010/api/chat/conversations

# 3. Check database connection
psql -h localhost -U user -d database -c "SELECT 1;"

# 4. Check if tables exist
psql -h localhost -U user -d database -c "\dt"

# 5. Check messages count
psql -h localhost -U user -d database \
  -c "SELECT COUNT(*) FROM \"Messages\";"

# 6. Check conversations count
psql -h localhost -U user -d database \
  -c "SELECT COUNT(*) FROM \"Conversations\";"
```

---

## Debug Logging

Enable detailed logging:

```typescript
// In src/config/db.ts
const sequelize = new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: "postgres",
  logging: console.log,  // ← Enable logging
});
```

Then check server output:

```bash
npm run dev
# You'll see all SQL queries being executed
```

---

## Getting Help

If issue persists:

1. **Check logs** - npm run dev output
2. **Check database** - Query with psql
3. **Check .env** - All variables set correctly
4. **Test with cURL** - Verify API works
5. **Check browser console** - Frontend errors
6. **Review Socket.IO events** - Check event names

Good luck! 🚀
