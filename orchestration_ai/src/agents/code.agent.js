import "dotenv/config";
import { ChatMistralAI } from "@langchain/mistralai";
import { listfiles,readfiles,updatefiles } from "./tools.js";
import { createAgent } from "langchain";
const model = new ChatMistralAI({
    model: "mistral-medium-latest",
    apiKey: process.env.MISTRAL_API_KEY,
    temperature:0.7,
})

const agent = createAgent({
    model,
    tools : [listfiles,readfiles,updatefiles]
})

await agent.invoke({
    messages:[
        {
            role:"user",
            content:"update the theme of the project to blood red"
        }
    ]
})