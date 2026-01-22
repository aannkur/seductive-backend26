# Chat System - Usage Examples

## Complete Real-World Examples

### Example 1: Basic REST API Chat (cURL)

#### Step 1: User 1 sends a message to User 2

```bash
curl -X POST http://localhost:3010/api/chat/send \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "receiverId": 2,
    "content": "Hey! How are you doing today?"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent",
  "data": {
    "id": 101,
    "sender_id": 1,
    "receiver_id": 2,
    "conversation_id": 1,
    "content": "Hey! How are you doing today?",
    "attachment_url": null,
    "is_read": false,
    "read_at": null,
    "createdAt": "2026-01-21T10:30:00Z",
    "updatedAt": "2026-01-21T10:30:00Z"
  }
}
```

#### Step 2: User 1 retrieves conversation list

```bash
curl http://localhost:3010/api/chat/conversations \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": 1,
        "participant_1_id": 1,
        "participant_2_id": 2,
        "last_message": "Hey! How are you doing today?",
        "last_message_at": "2026-01-21T10:30:00Z",
        "participant1": {
          "id": 1,
          "name": "John Doe",
          "profile_name": "johndoe",
          "username": "john.doe",
          "profile_photo": "https://example.com/photo1.jpg"
        },
        "participant2": {
          "id": 2,
          "name": "Jane Smith",
          "profile_name": "janesmith",
          "username": "jane.smith",
          "profile_photo": "https://example.com/photo2.jpg"
        }
      }
    ],
    "total": 1,
    "page": 1,
    "totalPages": 1
  }
}
```

#### Step 3: Retrieve message history from conversation

```bash
curl "http://localhost:3010/api/chat/conversations/1/messages?page=1&limit=50" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": 101,
        "sender_id": 1,
        "receiver_id": 2,
        "conversation_id": 1,
        "content": "Hey! How are you doing today?",
        "attachment_url": null,
        "is_read": false,
        "read_at": null,
        "createdAt": "2026-01-21T10:30:00Z",
        "sender": {
          "id": 1,
          "name": "John Doe",
          "username": "john.doe",
          "profile_photo": "https://example.com/photo1.jpg"
        },
        "receiver": {
          "id": 2,
          "name": "Jane Smith",
          "username": "jane.smith",
          "profile_photo": "https://example.com/photo2.jpg"
        }
      }
    ],
    "total": 1,
    "page": 1,
    "totalPages": 1
  }
}
```

#### Step 4: User 2 marks messages as read

```bash
curl -X PUT http://localhost:3010/api/chat/conversations/1/read \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "success": true,
  "message": "Messages marked as read"
}
```

---

## Example 2: Real-Time Chat with WebSocket (JavaScript)

### Complete Chat Implementation

