import  express  from "express";
import  { getAllBlogs, getSingleBlog } from "../controllers/blog.controller.js";

const router=express.Router();

router.get('/blogs/all',getAllBlogs);
router.get("/blogs/:id", getSingleBlog);
export default router;