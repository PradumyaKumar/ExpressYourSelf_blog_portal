import express from "express"
import dotenv from "dotenv"
import router from "./routes/blog.routes.js";
import {createClient} from 'redis'
import { StartCacheConsumer } from "./utils/consumer.js";
import cors from "cors";



dotenv.config();

const app=express();

app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5500"],
  credentials: true,
}));
app.use(express.json());
const port = process.env.PORT;

StartCacheConsumer()

export const redisClient= createClient({
    url: process.env.REDIS_URL!,
})
redisClient.connect().then(()=>console.log("connect to redis")).catch
(console.error)

app.use("/api/v1",router);

app.listen(port, ()=>{
    console.log(`blog Server is running on http://localhost:${port}`)
})