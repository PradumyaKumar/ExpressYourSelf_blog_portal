import { redisClient } from "../server.js";
import { sql } from "../utils/db.js";
import TryCatch from "../utils/TryCatch.js";
import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../utils/isAuth.js";

// ─────────────────────────────────────────────
// VIEW COUNT
// ─────────────────────────────────────────────

export const incrementViewCount = TryCatch(async (req: Request, res: Response) => {
    const { id } = req.params;
    console.log("incrementViewCount->s");

    const result = await sql`
        UPDATE blogs
        SET view_count = view_count + 1
        WHERE id = ${id}
        RETURNING view_count;
    `;

    if (!result.length || !result[0]) {
        res.status(404).json({ message: "Blog not found" });
        return;
    }

    // Invalidate single blog cache so fresh view count is served next time
    const cacheKey = `blog:${id}`;
    console.log("29");
    const cached = await redisClient.get(cacheKey);
    console.log("31");
    if (cached) {
        await redisClient.del(cacheKey);
        console.log("34");
        console.log(`Cache invalidated for key: ${cacheKey}`);
    }

    res.json({ viewCount: result[0].view_count });
    console.log("incrementViewCount->e");
});

// ─────────────────────────────────────────────
// LIKES
// ─────────────────────────────────────────────

export const toggleLike = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
    const { id: blogid } = req.params;
    const userid = req.user?._id;
    console.log("toggleLike->s");

    if (!userid) {
        res.status(401).json({ message: "Please login" });
        return;
    }

    const existing = await sql`
        SELECT id FROM likes WHERE userid = ${userid} AND blogid = ${blogid};
    `;

    let liked: boolean;
    if (existing.length > 0) {
        await sql`DELETE FROM likes WHERE userid = ${userid} AND blogid = ${blogid};`;
        liked = false;
    } else {
        await sql`INSERT INTO likes (userid, blogid) VALUES (${userid}, ${blogid});`;
        liked = true;
    }

    const countResult = await sql`SELECT COUNT(*) as count FROM likes WHERE blogid = ${blogid};`;
    const likeCount = Number(countResult[0]?.count ?? 0);

    // Invalidate single blog cache — like count is part of the blog response
    const cacheKey = `blog:${blogid}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) {
        await redisClient.del(cacheKey);
        console.log(`Cache invalidated for key: ${cacheKey}`);
    }

    res.json({ liked, likeCount });
    console.log("toggleLike->e");
});

export const getLikeStatus = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
    const { id: blogid } = req.params;
    const userid = req.user?._id;
    console.log("getLikeStatus->s");

    // Cache key for like status per user per blog
    const cacheKey = `likes:${blogid}:${userid ?? "guest"}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) {
        console.log(`Serving like status from cache for key: ${cacheKey}`);
        res.json(JSON.parse(cached));
        return;
    }

    const countResult = await sql`SELECT COUNT(*) as count FROM likes WHERE blogid = ${blogid};`;
    const likeCount = Number(countResult[0]?.count ?? 0);

    let liked = false;
    if (userid) {
        const existing = await sql`
            SELECT id FROM likes WHERE userid = ${userid} AND blogid = ${blogid};
        `;
        liked = existing.length > 0;
    }

    const responseData = { liked, likeCount };
    await redisClient.set(cacheKey, JSON.stringify(responseData), { EX: 3600 });
    console.log(`Like status cached with key: ${cacheKey}`);

    res.json(responseData);
    console.log("getLikeStatus->e");
});

// ─────────────────────────────────────────────
// BOOKMARKS
// ─────────────────────────────────────────────