```javascript
import io from 'socket.io-client';

class ChatManager {
  constructor(token, userId) {
    this.token = token;
    this.userId = userId;
    this.socket = null;
    this.currentConversationId = null;
    this.messages = [];
    this.isTyping = false;
    this.typingTimeout = null;
  }

  // Initialize Socket.IO connection
  connect() {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io('http://localhost:3010', {
          auth: {
            token: this.token
          },
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5
        });

        // Connection established
        this.socket.on('connect', () => {
          console.log('Connected to chat server');
          this.setupEventListeners();
          resolve(this.socket);
        });

        // Connection error
        this.socket.on('error', (error) => {
          console.error('Connection error:', error);
          reject(error);
        });

        // Authentication error
        this.socket.on('connect_error', (error) => {
          console.error('Authentication failed:', error);
          reject(error);
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  // Setup all event listeners
  setupEventListeners() {
    // Listen for new messages
    this.socket.on('new_message', (message) => {
      console.log('New message received:', message);
      this.onMessageReceived(message);
    });

    // Listen for message notifications
    this.socket.on('message_notification', (data) => {
      console.log('Message notification:', data);
      this.onNotification(data);
    });

    // Listen for typing indicators
    this.socket.on('user_typing', (data) => {
      console.log('User typing:', data.userId);
      this.onUserTyping(data);
    });

    // Listen for stop typing
    this.socket.on('user_stopped_typing', (data) => {
      console.log('User stopped typing:', data.userId);
      this.onUserStoppedTyping(data);
    });

    // Listen for read receipts
    this.socket.on('messages_read', (data) => {
      console.log('Messages read:', data);
      this.onMessagesRead(data);
    });

    // Listen for user joined
    this.socket.on('user_joined', (data) => {
      console.log('User joined:', data);
    });

    // Listen for user left
    this.socket.on('user_left', (data) => {
      console.log('User left:', data);
    });

    // Listen for errors
    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  // Join a conversation room
  joinConversation(conversationId) {
    this.currentConversationId = conversationId;
    this.socket.emit('join_conversation', { conversationId });
    console.log(`Joined conversation ${conversationId}`);
  }

  // Leave a conversation room
  leaveConversation(conversationId) {
    this.socket.emit('leave_conversation', { conversationId });
    this.currentConversationId = null;
    console.log(`Left conversation ${conversationId}`);
  }

  // Send a message
  sendMessage(receiverId, content, attachmentUrl = null) {
    if (!this.currentConversationId) {
      console.error('Not in a conversation');
      return;
    }

    const messageData = {
      receiverId,
      conversationId: this.currentConversationId,
      content,
      attachmentUrl
    };

    this.socket.emit('send_message', messageData);
    console.log('Message sent:', messageData);
    
    // Stop typing indicator
    this.stopTyping();
  }

  // Notify about typing
  typing() {
    if (this.isTyping) return;

    this.isTyping = true;
    this.socket.emit('typing', {
      conversationId: this.currentConversationId
    });

    // Clear existing timeout
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }

    // Auto stop typing after 3 seconds
    this.typingTimeout = setTimeout(() => {
      this.stopTyping();
    }, 3000);
  }

  // Stop typing indicator
  stopTyping() {
    if (!this.isTyping) return;

    this.isTyping = false;
    this.socket.emit('stop_typing', {
      conversationId: this.currentConversationId
    });
  }

  // Mark messages as read
  markAsRead() {
    if (!this.currentConversationId) return;

    this.socket.emit('mark_as_read', {
      conversationId: this.currentConversationId
    });
  }

  // Join personal notification room
  joinPersonalRoom() {
    this.socket.emit('join_personal_room');
    console.log('Joined personal notification room');
  }

  // Callback: Message received
  onMessageReceived(message) {
    this.messages.push(message);
    console.log('UI: Display message', message);
    // Trigger UI update here
  }

  // Callback: Notification received
  onNotification(data) {
    console.log('UI: Show notification', data);
    // Show toast/notification here
  }

  // Callback: User typing
  onUserTyping(data) {
    console.log('UI: Show typing indicator for user', data.userId);
    // Show "User is typing..." in UI
  }

  // Callback: User stopped typing
  onUserStoppedTyping(data) {
    console.log('UI: Hide typing indicator for user', data.userId);
  }

  // Callback: Messages read
  onMessagesRead(data) {
    console.log('UI: Mark messages as read in conversation', data.conversationId);
    // Update message UI to show read status
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      console.log('Disconnected from chat server');
    }
  }
}

// USAGE EXAMPLE
async function main() {
  // Initialize
  const chat = new ChatManager('your-jwt-token', 1);

  try {
    // Connect to server
    await chat.connect();
    console.log('✓ Connected');

    // Join personal notification room
    chat.joinPersonalRoom();

    // Join a conversation
    chat.joinConversation(1);

    // Send a message
    chat.sendMessage(2, 'Hello! How are you?');

    // Simulate typing
    chat.typing();
    setTimeout(() => {
      chat.sendMessage(2, 'This is my message');
    }, 2000);

    // Mark as read after receiving
    setTimeout(() => {
      chat.markAsRead();
    }, 5000);

    // Leave conversation after 10 seconds
    setTimeout(() => {
      chat.leaveConversation(1);
    }, 10000);

    // Disconnect after 15 seconds
    setTimeout(() => {
      chat.disconnect();
    }, 15000);

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run
main();
```

---

## Example 3: React Component Implementation

