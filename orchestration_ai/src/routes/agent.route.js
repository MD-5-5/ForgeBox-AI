import { Router } from "express";
import agent from "../agents/code.agent.js";

const agentRouter = Router();

agentRouter.post("/invoke", async (req, res) => {
    try {
        const { message, projectId } = req.body;

        //Setting Up SSE
        res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        });
        const response = await agent.stream(
            {
            messages: [{
                role: "user",
                content: message
            }],
            },
            {
            context : {
                projectId
            },
            streamMode:"custom",
        });

        for await (const chunk of response) {
            console.log(chunk)
            res.write(`data: ${chunk}\n\n`);
        }

        res.end();
    } catch (error) {
        console.error("Error invoking agent:", error);
        if (res.headersSent) {
            // Headers already committed (SSE started), send error as SSE event then close
            res.write(`data: ${JSON.stringify({ error: "An error occurred while invoking the agent." })}\n\n`);
            res.end();
        } else {
            res.status(500).json({ error: "An error occurred while invoking the agent." });
        }
    }
});
export default agentRouter;