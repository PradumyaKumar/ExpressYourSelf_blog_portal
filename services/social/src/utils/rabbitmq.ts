import amqp from "amqplib";

let channel: amqp.Channel;

export const connectRabbitMQ = async () => {
    try {
        const connection = await amqp.connect({
            protocol: "amqp",
            hostname: "localhost",
            port: 5672,
            username: "admin",
            password: "admin123",
        });
        channel = await connection.createChannel();
        console.log("✅ Connected to RabbitMQ");
    } catch (error) {
        console.error("❌ Failed to connect to RabbitMQ:", error);
    }
};

export const publishToQueue = async (queueName: string, message: any) => {
    if (!channel) {
        console.error("RabbitMQ channel is not initialized");
        return;
    }
    await channel.assertQueue(queueName, { durable: true });
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), { persistent: true });
};

export const invalidChacheJob = async (cacheKeys: string[]) => {
    try {
        const message = {
            // Bug fix 1: was "invalidChache" (typo) — must match consumer.ts check: "invlidateCache"
            action: "invlidateCache",
            keys: cacheKeys,
        };
        // Bug fix 2: was "cache-inlidation" (typo) — must match consumer.ts queue: "cache-invalidation"
        await publishToQueue("cache-invalidation", message);
        console.log("✅ Cache invalidation job published to RabbitMQ");
    } catch (error) {
        console.error("❌ Failed to publish cache invalidation to RabbitMQ:", error);
    }
};
