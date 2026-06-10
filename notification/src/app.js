import express from 'express'
import morgan from 'morgan'
import {sendEmail} from './email.js'
import channel from './mq.js'

const app = express()

app.use(morgan('dev'))
app.use(express.json())

app.get('/', (req,res) =>{
    res.send("hello from notification service");
});

app.get('/_status/healthz',(req,res) =>{
    res.status(200).json({message:"ok"})
})

app.get('/_status/readyz', (req,res) =>{
    res.status(200).json({message:"ok"})
})


channel.consume('auth-notification-queue',async (msg) => {
    if(msg !== null){
        const messageContent = msg.content.toString();
        console.log(`Received message from queue :`, messageContent)
        try{
            const {userId,action,timestamp,email} = JSON.parse(messageContent);
            
            const subject = "Login to ForgeBox AI";
            const text = `Hello ${userId}, your login with ${action} was successful at ${timestamp}`;
            const html = `<h1>Hello ${userId}</h1><p>Your login with ${action} was successful at ${timestamp}</p>`;

            await sendEmail(email,subject,text,html);
            channel.ack(msg);
        } catch(error){
            console.error("Failed to process message:", error);
        }   
    }
})
export default app;