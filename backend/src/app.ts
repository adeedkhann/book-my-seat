import dotenv from "dotenv"
dotenv.config();
import express, { urlencoded } from "express";

const app = express();
const PORT = process.env.PORT;
app.use(express.json());


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
