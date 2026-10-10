import { Request, Response } from "express";
import { prisma } from "../config/db.ts"; 

export const generateEvent = async (req: Request, res: Response) => {
  try {
    const { title, description, venue } = req.body;
    
    if (!title || !description || !venue) {
      return res
        .status(400)
        .json({ message: "Title, description, and venue are required" });
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        venue,
      },
    });

    return res
      .status(201)
      .json({ message: "Event created successfully", event });
  } catch (error) {
    console.error("Error generating event:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const createShow = async (req: Request, res: Response) => {
  try {
    const {
      eventId,
      showTime,
      rows = 5,
      seatsPerRow = 10,
      price = 200,
    } = req.body;

    if (!eventId || !showTime) {
      return res
        .status(400)
        .json({ message: "Event ID and show time are required" });
    }

    // Check if showTime is a valid date
    const parsedDate = new Date(showTime);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: "Invalid showTime date format" });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const result = await prisma.$transaction(async (tx) => {
      const show = await tx.show.create({
        data: {
          eventId,
          startTime: parsedDate,
        },
      });

      const seatsData = [];
      const rowLabels = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

      for (let r = 0; r < Math.min(rows, rowLabels.length); r++) {
        for (let s = 1; s <= seatsPerRow; s++) {
          seatsData.push({
            showId: show.id,
            seatNumber: `${rowLabels[r]}${s}`, // A1, A2...
            price: Number(price),
            status: "AVAILABLE" as const,
          });
        }
      }

      await tx.seat.createMany({ data: seatsData });
      return show;
    });

    return res
      .status(201)
      .json({ message: "Show created successfully", showId: result.id });
  } catch (error) {
    console.error("Error creating show:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getEvents = async (req: Request, res: Response) => {
  try {
    const events = await prisma.event.findMany({
      include: {
        shows: {
          select: {
            id: true,
            startTime: true,
          },
        },
      },
    });
    return res.status(200).json({ events });
  } catch (error) {
    console.error("Error fetching events:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getShowSeats = async (req: Request, res: Response) => {
  try {
    const { showId } = req.params;

    const show = await prisma.show.findUnique({
      where: { id: showId },
      include: {
        event: true,
        seats: {
          orderBy: { seatNumber: "asc" },
        },
      },
    });

    if (!show) {
      return res.status(404).json({ message: "Show not found" });
    }

    return res.status(200).json({ show });
  } catch (error) {
    console.error("Get Show Seats Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};