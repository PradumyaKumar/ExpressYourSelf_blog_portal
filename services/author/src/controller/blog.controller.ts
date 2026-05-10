import type { Request, Response } from "express";
import type { AuthenticatedRequest } from '../middleware/isAuth.js';
import TryCatch from "../utils/TryCatch.js";
import getBuffer from "../utils/dataUri.js";
import { v2 as cloudinary } from 'cloudinary';
import {sql} from "../utils/db.js";
import { invalidChacheJob } from "../utils/rabbitmq.js";

export const createBlog = TryCatch(async(req:AuthenticatedRequest,res: Response) =>{
    const {title,description,blogcontent, category} = req.body;

    const file=req.file

    if(!file)
    {
        res.status(400).json({
            message:"No file to upload",
        })
        return ;
    }
    

    const fileBuffer = getBuffer(file);
    if(!fileBuffer || !fileBuffer.content)
    {
        res.status(400).json({
            message:"failed to generate image buffer"
        })
        return;
    }
    const cloud = await cloudinary.uploader.upload(fileBuffer.content as string,{
        folder:"blogs",
    })

    const result =await sql` INSERT INTO blogs (title, description, image, blogcontent, category, author) VALUES 
    (${title}, ${description},${cloud.secure_url},${blogcontent},${category},${req.user?._id}) RETURNING * ;`;

    await invalidChacheJob(['blogs:*'])

    res.json({
        message:"Blog Created",
        blog:result[0]
    })

})

export const updateBlog = TryCatch(async(req:AuthenticatedRequest,res:Response)=>{
    const {title, description,blogcontent,category}= req.body
    const {id}=req.params
    const file= req.file
    const blog= await sql `SELECT * from blogs where id= ${id}; `
    if(!blog.length){
        res.status(404).json({
            message:"no blog with this ID"
        });
        return;
    }
    if(blog[0]?.author !== req.user?._id){
        res.status(401).json({
            message:"you are not author of this blog"
        });
        return;
    }
    let imageUrl=blog[0]?.image
    if(file){
        const fileBuffer = getBuffer(file)
         if(!fileBuffer || !fileBuffer.content)
    {
        res.status(400).json({
            message:"failed to generate image buffer"
        })
        return;
    }
     const cloud = await cloudinary.uploader.upload(fileBuffer.content as string,{
        folder:"blogs",
    })
    imageUrl=cloud.secure_url;
    }
    const updatedBlog= await sql `Update blogs SET 
    title = ${title||blog[0]?.title},
    description= ${description || blog[0]?.description},
    image = ${imageUrl || blog[0]?.imageUrl},
    blogcontent=${blogcontent||blog[0]?.blogcontent},
    category =${category || blog[0]?.category} 
    where id=${id}
    returning *;`

    res.json({
        message:"blog uploaded",
        blog:updatedBlog[0]
    })
})

export const deletBlog = TryCatch(async(req:AuthenticatedRequest,res)=>{
    const id=req.params.id;
    const blog= await sql `SELECT * from blogs where id= ${id}; `

     if(!blog.length){
        res.status(404).json({
            message:"no blog with this ID"
        });
        return;
    }
    if(blog[0]?.author !== req.user?._id){
        res.status(401).json({
            message:"you are not author of this blog"
        });
        return;
    }


    await sql`DELETE FROM savedblogs WHERE blogid =${id} ;`
    await sql`DELETE FROM comments WHERE blogid =${id} ;`
    await sql`DELETE FROM blogs WHERE id =${id} ;`

    res.json({
        message:"Blog Delete",
    })
})