```jsx
import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const ChatComponent = ({ currentUserId, token }) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const typingTimeoutRef = useRef(null);

  // Initialize Socket.IO
  useEffect(() => {
    const newSocket = io('http://localhost:3010', {
      auth: { token }
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      newSocket.emit('join_personal_room');
    });

    newSocket.on('new_message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('message_notification', (data) => {
      console.log('New message from:', data.from);
      // Show notification
      showNotification(`New message from conversation ${data.conversationId}`);
    });

    newSocket.on('user_typing', (data) => {
      setIsTyping(true);
    });

    newSocket.on('user_stopped_typing', () => {
      setIsTyping(false);
    });

    newSocket.on('messages_read', (data) => {
      setMessages(prev =>
        prev.map(msg =>
          msg.conversationId === data.conversationId
            ? { ...msg, is_read: true }
            : msg
        )
      );
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, [token]);

  // Fetch conversations on mount
  useEffect(() => {
    if (socket) {
      fetchConversations();
      fetchUnreadCount();
    }
  }, [socket]);

  // Fetch conversations from API
  const fetchConversations = async () => {
    try {
      const response = await fetch('http://localhost:3010/api/chat/conversations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setConversations(data.data.conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('http://localhost:3010/api/chat/unread-count', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Select conversation
  const selectConversation = async (conversationId) => {
    setSelectedConversation(conversationId);
    socket.emit('join_conversation', { conversationId });

    // Fetch messages
    try {
      const response = await fetch(
        `http://localhost:3010/api/chat/conversations/${conversationId}/messages`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = await response.json();
      setMessages(data.data.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }

    // Mark as read
    socket.emit('mark_as_read', { conversationId });
    fetchUnreadCount();
  };

  // Send message
  const handleSendMessage = () => {
    if (!inputMessage.trim() || !selectedConversation) return;

    const receiverId = conversations.find(c => c.id === selectedConversation)
      ?.participant2?.id || conversations.find(c => c.id === selectedConversation)
      ?.participant1?.id;

    socket.emit('send_message', {
      receiverId,
      conversationId: selectedConversation,
      content: inputMessage
    });

    setInputMessage('');
    socket.emit('stop_typing', { conversationId: selectedConversation });
  };

  // Handle typing
  const handleTyping = (e) => {
    setInputMessage(e.target.value);

    socket.emit('typing', { conversationId: selectedConversation });

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', { conversationId: selectedConversation });
    }, 3000);
  };

  // Show notification
  const showNotification = (message) => {
    if ('Notification' in window) {
      new Notification('Chat', { body: message });
    }
  };

  return (
    <div className="chat-container">
      <div className="conversations-list">
        <h2>Conversations ({unreadCount})</h2>
        {conversations.map(conv => (
          <div
            key={conv.id}
            className={`conversation-item ${selectedConversation === conv.id ? 'active' : ''}`}
            onClick={() => selectConversation(conv.id)}
          >
            <img
              src={conv.participant2?.profile_photo || conv.participant1?.profile_photo}
              alt="User"
            />
            <div>
              <h3>{conv.participant2?.name || conv.participant1?.name}</h3>
              <p>{conv.last_message}</p>
              <small>{new Date(conv.last_message_at).toLocaleString()}</small>
            </div>
          </div>
        ))}
      </div>

      {selectedConversation && (
        <div className="chat-window">
          <div className="messages-area">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`message ${msg.sender_id === currentUserId ? 'sent' : 'received'}`}
              >
                <img src={msg.sender?.profile_photo} alt={msg.sender?.name} />
                <div className="message-content">
                  <p>{msg.content}</p>
                  <small>
                    {new Date(msg.createdAt).toLocaleTimeString()}
                    {msg.is_read && ' ✓✓'}
                  </small>
                </div>
              </div>
            ))}
            {isTyping && <div className="typing-indicator">User is typing...</div>}
          </div>

          <div className="input-area">
            <input
              type="text"
              value={inputMessage}
              onChange={handleTyping}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message..."
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatComponent;
```

---

## Example 4: Message with Attachment

```bash
# Send message with image attachment
curl -X POST http://localhost:3010/api/chat/send \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "receiverId": 2,
    "content": "Check out this photo!",
    "attachmentUrl": "https://example.com/uploads/photo-123.jpg"
  }'
```

---

## Example 5: Search Messages

```bash
# Search for messages in conversation
curl "http://localhost:3010/api/chat/conversations/1/search?q=hello&page=1&limit=20" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": 101,
        "content": "Hello there!",
        "sender": { "id": 1, "name": "John" },
        "receiver": { "id": 2, "name": "Jane" },
        "createdAt": "2026-01-21T10:30:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "totalPages": 1
  }
}
```

---

## Example 6: Error Handling

```javascript
// REST API error handling
async function sendMessageWithErrorHandling(token, receiverId, content) {
  try {
    const response = await fetch('http://localhost:3010/api/chat/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ receiverId, content })
    });

    if (!response.ok) {
      const error = await response.json();
      
      if (response.status === 401) {
        console.error('Unauthorized - Invalid token');
      } else if (response.status === 400) {
        console.error('Bad request -', error.error);
      } else if (response.status === 500) {
        console.error('Server error');
      }
      return null;
    }

    const data = await response.json();
    return data.data;

  } catch (error) {
    console.error('Network error:', error);
    return null;
  }
}
```

These examples demonstrate the complete chat system functionality!
