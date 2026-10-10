import { Router } from "express";
import {
  generateEvent,
  createShow,
  getEvents,
  getShowSeats,
} from "../controllers/event.controller.ts";
import { authenticate, authorizeRole } from "../middlewares/auth.middleware.ts";
const router = Router();

// Public Routes
router.get("/", getEvents);
router.get("/shows/:showId/seats", getShowSeats);

// Admin Only Protected Routes
router.post("/", authenticate, authorizeRole("ADMIN"), generateEvent);
router.post("/shows", authenticate, authorizeRole("ADMIN"), createShow);

export default router;