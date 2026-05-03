import express from "express";
import { chatWithAI, clearChat, healthCheck } from "../controllers/chatbot.controller.js";

const router = express.Router();

router.post("/chat", chatWithAI);
router.post("/clear", clearChat);
router.get("/health", healthCheck);

export default router;