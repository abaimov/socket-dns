import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv'; // Импортируем dotenv

dotenv.config(); // Инициализация dotenv

const app = express();
const server = createServer(app);
const io = new Server(server);

// Получаем __dirname для ES-модулей
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
    console.log('Новое подключение: ', socket.id);

    socket.on('message', (msg) => {
        console.log('Получено сообщение: ', msg);
        socket.emit('response', 'Сообщение получено сервером');
    });

    socket.emit('welcome', 'Соединение установлено');

    socket.on('disconnect', () => {
        console.log('Клиент отключился');
    });
});

// Используйте переменную PORT из файла .env
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
