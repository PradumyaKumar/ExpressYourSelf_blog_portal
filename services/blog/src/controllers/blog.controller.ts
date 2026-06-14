import { sql } from "../config/db.js";
import { redisClient } from "../server.js";
import TryCatch from "../utils/TryCatch.js";
import axios from "axios";

export const getAllBlogs=TryCatch(async(req,res)=>{
    const {searchQuery = "",category = ""}= req.query
    console.log(`query:${searchQuery}`);
    console.log(`category/:${category}`);
    const cacheKey =`blogs:${searchQuery}:${category}`
    const cached=await redisClient.get(cacheKey)
    if(cached)
    {
        console.log("Server from cached")
        res.json(JSON.parse(cached))
        return ;
    }
    let blogs
if(searchQuery && category){
    blogs= await sql `SELECT * from blogs where
    (title like ${"%" + searchQuery +"%"} or 
    description like ${"%" + searchQuery + "%"}) AND category=${category} ORDER BY create_at DESC;`
    
}
else if(searchQuery)
{
    blogs= await sql `SELECT * from blogs where
    (title like ${"%" + searchQuery +"%"} or 
    description like ${"%" + searchQuery + "%"})  ORDER BY create_at DESC;`
}
else if(category)
{
    blogs= await sql `SELECT * from blogs where
    category=${category} ORDER BY create_at DESC;`
}
else{
    blogs= await sql`SELECT * FROM blogs ORDER BY create_at DESC;`
}
console.log("serving from db");

await redisClient.set(cacheKey,JSON.stringify(blogs),{EX:3600})
res.json(blogs)
})
export const getSingleBlog = TryCatch(async(req,res)=>{
    const blogid=req.params.id
    const cacheKey=`blog:${blogid}`
    const cached = await redisClient.get(cacheKey)
    if(cached){
        console.log("Servernsingle blog from cache")
        res.json(JSON.parse(cached))
        return ;
    }
   const blog=await sql`select * from blogs where id =${blogid};` ;

   if(blog.length===0)
   {
     res.status(400).json({
        message:"no blog with this ID"
     })
     return;
   }

   const {data} = await axios.get(`${process.env.USER_SERVICE}/api/v1/user/${blog[0]?.author}`)

   const responseData = { blog: blog[0], author: data };
   await redisClient.set(cacheKey,JSON.stringify(responseData),{EX: 3600})
   res.json(responseData);
})
//3:12