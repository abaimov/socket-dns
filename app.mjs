import express from 'express';
import { WebSocketServer } from 'ws';

import path from 'path'; // Импортируем модуль path для работы с путями файловой системы
import { URL } from 'url'; // Импортируем для валидации URL

const app = express();
const PORT = process.env.PORT || 8080;

// Создание WebSocket сервера
const wss = new WebSocketServer({ noServer: true });

// Функция для проверки валидности URL
const isValidUrl = (urlString) => {
    try {
        new URL(urlString); // Проверка, является ли строка допустимым URL
        return true;
    } catch (error) {
        return false;
    }
};

// Обработка соединения WebSocket
wss.on('connection', (ws) => {
    ws.on('message', async (message) => {
        const url = message.toString().trim(); // Получаем URL

        console.log(`Fetching URL: ${url}`);

        // Проверка валидности URL
        if (!isValidUrl(url)) {
            ws.send(`Error: Invalid URL: ${url}`);
            return;
        }

        try {
            // Запрос к сайту
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.text(); // Получаем содержимое ответа
            ws.send(data); // Отправляем содержимое клиенту
        } catch (error) {
            ws.send(`Error fetching URL: ${error.message}`);
        }
    });
});

// Обработка HTTP-запросов
app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'index.html')); // Отправляем файл index.html
});

// Прокси-сервер для WebSocket
const server = app.listen(PORT, () => {
    console.log(`HTTP server is running on port ${PORT}`);
});

// Обработка HTTP-запросов для WebSocket
server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});
