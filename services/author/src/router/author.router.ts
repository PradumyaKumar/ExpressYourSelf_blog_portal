import express from "express";
import { isAuth } from "../middleware/isAuth.js";
import uploadFile from "../middleware/multer.js";
import {

  createBlog,
  deletBlog,
  updateBlog,

} from "../controller/blog.controller.js";

const router = express();

router.post("/blog/new", isAuth, uploadFile, createBlog);
router.post("/blog/:id", isAuth,uploadFile,updateBlog);
router.delete("/blog/:id", isAuth,deletBlog);

export default router;