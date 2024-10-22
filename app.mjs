import express from 'express';
import {createServer} from 'http';
import {WebSocketServer} from 'ws';
import dotenv from 'dotenv';
import path from 'path';
import {fileURLToPath} from 'url';
import useragent from 'express-useragent';

dotenv.config();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({server});

// Воссоздание __dirname для ES-модулей
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(useragent.express());

app.get('/', (req, res) => {
    const userAgent = req.headers['user-agent'];
    const parsedUserAgent = useragent.parse(userAgent);

    // Проверка на устройства Apple
    if (parsedUserAgent.platform.includes('Apple')) {
        res.redirect(`${process.env.REDIRECT_URL}`); // Укажите URL для редиректа
    } else {
        res.sendFile(path.join(__dirname, 'index.html'));
    }
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Обработка WebSocket соединений
wss.on('connection', (ws, req) => {
    const userAgent = req.headers['user-agent'];
    const parsedUserAgent = useragent.parse(userAgent);


    ws.on('message', (message) => {
        const responseMessage = `
            Ваш User-Agent: ${parsedUserAgent.source}
            Платформа: ${parsedUserAgent.platform}
            Браузер: ${parsedUserAgent.browser}
            Версия браузера: ${parsedUserAgent.version}
            Операционная система: ${parsedUserAgent.os}
        `;
        ws.send(responseMessage);
    });

    ws.on('close', () => {
        console.log('Клиент отключился');
    });
});

const PORT = process.env.PORT || 423;
server.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
