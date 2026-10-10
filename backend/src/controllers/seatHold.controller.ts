import { AuthenticatedRequest } from "../middlewares/auth.middleware.ts";
import { Response } from "express";
import {prisma} from "../config/db.ts"
import {redis} from "../config/redis.ts"

export const holdSeat = async(req :AuthenticatedRequest, res:Response) =>{
    try{
        const {showId , seatId} = req.body;
        const userId = req.user?.userId;

        if(!showId || !seatId){
            return res.status(400).json({message : "showId and seatId are required"});
        }

        if(!userId){
            return res.status(401).json({message : "Unauthorized"});
        }

        const seat = await prisma.seat.findUnique({
            where:{id:seatId}
        });
        if(!seat || seat.showId !== showId){
            return res.status(404).json({message : "Seat not found for the given show"});
        }

        if(seat.status === "BOOKED"){
            return res.status(404).json({message : "Seat is already booked"});
        }

        const lockKey = `seat_lock:${showId}:${seatId}`;
        const holdDuration = 10 * 60;

        const acquiredLock = await redis.set(
            lockKey,
            userId,
            "EX",
            holdDuration,
            "NX"
        )

        if(!acquiredLock){
            return res.status(409).json({
                message:"Seat is currently locked by another user"
            })
        }

        await prisma.seat.update({
            where:{id:seatId},
            data:{status:"LOCKED"}
        })

        return res.status(200).json({
            message:"seat locked success for 10 minutes",
            lockKey,
            expiresInSeconds:holdDuration
        })


    } catch (error) {
        console.error("Error holding seat:", error);
        return res.status(500).json({message : "Internal server error"});
    }
}