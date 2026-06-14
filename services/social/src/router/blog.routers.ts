import express from "express";

import {
    incrementViewCount,
    toggleLike,
    getLikeStatus,
    toggleBookmark,
    getBookmarks,
    getBookmarkStatus,
    getComments,
    addComment,
    deleteComment,
} from "../controller/social.controller.js";
import { isAuth } from "../utils/isAuth.js";

const router = express.Router();

// ── View count ───────────────────────────────
// No auth needed — anyone visiting the page counts
router.post("/blogs/:id/view", incrementViewCount);

// ── Likes ────────────────────────────────────
router.get("/blogs/:id/likes", isAuth, getLikeStatus);
router.post("/blogs/:id/like", isAuth, toggleLike);

// ── Bookmarks ────────────────────────────────
// /blogs/bookmarks must come BEFORE /blogs/:id/... to avoid :id catching "bookmarks"
router.get("/blogs/bookmarks/all", isAuth, getBookmarks);
router.get("/blogs/:id/bookmark/status", isAuth, getBookmarkStatus);
router.post("/blogs/:id/bookmark", isAuth, toggleBookmark);

// Comments
router.get("/comments/:id", getComments);
router.post("/comments/:id", isAuth, addComment);
router.delete("/comments/:id", isAuth, deleteComment);

export default router;