export const toggleBookmark = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
    const { id: blogid } = req.params;
    const userid = req.user?._id;
    console.log("toggleBookmark->s");

    if (!userid) {
        res.status(401).json({ message: "Please login" });
        return;
    }

    const existing = await sql`
        SELECT id FROM savedblogs WHERE userid = ${userid} AND blogid = ${blogid};
    `;

    let bookmarked: boolean;
    if (existing.length > 0) {
        await sql`DELETE FROM savedblogs WHERE userid = ${userid} AND blogid = ${blogid};`;
        bookmarked = false;
    } else {
        await sql`INSERT INTO savedblogs (userid, blogid) VALUES (${userid}, ${blogid});`;
        bookmarked = true;
    }

    // Invalidate both the bookmarks list and the status cache for this user+blog
    const bookmarksListKey = `bookmarks:${userid}`;
    const bookmarkStatusKey = `bookmark:${blogid}:${userid}`;

    const cachedList = await redisClient.get(bookmarksListKey);
    if (cachedList) {
        await redisClient.del(bookmarksListKey);
        console.log(`Cache invalidated for key: ${bookmarksListKey}`);
    }

    const cachedStatus = await redisClient.get(bookmarkStatusKey);
    if (cachedStatus) {
        await redisClient.del(bookmarkStatusKey);
        console.log(`Cache invalidated for key: ${bookmarkStatusKey}`);
    }

    res.json({ bookmarked });
    console.log("toggleBookmark->e");
});

export const getBookmarks = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
    const userid = req.user?._id;
    console.log("getBookmarks->s");

    if (!userid) {
        res.status(401).json({ message: "Please login" });
        return;
    }

    const cacheKey = `bookmarks:${userid}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) {
        console.log(`Serving bookmarks from cache for key: ${cacheKey}`);
        res.json(JSON.parse(cached));
        return;
    }

    const blogs = await sql`
        SELECT b.*
        FROM blogs b
        INNER JOIN savedblogs s ON s.blogid = b.id::text
        WHERE s.userid = ${userid}
        ORDER BY s.create_at DESC;
    `;

    await redisClient.set(cacheKey, JSON.stringify(blogs), { EX: 600 });
    console.log(`Bookmarks cached with key: ${cacheKey}`);

    res.json(blogs);
    console.log("getBookmarks->e");
});

export const getBookmarkStatus = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
    const { id: blogid } = req.params;
    const userid = req.user?._id;
    console.log("getBookmarkStatus->s");

    if (!userid) {
        res.json({ bookmarked: false });
        return;
    }

    const cacheKey = `bookmark:${blogid}:${userid}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) {
        console.log(`Serving bookmark status from cache for key: ${cacheKey}`);
        res.json(JSON.parse(cached));
        return;
    }

    const existing = await sql`
        SELECT id FROM savedblogs WHERE userid = ${userid} AND blogid = ${blogid};
    `;

    const responseData = { bookmarked: existing.length > 0 };
    await redisClient.set(cacheKey, JSON.stringify(responseData), { EX: 3600 });
    console.log(`Bookmark status cached with key: ${cacheKey}`);

    res.json(responseData);
    console.log("getBookmarkStatus->e");
});

// COMMENTS

export const getComments = TryCatch(async (req: Request, res: Response) => {
    const { id: blogid } = req.params;

    const comments = await sql`
        SELECT *
        FROM comments
        WHERE blogid = ${blogid}
        ORDER BY create_at DESC;
    `;

    res.json(comments);
});

export const addComment = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
    const { id: blogid } = req.params;
    const { comment } = req.body;
    const user = req.user;

    if (!user?._id) {
        res.status(401).json({ message: "Please login" });
        return;
    }

    if (!comment?.trim()) {
        res.status(400).json({ message: "Comment is required" });
        return;
    }

    const result = await sql`
        INSERT INTO comments (comment, userid, username, blogid)
        VALUES (${comment}, ${user._id}, ${user.name}, ${blogid})
        RETURNING *;
    `;

    res.json({
        message: "Comment added",
        comment: result[0],
    });
});

export const deleteComment = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userid = req.user?._id;

    if (!userid) {
        res.status(401).json({ message: "Please login" });
        return;
    }

    const existing = await sql`
        SELECT *
        FROM comments
        WHERE id = ${id};
    `;

    if (!existing.length) {
        res.status(404).json({ message: "Comment not found" });
        return;
    }

    if (existing[0]?.userid !== userid) {
        res.status(401).json({ message: "You are not owner of this comment" });
        return;
    }

    await sql`DELETE FROM comments WHERE id = ${id};`;

    res.json({ message: "Comment deleted" });
});
