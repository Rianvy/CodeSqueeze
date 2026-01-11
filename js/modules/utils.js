/**
 * Utility Functions
 * Вспомогательные функции общего назначения
 */

const Utils = {
    /**
     * Проверить, пустая ли строка
     * @param {string} str - Строка для проверки
     * @returns {boolean}
     */
    isEmpty(str) {
        return !str || str.trim().length === 0;
    },

    /**
     * Проверить, содержит ли строка только пробелы
     * @param {string} str - Строка для проверки
     * @returns {boolean}
     */
    isWhitespaceOnly(str) {
        return str && str.length > 0 && str.trim().length === 0;
    },

    /**
     * Проверить минимальную длину
     * @param {string} str - Строка
     * @param {number} minLength - Минимальная длина
     * @returns {boolean}
     */
    hasMinLength(str, minLength = 1) {
        return str && str.trim().length >= minLength;
    },

    /**
     * Получить размер строки в байтах
     * @param {string} str - Входная строка
     * @returns {number} Размер в байтах
     */
    getByteSize(str) {
        if (!str) return 0;
        return new Blob([str]).size;
    },

    /**
     * Форматировать число с разделителями
     * @param {number} num - Число
     * @returns {string} Отформатированное число
     */
    formatNumber(num) {
        if (typeof num !== 'number' || isNaN(num)) return '0';
        return num.toLocaleString();
    },

    /**
     * Форматировать размер файла
     * @param {number} bytes - Размер в байтах
     * @returns {string} Отформатированный размер
     */
    formatFileSize(bytes) {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    /**
     * Рассчитать процент экономии
     * @param {number} original - Исходный размер
     * @param {number} minified - Сжатый размер
     * @returns {number} Процент экономии
     */
    calculateSavings(original, minified) {
        if (!original || original === 0) return 0;
        return ((original - minified) / original * 100);
    },

    /**
     * Debounce функция
     * @param {Function} func - Функция для debounce
     * @param {number} wait - Задержка в мс
     * @returns {Function} Debounced функция
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Throttle функция
     * @param {Function} func - Функция для throttle
     * @param {number} limit - Лимит в мс
     * @returns {Function} Throttled функция
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Копировать текст в буфер обмена
     * @param {string} text - Текст для копирования
     * @returns {Promise<boolean>} Успех операции
     */
    async copyToClipboard(text) {
        // Проверка на пустоту
        if (this.isEmpty(text)) {
            return { success: false, error: 'empty' };
        }

        try {
            await navigator.clipboard.writeText(text);
            return { success: true };
        } catch (err) {
            // Fallback для старых браузеров
            try {
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                const success = document.execCommand('copy');
                document.body.removeChild(textarea);
                return { success, error: success ? null : 'fallback_failed' };
            } catch (fallbackErr) {
                return { success: false, error: 'not_supported' };
            }
        }
    },

    /**
     * Читать текст из буфера обмена
     * @returns {Promise<Object>} Результат операции
     */
    async readFromClipboard() {
        try {
            const text = await navigator.clipboard.readText();
            
            if (this.isEmpty(text)) {
                return { success: false, error: 'empty', text: null };
            }
            
            return { success: true, text };
        } catch (err) {
            return { success: false, error: 'permission_denied', text: null };
        }
    },

    /**
     * Проверить, является ли строка валидным HTML
     * @param {string} str - Строка для проверки
     * @returns {boolean}
     */
    isHTML(str) {
        if (this.isEmpty(str)) return false;
        return /<[a-z][\s\S]*>/i.test(str);
    },

    /**
     * Проверить, является ли строка валидным JavaScript
     * @param {string} str - Строка для проверки
     * @returns {boolean}
     */
    isJavaScript(str) {
        if (this.isEmpty(str)) return false;
        // Простая проверка на наличие JS-конструкций
        return /(?:function|const|let|var|if|for|while|return|class|import|export)\s/.test(str) ||
               /[\{\}\[\]\(\);]/.test(str);
    },

    /**
     * Экранировать HTML
     * @param {string} str - Строка для экранирования
     * @returns {string} Экранированная строка
     */
    escapeHTML(str) {
        if (this.isEmpty(str)) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    /**
     * Генерировать уникальный ID
     * @returns {string} Уникальный ID
     */
    generateId() {
        return 'id_' + Math.random().toString(36).substr(2, 9);
    },

    /**
     * Безопасно получить значение из объекта
     * @param {Object} obj - Объект
     * @param {string} path - Путь (например, 'a.b.c')
     * @param {*} defaultValue - Значение по умолчанию
     * @returns {*}
     */
    get(obj, path, defaultValue = null) {
        if (!obj) return defaultValue;
        const keys = path.split('.');
        let result = obj;
        for (const key of keys) {
            result = result?.[key];
            if (result === undefined) return defaultValue;
        }
        return result;
    }
};

// Экспорт
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}