import express from 'express';
import fetch from 'node-fetch';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const PORT = process.env.PORT || 8000;

// Прокси для перенаправления запросов
const proxy = createProxyMiddleware({
    target: 'http://example.com', // Замените на ваш целевой сайт
    changeOrigin: true,
});

// Обработка запросов
app.get('/', async (req, res) => {
    // Получаем IP пользователя
    const IP = await fetch('https://ipapi.co/json/')
        .then(d => d.json());

    console.log(IP);

    // Если страна пользователя - Беларусь, используем прокси
    if (IP.country === 'BY') {
        return proxy(req, res); // Направляем запрос через прокси
    }

    // Иначе, просто возвращаем информацию о стране
    return res.send(`${IP.country}`);
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});