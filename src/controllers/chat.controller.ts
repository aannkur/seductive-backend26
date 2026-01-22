import { Response } from "express";
import { AuthenticatedRequest } from "../types/common.type";
import { ChatService } from "../services/chat.service";
import { MESSAGES } from "../constants/messages";

export class ChatController {
  /**
   * Send a chat request
   */
  static async sendChatRequest(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<any> {
    try {
      const userId = req.user?.id;
      const { receiverId, message } = req.body;

      if (!receiverId) {
        return res.status(400).json({
          error: "Receiver ID is required",
        });
      }

      if (userId === receiverId) {
        return res.status(400).json({
          error: "Cannot send chat request to yourself",
        });
      }

      const chatRequest = await ChatService.sendChatRequest(
        userId,
        receiverId,
        message
      );

      return res.status(201).json({
        success: true,
        message: "Chat request sent",
        data: chatRequest,
      });
    } catch (error: any) {
      console.error(
        "xxxxxxxxxxxxxxx Send chat request error xxxxxxxxxxxxxxx",
        error
      );
      return res.status(400).json({
        error: error.message || "Failed to send chat request",
      });
    }
  }

  /**
   * Accept a chat request
   */
  static async acceptChatRequest(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<any> {
    try {
      const userId = req.user?.id;
      const { requestId } = req.params;

      if (!requestId) {
        return res.status(400).json({
          error: "Request ID is required",
        });
      }

      const chatRequest = await ChatService.acceptChatRequest(
        parseInt(requestId),
        userId
      );

      return res.status(200).json({
        success: true,
        message: "Chat request accepted",
        data: chatRequest,
      });
    } catch (error: any) {
      console.error(
        "xxxxxxxxxxxxxxx Accept chat request error xxxxxxxxxxxxxxx",
        error
      );
      return res.status(400).json({
        error: error.message || "Failed to accept chat request",
      });
    }
  }

  /**
   * Reject a chat request
   */
  static async rejectChatRequest(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<any> {
    try {
      const userId = req.user?.id;
      const { requestId } = req.params;

      if (!requestId) {
        return res.status(400).json({
          error: "Request ID is required",
        });
      }

      await ChatService.rejectChatRequest(parseInt(requestId), userId);

      return res.status(200).json({
        success: true,
        message: "Chat request rejected",
      });
    } catch (error: any) {
      console.error(
        "xxxxxxxxxxxxxxx Reject chat request error xxxxxxxxxxxxxxx",
        error
      );
      return res.status(400).json({
        error: error.message || "Failed to reject chat request",
      });
    }
  }

  /**
   * Get pending chat requests
   */
  static async getPendingRequests(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<any> {
    try {
      const userId = req.user?.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await ChatService.getPendingRequests(userId, page, limit);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error(
        "xxxxxxxxxxxxxxx Get pending requests error xxxxxxxxxxxxxxx",
        error
      );
      return res.status(500).json({
        error: "Failed to fetch pending requests",
      });
    }
  }

  /**
   * Get sent chat requests
   */
  static async getSentRequests(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<any> {
    try {
      const userId = req.user?.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await ChatService.getSentRequests(userId, page, limit);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error(
        "xxxxxxxxxxxxxxx Get sent requests error xxxxxxxxxxxxxxx",
        error
      );
      return res.status(500).json({
        error: "Failed to fetch sent requests",
      });
    }
  }

  /**
   * Get all chat requests (sent and received)
   */
  static async getAllRequests(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<any> {
    try {
      const userId = req.user?.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await ChatService.getAllChatRequests(userId, page, limit);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error(
        "xxxxxxxxxxxxxxx Get all requests error xxxxxxxxxxxxxxx",
        error
      );
      return res.status(500).json({
        error: "Failed to fetch requests",
      });
    }
  }

  /**
   * Cancel a sent chat request
   */
  static async cancelChatRequest(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<any> {
    try {
      const userId = req.user?.id;
      const { requestId } = req.params;

      if (!requestId) {
        return res.status(400).json({
          error: "Request ID is required",
        });
      }

      await ChatService.cancelChatRequest(parseInt(requestId), userId);

      return res.status(200).json({
        success: true,
        message: "Chat request cancelled",
      });
    } catch (error: any) {
      console.error(
        "xxxxxxxxxxxxxxx Cancel chat request error xxxxxxxxxxxxxxx",
        error
      );
      return res.status(400).json({
        error: error.message || "Failed to cancel chat request",
      });
    }
  }

  /**
   * Send a message to another user
   */
  static async sendMessage(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<any> {
    try {
      const userId = req.user?.id;
      const { receiverId, content, attachmentUrl } = req.body;

      // Validation
      if (!receiverId || !content) {
        return res.status(400).json({
          error: "Receiver ID and message content are required",
        });
      }

      if (userId === receiverId) {
        return res.status(400).json({
          error: "Cannot send message to yourself",
        });
      }

      // Send message
      const message = await ChatService.sendMessage(
        userId,
        receiverId,
        content,
        attachmentUrl
      );

      return res.status(201).json({
        success: true,
        message: MESSAGES.MESSAGE_SENT,
        data: message,
      });
    } catch (error: any) {
      console.error("xxxxxxxxxxxxxxx Send message error xxxxxxxxxxxxxxx", error);
      return res.status(400).json({
        error: error.message || "Failed to send message",
      });
    }
  }

  /**
   * Get all conversations for the authenticated user
   */
  static async getConversations(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<any> {
    try {
      const userId = req.user?.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await ChatService.getUserConversations(
        userId,
        page,
        limit
      );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error(
        "xxxxxxxxxxxxxxx Get conversations error xxxxxxxxxxxxxxx",
        error
      );
      return res.status(500).json({
        error: "Failed to fetch conversations",
      });
    }
  }

  /**
   * Get messages in a specific conversation
   */
  static async getConversationMessages(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<any> {
    try {
      const { conversationId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      if (!conversationId) {
        return res.status(400).json({
          error: "Conversation ID is required",
        });
      }

      const result = await ChatService.getConversationMessages(
        parseInt(conversationId),
        page,
        limit
      );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error(
        "xxxxxxxxxxxxxxx Get conversation messages error xxxxxxxxxxxxxxx",
        error
      );
      return res.status(500).json({
        error: "Failed to fetch messages",
      });
    }
  }

  /**
   * Mark messages as read in a conversation
   */
  static async markAsRead(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<any> {
    try {
      const userId = req.user?.id;
      const { conversationId } = req.params;

      if (!conversationId) {
        return res.status(400).json({
          error: "Conversation ID is required",
        });
      }

      await ChatService.markMessagesAsRead(parseInt(conversationId), userId);

      return res.status(200).json({
        success: true,
        message: "Messages marked as read",
      });
    } catch (error) {
      console.error(
        "xxxxxxxxxxxxxxx Mark as read error xxxxxxxxxxxxxxx",
        error
      );
      return res.status(500).json({
        error: "Failed to mark messages as read",
      });
    }
  }

  /**
   * Get unread message count for the authenticated user
   */
  static async getUnreadCount(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<any> {
    try {
      const userId = req.user?.id;

      const count = await ChatService.getUnreadCount(userId);

      return res.status(200).json({
        success: true,
        unreadCount: count,
      });
    } catch (error) {
      console.error(
        "xxxxxxxxxxxxxxx Get unread count error xxxxxxxxxxxxxxx",
        error
      );
      return res.status(500).json({
        error: "Failed to fetch unread count",
      });
    }
  }

  /**
   * Get unread messages grouped by conversation
   */
  static async getUnreadMessages(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<any> {
    try {
      const userId = req.user?.id;

      const unreadMessages =
        await ChatService.getUnreadMessagesByConversation(userId);

      return res.status(200).json({
        success: true,
        data: unreadMessages,
      });
    } catch (error) {
      console.error(
        "xxxxxxxxxxxxxxx Get unread messages error xxxxxxxxxxxxxxx",
        error
      );
      return res.status(500).json({
        error: "Failed to fetch unread messages",
      });
    }
  }

  /**
   * Search messages in a conversation
   */
  static async searchMessages(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<any> {
    try {
      const { conversationId } = req.params;
      const { q: searchTerm } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      if (!conversationId || !searchTerm) {
        return res.status(400).json({
          error: "Conversation ID and search term are required",
        });
      }

      const result = await ChatService.searchMessages(
        parseInt(conversationId),
        searchTerm as string,
        page,
        limit
      );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error(
        "xxxxxxxxxxxxxxx Search messages error xxxxxxxxxxxxxxx",
        error
      );
      return res.status(500).json({
        error: "Failed to search messages",
      });
    }
  }

  /**
   * Delete a message
   */
  static async deleteMessage(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<any> {
    try {
      const { messageId } = req.params;

      if (!messageId) {
        return res.status(400).json({
          error: "Message ID is required",
        });
      }

      await ChatService.deleteMessage(parseInt(messageId));

      return res.status(200).json({
        success: true,
        message: "Message deleted successfully",
      });
    } catch (error) {
      console.error(
        "xxxxxxxxxxxxxxx Delete message error xxxxxxxxxxxxxxx",
        error
      );
      return res.status(500).json({
        error: "Failed to delete message",
      });
    }
  }
}
