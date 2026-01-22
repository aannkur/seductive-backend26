import { Router } from "express";
import { authenticateUser } from "../middleware/auth.middleware";
import { ChatController } from "../controllers/chat.controller";

const router = Router();

router.use(authenticateUser);

router.post("/request/send", ChatController.sendChatRequest);

router.post("/request/:requestId/accept", ChatController.acceptChatRequest);

router.post("/request/:requestId/reject", ChatController.rejectChatRequest);

router.delete("/request/:requestId", ChatController.cancelChatRequest);

router.get("/request/pending", ChatController.getPendingRequests);

router.get("/request/sent", ChatController.getSentRequests);

router.get("/request/all", ChatController.getAllRequests);

/**
 * Messaging Endpoints
 */

router.post("/send", ChatController.sendMessage);

router.get("/conversations", ChatController.getConversations);

router.get(
  "/conversations/:conversationId/messages",
  ChatController.getConversationMessages
);

router.put(
  "/conversations/:conversationId/read",
  ChatController.markAsRead
);

router.get("/unread-count", ChatController.getUnreadCount);

router.get("/unread", ChatController.getUnreadMessages);

router.get(
  "/conversations/:conversationId/search",
  ChatController.searchMessages
);

router.delete("/messages/:messageId", ChatController.deleteMessage);

export default router;
