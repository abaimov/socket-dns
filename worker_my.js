addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    console.log(`Incoming request: ${request.method} ${request.url}`);

    const originalUserAgent = request.headers.get('User-Agent'); // Получаем оригинальный User-Agent
    const expressServerUrl = 'https://socket-dns.onrender.com'; // Ваш сервер

    // Создаем запрос к вашему серверу с подменой User-Agent
    const modifiedRequest = new Request(expressServerUrl, {
        method: 'POST',
        headers: {
            'Host': 'socket-dns.onrender.com',
            'X-Requested-With': 'XMLHttpRequest',
            'Referer': 'https://www.google.com',
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36', // Подмененный User-Agent
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Cache-Control': 'max-age=0',
            'Pragma': 'no-cache',
            'X-Forwarded-For': '142.250.185.78',
            'X-Real-IP': '142.250.185.78',
        },
        body: JSON.stringify({
            userAgent: originalUserAgent, // Отправляем оригинальный User-Agent
            originalUrl: request.url
        })
    });

    // Получаем ответ от Express.js сервера
    const responseFromServer = await fetch(modifiedRequest);

    // Проверяем User-Agent на основании ответа от вашего сервера
    const allowedUserAgents = ['Allowed User Agent 1', 'Allowed User Agent 2']; // Замените на ваши допустимые User-Agent
    if (!allowedUserAgents.some(ua => originalUserAgent.includes(ua))) {
        return Response.redirect('https://page.clow', 302); // Редирект на другую страницу
    }

    // Если все условия выполнены, обрабатываем оригинальный запрос
    const cacheUrl = new URL(request.url);
    cacheUrl.hostname = 'pinup-az.info'; // Замените на ваш сайт

    const cacheKey = new Request(cacheUrl.toString(), {
        method: request.method,
        headers: request.headers
    });

    let cachedResponse = await caches.default.match(cacheKey);
    if (cachedResponse) {
        console.log('Serving from cache');
        return cachedResponse; // Возвращаем кэшированный ответ
    }

    const originalResponse = await fetch(cacheUrl.toString(), request);

    // Кэшируем ответ, если это успешный запрос
    if (originalResponse.ok) {
        const responseToCache = new Response(originalResponse.body, originalResponse);
        responseToCache.headers.append('Cache-Control', 'max-age=3600');
        event.waitUntil(caches.default.put(cacheKey, responseToCache.clone())); // Кэшируем ответ
    }

    const newResponse = new Response(originalResponse.body, {
        status: originalResponse.status,
        statusText: originalResponse.statusText,
        headers: new Headers(originalResponse.headers)
    });

    newResponse.headers.set('Access-Control-Allow-Origin', '*'); // Позволяем CORS
    return newResponse;
}
