import dotenv from "dotenv"
dotenv.config();
import express, { urlencoded } from "express";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.route.js";


const app = express();
const PORT = process.env.PORT;
app.use(express.json());
app.use(cookieParser());



app.use('/api/v1/auth' , authRouter)
app.get('/health' ,(req , res)=>{
    res.status(200).json(
        {
            message:"server is running and fine asf"
        }
    )
} )



app.listen(PORT,()=>{
    console.log(`server are running at port ${PORT}`)
})
