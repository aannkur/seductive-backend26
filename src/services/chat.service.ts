import Message from "../models/message.model";
import Conversation from "../models/conversation.model";
import ChatRequest from "../models/chatRequest.model";
import User from "../models/user.model";
import { Op } from "sequelize";

export class ChatService {
  /**
   * Check if chat is allowed between two users
   */
  static async isChatAllowed(userId1: number, userId2: number): Promise<boolean> {
    const request = await ChatRequest.findOne({
      where: {
        [Op.or]: [
          {
            sender_id: userId1,
            receiver_id: userId2,
            status: "accepted",
          },
          {
            sender_id: userId2,
            receiver_id: userId1,
            status: "accepted",
          },
        ],
      },
    });

    return !!request;
  }

  /**
   * Send a chat request
   */
  static async sendChatRequest(
    senderId: number,
    receiverId: number,
    message?: string
  ): Promise<any> {
    // Check if sender and receiver are the same
    if (senderId === receiverId) {
      throw new Error("Cannot send chat request to yourself");
    }

    // Check if users are the same
    const receiver = await User.findByPk(receiverId);
    if (!receiver) {
      throw new Error("Receiver not found");
    }

    // Check if request already exists
    const existingRequest = await ChatRequest.findOne({
      where: {
        [Op.or]: [
          {
            sender_id: senderId,
            receiver_id: receiverId,
          },
          {
            sender_id: receiverId,
            receiver_id: senderId,
          },
        ],
      },
    });

    if (existingRequest) {
      if (existingRequest.status === "accepted") {
        throw new Error("Chat already enabled with this user");
      } else if (existingRequest.status === "pending") {
        throw new Error("Chat request already pending");
      }
      // If rejected, allow creating a new request
      await existingRequest.update({ status: "pending", message });
      return existingRequest;
    }

    // Create new chat request
    const chatRequest = await ChatRequest.create({
      sender_id: senderId,
      receiver_id: receiverId,
      status: "pending",
      message: message || null,
    });

    return await this.getChatRequestWithDetails(chatRequest.id);
  }

  /**
   * Get chat request with user details
   */
  static async getChatRequestWithDetails(requestId: number): Promise<any> {
    return await ChatRequest.findByPk(requestId, {
      include: [
        {
          model: User,
          as: "sender",
          attributes: [
            "id",
            "name",
            "profile_photo",
            "username",
            "profile_name",
          ],
        },
        {
          model: User,
          as: "receiver",
          attributes: [
            "id",
            "name",
            "profile_photo",
            "username",
            "profile_name",
          ],
        },
      ],
    });
  }

  /**
   * Accept a chat request
   */
  static async acceptChatRequest(
    requestId: number,
    userId: number
  ): Promise<any> {
    const chatRequest = await ChatRequest.findByPk(requestId);

    if (!chatRequest) {
      throw new Error("Chat request not found");
    }

    if (chatRequest.receiver_id !== userId) {
      throw new Error("Only the receiver can accept this request");
    }

    if (chatRequest.status !== "pending") {
      throw new Error(`Cannot accept a ${chatRequest.status} request`);
    }

    await chatRequest.update({ status: "accepted" });

    // Create conversation
    await this.getOrCreateConversation(
      chatRequest.sender_id,
      chatRequest.receiver_id
    );

    return await this.getChatRequestWithDetails(requestId);
  }

  /**
   * Reject a chat request
   */
  static async rejectChatRequest(
    requestId: number,
    userId: number
  ): Promise<void> {
    const chatRequest = await ChatRequest.findByPk(requestId);

    if (!chatRequest) {
      throw new Error("Chat request not found");
    }

    if (chatRequest.receiver_id !== userId) {
      throw new Error("Only the receiver can reject this request");
    }

    if (chatRequest.status !== "pending") {
      throw new Error(`Cannot reject a ${chatRequest.status} request`);
    }

    await chatRequest.update({ status: "rejected" });
  }

