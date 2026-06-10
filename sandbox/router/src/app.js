import express from "express";
import http from "http";
import { createProxyMiddleware } from "http-proxy-middleware";
import morgan from "morgan";
import { refreshTTL } from "./config/redis.js";

const app = express();
app.use(morgan("combined"));

app.get('/api/status/healthz', (req, res) => {
    res.status(200).json({ message: 'Router server is healthy', status: 'ok' });
});

app.get('/api/status/readyz', (req, res) => {
    res.status(200).json({ message: 'Router server is ready', status: 'ready' });
});

const proxies = {};
const agentProxies = {};

function getProxy(sandboxId) {
    const target = `http://sandbox-service-${sandboxId}`;
    if (!proxies[sandboxId]) {
        proxies[sandboxId] = createProxyMiddleware({
            target,
            changeOrigin: true,
        });
    }
    return proxies[sandboxId];
}

function getAgentProxy(sandboxId) {
    const target = `http://sandbox-service-${sandboxId}:3000`;
    if (!agentProxies[sandboxId]) {
        agentProxies[sandboxId] = createProxyMiddleware({
            target,
            changeOrigin: true,
        });
    }
    return agentProxies[sandboxId];
}




app.use( async (req, res, next) => {
    const host = req.headers.host;
    const sandboxId = host.split('.')[0];

    await refreshTTL(sandboxId)

    if (host.split('.')[1] === 'agent') {
        return getAgentProxy(sandboxId)(req, res, next);
    } else if (host.split('.')[1] === 'preview') {
        return getProxy(sandboxId)(req, res, next);
    } else {
        next();                                    
    }
});

const server = http.createServer(app);

server.on('upgrade', (req, socket, head) => {
    const host = req.headers.host;
    const sandboxId = host.split('.')[0];
    const type = host.split('.')[1];

    console.log(`WS upgrade request for sandbox ${sandboxId}`);

    if (type === 'agent') {
        getAgentProxy(sandboxId).upgrade(req, socket, head);
    } else if (type === 'preview') {
        getProxy(sandboxId).upgrade(req, socket, head);
    } else {
        socket.destroy();
    }
});

export default server;