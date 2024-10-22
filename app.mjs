import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getCurrentTime = () => {
    const now = new Date();
    return now.toTimeString().split(' ')[0];
};

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'index.html'));
});

wss.on('connection', (ws) => {
    console.log(`[${getCurrentTime()}] Новое подключение`);

    ws.send('Соединение установлено');

    ws.on('message', (message) => {
        console.log(`[${getCurrentTime()}] Получено сообщение: `, message);
        ws.send('Сообщение получено сервером');
    });

    ws.on('close', () => {
        console.log(`[${getCurrentTime()}] Клиент отключился`);
    });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`[${getCurrentTime()}] Сервер запущен на порту ${PORT}`);
});
