import { Server as SocketIOServer, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { ChatService } from "../services/chat.service";

interface AuthenticatedSocket extends Socket {
  userId?: number;
}

export const initializeSocket = (io: SocketIOServer) => {
  // Middleware for authentication
  io.use((socket: AuthenticatedSocket, next) => {
    const token =
      socket.handshake.auth.token ||
      socket.handshake.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
      socket.userId = decoded.id;
      next();
    } catch (error) {
      console.error("xxxxxxxxxxxxxxx Socket authentication error xxxxxxxxxxxxxxx", error);
      next(new Error("Authentication error: Invalid token"));
    }
  });

  // Handle new connections
  io.on("connection", (socket: AuthenticatedSocket) => {
    console.log(`=================> User ${socket.userId} connected <=================`);

    /**
     * User joins a conversation room
     * Event: join_conversation
     * Data: { conversationId }
     */
    socket.on("join_conversation", (data: { conversationId: number }) => {
      const roomName = `conversation_${data.conversationId}`;
      socket.join(roomName);
      console.log(
        `=================> User ${socket.userId} joined conversation ${data.conversationId} <=================`
      );

      // Notify others in the room
      socket.to(roomName).emit("user_joined", {
        userId: socket.userId,
        message: `User ${socket.userId} joined the conversation`,
      });
    });

    /**
     * User leaves a conversation room
     * Event: leave_conversation
     * Data: { conversationId }
     */
    socket.on("leave_conversation", (data: { conversationId: number }) => {
      const roomName = `conversation_${data.conversationId}`;
      socket.leave(roomName);
      console.log(
        `=================> User ${socket.userId} left conversation ${data.conversationId} <=================`
      );

      socket.to(roomName).emit("user_left", {
        userId: socket.userId,
        message: `User ${socket.userId} left the conversation`,
      });
    });

    /**
     * Send a real-time message
     * Event: send_message
     * Data: { receiverId, conversationId, content, attachmentUrl? }
     */
    socket.on(
      "send_message",
      async (data: {
        receiverId: number;
        conversationId: number;
        content: string;
        attachmentUrl?: string;
      }) => {
        try {
          // Send and save message to database
          const message = await ChatService.sendMessage(
            socket.userId!,
            data.receiverId,
            data.content,
            data.attachmentUrl
          );

          // Emit to conversation room
          const roomName = `conversation_${data.conversationId}`;
          io.to(roomName).emit("new_message", {
            id: message.id,
            senderId: message.sender_id,
            receiverId: message.receiver_id,
            conversationId: data.conversationId,
            content: message.content,
            attachmentUrl: message.attachment_url,
            isRead: message.is_read,
            createdAt: message.createdAt,
            sender: message.sender,
          });

          // Emit notification to receiver (if not in conversation room)
          io.to(`user_${data.receiverId}`).emit("message_notification", {
            from: socket.userId,
            conversationId: data.conversationId,
            content: message.content,
            timestamp: message.createdAt,
          });

          console.log(
            `=================> Message sent from ${socket.userId} to ${data.receiverId} <=================`
          );
        } catch (error) {
          console.error(
            "xxxxxxxxxxxxxxx Error sending message xxxxxxxxxxxxxxx",
            error
          );
          socket.emit("error", {
            message: "Failed to send message",
          });
        }
      }
    );

    /**
     * User is typing indicator
     * Event: typing
     * Data: { conversationId }
     */
    socket.on("typing", (data: { conversationId: number }) => {
      const roomName = `conversation_${data.conversationId}`;
      socket.to(roomName).emit("user_typing", {
        userId: socket.userId,
        conversationId: data.conversationId,
      });
    });

    /**
     * User stopped typing
     * Event: stop_typing
     * Data: { conversationId }
     */
    socket.on("stop_typing", (data: { conversationId: number }) => {
      const roomName = `conversation_${data.conversationId}`;
      socket.to(roomName).emit("user_stopped_typing", {
        userId: socket.userId,
        conversationId: data.conversationId,
      });
    });

    /**
     * Mark messages as read
     * Event: mark_as_read
     * Data: { conversationId }
     */
    socket.on(
      "mark_as_read",
      async (data: { conversationId: number }) => {
        try {
          await ChatService.markMessagesAsRead(
            data.conversationId,
            socket.userId!
          );

          const roomName = `conversation_${data.conversationId}`;
          io.to(roomName).emit("messages_read", {
            conversationId: data.conversationId,
            userId: socket.userId,
          });

          console.log(
            `=================> Messages marked as read by user ${socket.userId} <=================`
          );
        } catch (error) {
          console.error(
            "xxxxxxxxxxxxxxx Error marking messages as read xxxxxxxxxxxxxxx",
            error
          );
          socket.emit("error", {
            message: "Failed to mark messages as read",
          });
        }
      }
    );

    /**
     * Join user personal room for notifications
     * Event: join_personal_room
     */
    socket.on("join_personal_room", () => {
      socket.join(`user_${socket.userId}`);
      console.log(
        `=================> User ${socket.userId} joined personal room <=================`
      );
    });

    /**
     * Send a chat request
     * Event: send_chat_request
     * Data: { receiverId, message? }
     */
    socket.on(
      "send_chat_request",
      async (data: { receiverId: number; message?: string }) => {
        try {
          const chatRequest = await ChatService.sendChatRequest(
            socket.userId!,
            data.receiverId,
            data.message
          );

          // Emit to sender confirmation
          socket.emit("chat_request_sent", {
            requestId: chatRequest.id,
            receiverId: data.receiverId,
            status: "pending",
          });

          // Emit to receiver notification
          io.to(`user_${data.receiverId}`).emit("chat_request_received", {
            requestId: chatRequest.id,
            sender: chatRequest.sender,
            message: data.message || null,
          });

          console.log(
            `=================> Chat request sent from ${socket.userId} to ${data.receiverId} <=================`
          );
        } catch (error: any) {
          console.error(
            "xxxxxxxxxxxxxxx Error sending chat request xxxxxxxxxxxxxxx",
            error
          );
          socket.emit("error", {
            message: error.message || "Failed to send chat request",
          });
        }
      }
    );

    /**
     * Accept a chat request
     * Event: accept_chat_request
     * Data: { requestId }
     */
    socket.on(
      "accept_chat_request",
      async (data: { requestId: number }) => {
        try {
          const chatRequest = await ChatService.acceptChatRequest(
            data.requestId,
            socket.userId!
          );

          // Emit to receiver confirmation
          socket.emit("chat_request_accepted", {
            requestId: data.requestId,
            conversationId: chatRequest.conversation_id,
          });

          // Emit to sender notification
          io.to(`user_${chatRequest.sender_id}`).emit(
            "chat_request_accepted_notification",
            {
              requestId: data.requestId,
              receiver: chatRequest.receiver,
              conversationId: chatRequest.conversation_id,
            }
          );

          console.log(
            `=================> Chat request accepted by user ${socket.userId} <=================`
          );
        } catch (error: any) {
          console.error(
            "xxxxxxxxxxxxxxx Error accepting chat request xxxxxxxxxxxxxxx",
            error
          );
          socket.emit("error", {
            message: error.message || "Failed to accept chat request",
          });
        }
      }
    );

    /**
     * Reject a chat request
     * Event: reject_chat_request
     * Data: { requestId }
     */
    socket.on(
      "reject_chat_request",
      async (data: { requestId: number }) => {
        try {
          await ChatService.rejectChatRequest(data.requestId, socket.userId!);

          // Emit to receiver confirmation
          socket.emit("chat_request_rejected", {
            requestId: data.requestId,
          });

          console.log(
            `=================> Chat request rejected by user ${socket.userId} <=================`
          );
        } catch (error: any) {
          console.error(
            "xxxxxxxxxxxxxxx Error rejecting chat request xxxxxxxxxxxxxxx",
            error
          );
          socket.emit("error", {
            message: error.message || "Failed to reject chat request",
          });
        }
      }
    );

    /**
     * Get online status
     * Event: check_online
     * Data: { userIds[] }
     */
    socket.on("check_online", (data: { userIds: number[] }) => {
      const onlineUsers = data.userIds.filter((userId) => {
        return Array.from(io.sockets.sockets.values()).some((s: AuthenticatedSocket) => {
          return s.userId === userId;
        });
      });

      socket.emit("online_status", {
        onlineUsers,
      });
    });

    /**
     * Handle disconnect
     */
    socket.on("disconnect", () => {
      console.log(`=================> User ${socket.userId} disconnected <=================`);
    });

    /**
     * Error handling
     */
    socket.on("error", (error) => {
      console.error(
        "xxxxxxxxxxxxxxx Socket error xxxxxxxxxxxxxxx",
        error
      );
    });
  });
};
