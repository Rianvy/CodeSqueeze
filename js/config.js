/**
 * CodeSqueeze Configuration
 * Глобальные настройки приложения
 */

const CONFIG = {
    // Версия приложения
    version: '2.0.0',
    
    // Настройки по умолчанию
    defaults: {
        removeComments: true,
        removeWhitespace: true,
        minifyInlineJS: true,
        minifyInlineCSS: true
    },
    
    // Настройки UI
    ui: {
        notificationDuration: 3000,
        animationDuration: 300
    },
    
    // Поддерживаемые языки
    languages: {
        html: {
            name: 'HTML',
            extension: 'html',
            mimeType: 'text/html'
        },
        js: {
            name: 'JavaScript',
            extension: 'js',
            mimeType: 'text/javascript'
        },
        css: {
            name: 'CSS',
            extension: 'css',
            mimeType: 'text/css'
        }
    },
    
    // Примеры кода
    samples: {
        js: `// Sample JavaScript Configuration
const CONFIG = {
    TELEGRAM: {
        BOT_URL: 'https://t.me/mybot',
        CHANNEL_URL: 'https://t.me/mychannel',
        SUPPORT_URL: 'https://t.me/support'
    },
    API_ENDPOINT: 'https://api.example.com/v1',
    TIMEOUT: 5000
};

/* Multi-line comment
   describing the function */
function fetchData(url) {
    return fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log('Data received:', data);
            return data;
        });
}

// Initialize application
fetchData(CONFIG.API_ENDPOINT);`,

        html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sample Page</title>
    <style>
        /* Main styles */
        body {
            margin: 0;
            padding: 20px;
            font-family: Arial, sans-serif;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .header {
            background: #333;
            color: white;
            padding: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <h1>Hello World!</h1>
        </header>
        
        <!-- This is a comment -->
        <main>
            <p>Sample paragraph with some text content.</p>
        </main>
    </div>
    
    <script>
        // Config object
        const CONFIG = {
            API_URL: 'https://api.example.com',
            TIMEOUT: 3000
        };
        
        function init() {
            console.log('Page initialized!');
            console.log('Config:', CONFIG);
        }
        
        // Run on load
        init();
    </script>
</body>
</html>`
    }
};

// Экспорт для ES6 модулей
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}