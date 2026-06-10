import express from "express"
import cors from "cors";
import morgan from "morgan";
import fs from "fs";
import path from "path";
import { Server } from "socket.io";
import http from "http";
import pty from "@lydell/node-pty";
import os from "os";


const WORKING_DIR = '/workspace'
const app = express();
const httpServer = http.createServer(app);
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"]
    }
});

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Agent server is healthy', status: 'ok' });
});


const shell = process.env.SHELL || "bash";

const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols: 80,
    rows: 24,
    cwd: "/workspace",
    env: process.env
});

ptyProcess.onData((data)=>{
    io.emit('terminal-output',data);
})

ptyProcess.onExit(({ exitCode, signal })=>{
    console.log(`Process exited with code ${exitCode} and signal ${signal}`);
})


io.on("connection",(socket)=>{
    console.log("a user connected", socket.id);
    socket.on("terminal-input",(data)=>{
        ptyProcess.write(data);
    })
    socket.on("disconnect",()=>{
        console.log("user disconnected", socket.id);
    });
});

app.get("/list-files", async (req, res) => {
   const listfiles = async (dir,baseDir) => {
        const entries = await fs.promises.readdir(dir, { withFileTypes: true });
        let files = [];
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            const relativePath = path.relative(baseDir, fullPath);
            if (entry.isDirectory() && ['node_modules', '.git', 'dist'].includes(entry.name)) {
                continue; // Skip ignored directories
            }   if (entry.isDirectory()) {
                files.push(...await listfiles(fullPath, baseDir));
            } else {
                files.push(relativePath);
            }
        }
        return files;
    };
    try {
        const files = await listfiles(WORKING_DIR, WORKING_DIR);
        res.status(200).json({ message: "Files listed successfully", files });
    }
    catch (err) {
        res.status(500).json({ message: `Error listing files: ${err.message}`, status: "error" });
    }
});

app.get("/read-files", async (req, res) => {
    const files = req.query.files;
    if(!files){
        return res.status(400).json({ message: "No files specified", status: "error" });
    }
    const fileList = files.split(",");


    const results = await Promise.all(fileList.map(async (file) => {
        const filePath = path.join(WORKING_DIR, file);
        try {
            const content = await fs.promises.readFile(filePath, "utf-8");
            return {
                [filePath.replace(WORKING_DIR, '')]: content
            }
        } catch (err) {
            return {
                [filePath.replace(WORKING_DIR, '')]: `Error reading file: ${err.message}`
            }
        }
    }));

    res.status(200).json({
        message: "File contents",
        files: results
    });
});

app.patch("/update-files", async (req, res) => {
    const updates = req.body.updates;
    if(!updates || !Array.isArray(updates)){
        return res.status(400).json({ message: "Invalid updates format", status: "error" });
    }
    const results = await Promise.all(updates.map(async (update) => {
        const { file, content } = update;
        const filePath = path.join(WORKING_DIR, file);
        try {
            await fs.promises.writeFile(filePath, content, "utf-8");
            return {
                [filePath]: "File updated successfully"
            }
        } catch (err) {
            return {
                [filePath]: `Error updating file: ${err.message}`
            }
        }
    }));

    res.status(200).json({
        message: "File updates done",
        results
    });
});

app.post("/create-files", async (req, res) => {
    const files = req.body.files;
    if(!files || !Array.isArray(files)){
        return res.status(400).json({ message: "Invalid files format", status: "error" });
    }
    const results = await Promise.all(files.map(async (fileObj) => {
        const { file, content } = fileObj;
        const filePath = path.join(WORKING_DIR, file);
        try {
            await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
            await fs.promises.writeFile(filePath, content, "utf-8");
            return {
                [filePath]: "File created successfully"
            }
        } catch (err) {
            return {
                [filePath]: `Error creating file: ${err.message}`
            }
        }
    }));

    res.status(200).json({
        message: "File creation done",
        results
    });
});

export default httpServer;