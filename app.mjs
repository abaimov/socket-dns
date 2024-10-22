import express from 'express';
import {createServer} from 'http';
import {WebSocketServer} from 'ws';
import useragent from 'express-useragent';
import {fileURLToPath} from 'url';
import {dirname, join} from 'path';
import dotenv from 'dotenv';
import morgan from 'morgan';

dotenv.config();

const app = express();
app.use(useragent.express());
app.use(morgan('short')); // Логирование запросов

const server = createServer(app);
const wss = new WebSocketServer({server});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getCurrentTime = () => {
    const now = new Date();
    return now.toTimeString().split(' ')[0];
};

// Отправка HTML страницы
app.get('/page', (req, res) => {
    res.sendFile(join(__dirname, 'index.html'));
});

app.get('/', (req, res) => {
    res.json({msg: "GET"})
});

// Обработка POST запроса
app.post('/', (req, res) => {
    const userAgent = req.useragent;

    res.json({
        browser: userAgent.browser,
        version: userAgent.version,
        os: userAgent.os,
        platform: userAgent.platform,
        source: userAgent.source
    });
});

// Обработка WebSocket соединений
const clients = new Set(); // Для отслеживания подключенных клиентов

wss.on('connection', (ws, req) => {
    console.log(`[${getCurrentTime()}] Новое подключение`);
    clients.add(ws); // Добавляем клиента в набор

    // Получаем User-Agent из HTTP-заголовков
    const userAgent = req.headers['user-agent'];
    ws.send(`User-Agent: ${userAgent}`); // Отправляем User-Agent клиенту
    ws.send('Соединение установлено');

    ws.on('message', (message) => {
        console.log(`[${getCurrentTime()}] Получено сообщение: `, message);
        ws.send('Сообщение получено сервером');
    });

    ws.on('close', () => {
        console.log(`[${getCurrentTime()}] Клиент отключился`);
        clients.delete(ws); // Удаляем клиента из набора
    });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`[${getCurrentTime()}] Сервер запущен на порту ${PORT}`);
});
