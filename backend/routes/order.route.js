import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { createCODOrder, getMyOrders } from "../controllers/order.controller.js";

const router = express.Router();

router.post("/cod", protectRoute, createCODOrder);
router.get("/my-orders", protectRoute, getMyOrders);

export default router;