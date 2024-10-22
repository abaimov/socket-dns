import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws'; // Исправленный импорт
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server }); // Создаем экземпляр WebSocket.Server

// Получаем __dirname для ES-модулей
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'index.html'));
});

// Обработка WebSocket соединений
wss.on('connection', (ws) => {
    console.log('Новое подключение');

    // Отправляем приветственное сообщение
    ws.send('Соединение установлено');

    // Обработка входящих сообщений
    ws.on('message', (message) => {
        console.log('Получено сообщение: ', message);
        ws.send('Сообщение получено сервером');
    });

    // Обработка отключения клиента
    ws.on('close', () => {
        console.log('Клиент отключился');
    });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
