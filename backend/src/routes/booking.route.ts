import { Router } from "express";
import { holdSeat } from "../controllers/seatHold.controller.ts"
import { authenticate } from "../middlewares/auth.middleware.ts";
import { confirmBooking } from "../controllers/booking.controller.ts";

const router = Router();

// Seat Hold / Lock (Protected)
router.post("/hold", authenticate, holdSeat);
router.post("/confirm" , authenticate , confirmBooking)
export default router;