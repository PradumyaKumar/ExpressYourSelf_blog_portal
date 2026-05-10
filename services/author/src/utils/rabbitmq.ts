import amqp from "amqplib"

let channel: amqp.Channel
 export const connectRabbitMQ= async()=>{
     try{
        const connection =await amqp.connect({
            protocol:"amqp",
            hostname:"localhost",
            port:5672,
            username:"admin",
            password:"admin123",

        })
        channel=await connection.createChannel()
        console.log("✅connected to rabbitmq")
     } catch(error)
     {
        console.log("❌failed to connect to rabbitmq",error)
     }
 }
export const publishToQueue =async(queueName:string,message:any)=>{
    if(!channel){
        console.error("Rabbitmq Channel is not initialized")
        return
    }
    await channel.assertQueue(queueName, { durable: true });
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), { persistent: true });
}

export const invalidChacheJob =async(cacheKeys:string[])=>{
    try{
        const message={
            action:"invalidChache",
            keys: cacheKeys,
        }
        await publishToQueue("cache-inlidation",message);
        console.log("✅ Cache invalidation job published to Rabbitmq")
    } catch(error)
    {
        console.error("❌ Failed to Publish cache on Rabbitmq", error);
    }
}