  /**
   * Get pending chat requests for a user
   */
  static async getPendingRequests(
    userId: number,
    page: number = 1,
    limit: number = 20
  ): Promise<any> {
    const offset = (page - 1) * limit;

    const { count, rows } = await ChatRequest.findAndCountAll({
      where: {
        receiver_id: userId,
        status: "pending",
      },
      include: [
        {
          model: User,
          as: "sender",
          attributes: [
            "id",
            "name",
            "profile_photo",
            "username",
            "profile_name",
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
      offset,
      limit,
    });

    return {
      requests: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    };
  }

  /**
   * Get sent chat requests by user
   */
  static async getSentRequests(
    userId: number,
    page: number = 1,
    limit: number = 20
  ): Promise<any> {
    const offset = (page - 1) * limit;

    const { count, rows } = await ChatRequest.findAndCountAll({
      where: {
        sender_id: userId,
      },
      include: [
        {
          model: User,
          as: "receiver",
          attributes: [
            "id",
            "name",
            "profile_photo",
            "username",
            "profile_name",
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
      offset,
      limit,
    });

    return {
      requests: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    };
  }

  /**
   * Get all chat requests (sent and received) for a user
   */
  static async getAllChatRequests(
    userId: number,
    page: number = 1,
    limit: number = 20
  ): Promise<any> {
    const offset = (page - 1) * limit;

    const { count, rows } = await ChatRequest.findAndCountAll({
      where: {
        [Op.or]: [
          { sender_id: userId },
          { receiver_id: userId },
        ],
      },
      include: [
        {
          model: User,
          as: "sender",
          attributes: [
            "id",
            "name",
            "profile_photo",
            "username",
            "profile_name",
          ],
        },
        {
          model: User,
          as: "receiver",
          attributes: [
            "id",
            "name",
            "profile_photo",
            "username",
            "profile_name",
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
      offset,
      limit,
    });

    return {
      requests: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    };
  }

  /**
   * Cancel a sent chat request
   */
  static async cancelChatRequest(
    requestId: number,
    userId: number
  ): Promise<void> {
    const chatRequest = await ChatRequest.findByPk(requestId);

    if (!chatRequest) {
      throw new Error("Chat request not found");
    }

    if (chatRequest.sender_id !== userId) {
      throw new Error("Only the sender can cancel this request");
    }

    if (chatRequest.status !== "pending") {
      throw new Error(`Cannot cancel a ${chatRequest.status} request`);
    }

    await chatRequest.destroy();
  }

  /**
   * Get or create a conversation between two users
   */
  static async getOrCreateConversation(
    userId1: number,
    userId2: number
  ): Promise<any> {
    // Ensure consistent ordering of participants
    const [participant1, participant2] = [userId1, userId2].sort();

    let conversation = await Conversation.findOne({
      where: {
        [Op.or]: [
          {
            participant_1_id: participant1,
            participant_2_id: participant2,
          },
          {
            participant_1_id: participant2,
            participant_2_id: participant1,
          },
        ],
      },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participant_1_id: participant1,
        participant_2_id: participant2,
      });
    }

    return conversation;
  }

  /**
   * Send a message
   */
  static async sendMessage(
    senderId: number,
    receiverId: number,
    content: string,
    attachmentUrl?: string
  ): Promise<any> {
    // Check if chat is allowed
    const chatAllowed = await this.isChatAllowed(senderId, receiverId);
    if (!chatAllowed) {
      throw new Error("Chat not allowed. Please send a chat request first.");
    }
    // Get or create conversation
    const conversation = await this.getOrCreateConversation(
      senderId,
      receiverId
    );

    // Create message
    const message = await Message.create({
      sender_id: senderId,
      receiver_id: receiverId,
      conversation_id: conversation.id,
      content,
      attachment_url: attachmentUrl || null,
      is_read: false,
    });

    // Update conversation's last message
    await conversation.update({
      last_message: content,
      last_message_at: new Date(),
    });

    // Fetch complete message with sender details
    return await this.getMessageWithDetails(message.id);
  }

  /**
   * Get a message with sender and receiver details
   */
  static async getMessageWithDetails(messageId: number): Promise<any> {
    return await Message.findByPk(messageId, {
      include: [
        {
          model: User,
          as: "sender",
          attributes: [
            "id",
            "name",
            "profile_photo",
            "username",
            "profile_name",
          ],
          foreignKey: "sender_id",
        },
        {
          model: User,
          as: "receiver",
          attributes: [
            "id",
            "name",
            "profile_photo",
            "username",
            "profile_name",
          ],
          foreignKey: "receiver_id",
        },
      ],
    });
  }

  /**
   * Get all messages in a conversation with pagination
   */
  static async getConversationMessages(
    conversationId: number,
    page: number = 1,
    limit: number = 50
  ): Promise<any> {
    const offset = (page - 1) * limit;

    const { count, rows } = await Message.findAndCountAll({
      where: {
        conversation_id: conversationId,
      },
      include: [
        {
          model: User,
          as: "sender",
          attributes: [
            "id",
            "name",
            "profile_photo",
            "username",
            "profile_name",
          ],
          foreignKey: "sender_id",
        },
        {
          model: User,
          as: "receiver",
          attributes: [
            "id",
            "name",
            "profile_photo",
            "username",
            "profile_name",
          ],
          foreignKey: "receiver_id",
        },
      ],
      order: [["createdAt", "ASC"]],
      offset,
      limit,
    });

    return {
      messages: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    };
  }

  /**
   * Get all conversations for a user
   */
  static async getUserConversations(
    userId: number,
    page: number = 1,
    limit: number = 20
  ): Promise<any> {
    const offset = (page - 1) * limit;

    const { count, rows } = await Conversation.findAndCountAll({
      where: {
        [Op.or]: [
          { participant_1_id: userId },
          { participant_2_id: userId },
        ],
      },
      include: [
        {
          model: User,
          as: "participant1",
          attributes: [
            "id",
            "name",
            "profile_photo",
            "username",
            "profile_name",
          ],
          foreignKey: "participant_1_id",
        },
        {
          model: User,
          as: "participant2",
          attributes: [
            "id",
            "name",
            "profile_photo",
            "username",
            "profile_name",
          ],
          foreignKey: "participant_2_id",
        },
      ],
      order: [["last_message_at", "DESC"]],
      offset,
      limit,
    });

    return {
      conversations: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    };
  }

  /**
   * Mark messages as read
   */
  static async markMessagesAsRead(
    conversationId: number,
    userId: number
  ): Promise<any> {
    const messages = await Message.findAll({
      where: {
        conversation_id: conversationId,
        receiver_id: userId,
        is_read: false,
      },
    });

    for (const message of messages) {
      await message.update({
        is_read: true,
        read_at: new Date(),
      });
    }

    return messages;
  }

  /**
   * Get unread message count for a user
   */
  static async getUnreadCount(userId: number): Promise<number> {
    const count = await Message.count({
      where: {
        receiver_id: userId,
        is_read: false,
      },
    });

    return count;
  }

  /**
   * Search messages in a conversation
   */
  static async searchMessages(
    conversationId: number,
    searchTerm: string,
    page: number = 1,
    limit: number = 20
  ): Promise<any> {
    const offset = (page - 1) * limit;

    const { count, rows } = await Message.findAndCountAll({
      where: {
        conversation_id: conversationId,
        content: {
          [Op.iLike]: `%${searchTerm}%`,
        },
      },
      include: [
        {
          model: User,
          as: "sender",
          attributes: [
            "id",
            "name",
            "profile_photo",
            "username",
            "profile_name",
          ],
          foreignKey: "sender_id",
        },
        {
          model: User,
          as: "receiver",
          attributes: [
            "id",
            "name",
            "profile_photo",
            "username",
            "profile_name",
          ],
          foreignKey: "receiver_id",
        },
      ],
      order: [["createdAt", "DESC"]],
      offset,
      limit,
    });

    return {
      messages: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    };
  }

  /**
   * Delete a message (soft delete)
   */
  static async deleteMessage(messageId: number): Promise<void> {
    const message = await Message.findByPk(messageId);
    if (message) {
      await message.update({
        deletedAt: new Date(),
      });
    }
  }

  /**
   * Get unread messages for a user grouped by sender
   */

  static async getUnreadMessagesByConversation(userId: number): Promise<any> {
    const conversations = await Conversation.findAll({
      where: {
        [Op.or]: [
          { participant_1_id: userId },
          { participant_2_id: userId },
        ],
      },
      attributes: ["id", "participant_1_id", "participant_2_id"],
    });

    const result: any = [];

    for (const conv of conversations) {
      const unreadCount = await Message.count({
        where: {
          conversation_id: conv.id,
          receiver_id: userId,
          is_read: false,
        },
      });

      if (unreadCount > 0) {
        const otherParticipantId =
          conv.participant_1_id === userId
            ? conv.participant_2_id
            : conv.participant_1_id;

        const otherUser = await User.findByPk(otherParticipantId, {
          attributes: [
            "id",
            "name",
            "profile_photo",
            "username",
            "profile_name",
          ],
        });

        result.push({
          conversationId: conv.id,
          unreadCount,
          otherUser,
        });
      }
    }

    return result;
  }

}
