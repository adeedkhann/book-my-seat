import { AuthenticatedRequest } from "../middlewares/auth.middleware.ts";
import { redis } from "../config/redis.ts";
import { prisma } from "../config/db.ts";

export const confirmBooking = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { showId, seatId } = req.body;
    const userId = req.user?.userId;
    if (!showId || !seatId) {
      return res
        .status(400)
        .json({ message: "showId and seatId are required" });
    }

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    const lockKey = `seat_lock:${showId}:${seatId}`;
    const lockOwner = await redis.get(lockKey);
    if (!lockOwner) {
      return res.status(400).json({
        message: "seat lock has expired or was never held , pta",
      });
    }

    if (lockOwner !== userId) {
      return res.status(403).json({
        message: "forbidden do not own the lock for this seat",
      });
    }

    const booking = await prisma.$transaction(async (tx) => {
      await tx.seat.update({
        where: { id: seatId },
        data: { status: "BOOKED" },
      });
      const newBooking = await tx.booking.create({
        data: {
          userId,
          showId,
          seatId,
          status: "CONFIRMED",
        },
      });

      return newBooking;
    });

    await redis.del(lockKey);
    return res.status(201).json({
      message: "Booking confirmed succesfully",
      booking,
    });
  } catch (error) {
    console.error("confirm booking error", error);
    return res.status(500).json({ message: "internal server error" });
  }
};
