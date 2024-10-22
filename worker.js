addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    // Логирование входящего запроса
    console.log(`Incoming request: ${request.method} ${request.url}`);

    // Создание нового запроса с изменением заголовков
    const modifiedRequest = new Request(request, {
        headers: {
            'Host': 'drive.google.com', // Изменяем Host на Google Drive
            'X-Requested-With': 'XMLHttpRequest', // Указываем, что это AJAX-запрос
            'Referer': 'https://www.google.com', // Указываем реферер
            'Content-Type': 'application/json', // Указываем тип контента
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36', // Подменяем User-Agent
            'Accept': 'application/json, text/plain, */*', // Указываем, какие типы контента принимаем
            'Accept-Language': 'en-US,en;q=0.9', // Указываем язык
            'Accept-Encoding': 'gzip, deflate, br', // Указываем допустимые типы сжатия
            'DNT': '1', // Do Not Track
            'Connection': 'keep-alive', // Поддержка соединения
            'Upgrade-Insecure-Requests': '1', // Поддержка безопасных запросов
            'Cache-Control': 'max-age=0', // Указание кэширования
            'Pragma': 'no-cache', // Указание на отсутствие кэша
            // Дополнительные заголовки, которые могут помочь
            'X-Forwarded-For': '142.250.185.78', // Имитация IP-адреса клиента (можно настроить)
            'X-Real-IP': '142.250.185.78', // Другой заголовок для указания реального IP-адреса
            // Добавьте другие заголовки по необходимости
        },
        method: request.method, // Метод (GET, POST и т.д.)
        body: request.method === 'POST' ? request.body : null // Передаем тело запроса для POST
    });

    // Прокси на ваш веб-сайт с кэшированием
    const cacheUrl = new URL(request.url);
    cacheUrl.hostname = 'pinup-az.info'; // Замените на ваш сайт

    const cacheKey = new Request(cacheUrl.toString(), {
        method: request.method,
        headers: modifiedRequest.headers
    });

    // Проверяем наличие кэша
    let cachedResponse = await caches.default.match(cacheKey);
    if (cachedResponse) {
        console.log('Serving from cache');
        return cachedResponse; // Возвращаем кэшированный ответ
    }

    // Если кэша нет, выполняем запрос
    const response = await fetch(cacheUrl.toString(), modifiedRequest);

    // Кэшируем ответ, если это успешный запрос
    if (response.ok) {
        const responseToCache = new Response(response.body, response);
        responseToCache.headers.append('Cache-Control', 'max-age=3600'); // Кэшируем на 1 час
        //event.waitUntil(caches.default.put(cacheKey, responseToCache.clone()));
    }

    // Возвращаем ответ с оригинальным заголовком
    const newResponse = new Response(response.body, response);
    newResponse.headers.set('Access-Control-Allow-Origin', '*'); // Позволяем CORS
    return newResponse;

}
