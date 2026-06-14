import express from "express";
import dotenv from "dotenv";
import { sql } from "./utils/db.js";
import { createClient } from "redis";
import router from "./router/blog.routers.js";
import { v2 as cloudinary } from "cloudinary";
import cors from "cors";
import { connectRabbitMQ } from "./utils/rabbitmq.js";
import { StartCacheConsumer } from "./utils/consumer.js";

dotenv.config();

cloudinary.config({
    cloud_name: process.env.Cloud_name as string,
    api_key: process.env.Cloud_Api_Key as string,
    api_secret: process.env.Cloud_Api_Secret as string,
});

StartCacheConsumer()

export const redisClient= createClient({
    url: process.env.REDIS_URL!,
})
redisClient.connect().then(()=>console.log("connect to redis")).catch
(console.error)

const app = express();
app.use(express.json());
app.use(cors());
app.use("/api/v1", router);

const port = process.env.PORT || 4000;

async function initDB() {
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS blogs (
                id          SERIAL PRIMARY KEY,
                title       VARCHAR(255) NOT NULL,
                description VARCHAR(255) NOT NULL,
                blogcontent TEXT         NOT NULL,
                image       VARCHAR(255) NOT NULL,
                category    VARCHAR(255) NOT NULL,
                author      VARCHAR(255) NOT NULL,
                view_count  INTEGER      NOT NULL DEFAULT 0,
                create_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await sql`ALTER TABLE blogs ADD COLUMN IF NOT EXISTS view_count INTEGER NOT NULL DEFAULT 0;`;
        await sql`
            CREATE TABLE IF NOT EXISTS comments (
                id         SERIAL PRIMARY KEY,
                comment    VARCHAR(255) NOT NULL,
                userid     VARCHAR(255) NOT NULL,
                username   VARCHAR(255) NOT NULL,
                blogid     VARCHAR(255) NOT NULL,
                create_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await sql`
            CREATE TABLE IF NOT EXISTS savedblogs (
                id        SERIAL PRIMARY KEY,
                userid    VARCHAR(255) NOT NULL,
                blogid    VARCHAR(255) NOT NULL,
                create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE (userid, blogid)
            );
        `;
        await sql`
            CREATE TABLE IF NOT EXISTS likes (
                id        SERIAL PRIMARY KEY,
                userid    VARCHAR(255) NOT NULL,
                blogid    VARCHAR(255) NOT NULL,
                create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE (userid, blogid)
            );
        `;
        console.log("✅ Database initialized successfully");
    } catch (error) {
        console.error("❌ Error in initDB:", error);
        process.exit(1);
    }
}

async function bootstrap() {
    await initDB();

    // Guard against double-connect (nodemon hot reload can cause this)
    if (!redisClient.isOpen) {
        await redisClient.connect();
        console.log("✅ Connected to Redis");
    }

    connectRabbitMQ();

    app.listen(port, () => {
        console.log(`🚀 Social service running on http://localhost:${port}`);
    });
}

bootstrap().catch((err) => {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
});