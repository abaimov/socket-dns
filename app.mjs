import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server);

app.get("/", (req, res) => res.send('WS'));

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

server.listen(8080, () => {
    console.log('Сервер запущен на порту 8080');
});
