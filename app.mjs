import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
    const userAgent = req.headers['user-agent'];
    console.log(`Подключено: ${userAgent}`);

    ws.on('message', (message) => {
        console.log(`Получено сообщение: ${message}`);
        ws.send(`Ваш User-Agent: ${userAgent}`);
    });

    ws.on('close', () => {
        console.log('Клиент отключился');
    });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
