import  cors  from 'cors';
import express from "express";
import dotenv from "dotenv";
import connectDb from "./utils/db.js";
import router from "./router/user.router.js";
import { v2 as cloudinary } from 'cloudinary';


dotenv.config();

cloudinary.config({ 
        cloud_name: process.env.Cloud_name as string, 
        api_key: process.env.Cloud_Api_Key as string, 
        api_secret: process.env.Cloud_Api_Secret as string
    });

connectDb();


const app=express();
app.use(express.json());

app.use(cors())

app.use("/api/v1", router)
const PORT=process.env.PORT || 5000
//console.log(process.env.PORT)
app.listen(5000,()=>{
   console.log(`Server is running on http://localhost:${PORT}`);
});
