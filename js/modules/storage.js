/**
 * Storage Module
 * Работа с локальным хранилищем (опционально)
 */

const Storage = (function() {
    'use strict';

    const PREFIX = 'codesqueeze_';

    /**
     * Проверить доступность localStorage
     * @returns {boolean}
     */
    function isAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Сохранить данные
     * @param {string} key - Ключ
     * @param {*} value - Значение
     */
    function save(key, value) {
        if (!isAvailable()) return false;
        
        try {
            const serialized = JSON.stringify(value);
            localStorage.setItem(PREFIX + key, serialized);
            return true;
        } catch (e) {
            console.warn('Storage save error:', e);
            return false;
        }
    }

    /**
     * Загрузить данные
     * @param {string} key - Ключ
     * @param {*} defaultValue - Значение по умолчанию
     * @returns {*} Сохранённое значение или defaultValue
     */
    function load(key, defaultValue = null) {
        if (!isAvailable()) return defaultValue;
        
        try {
            const serialized = localStorage.getItem(PREFIX + key);
            if (serialized === null) return defaultValue;
            return JSON.parse(serialized);
        } catch (e) {
            console.warn('Storage load error:', e);
            return defaultValue;
        }
    }

    /**
     * Удалить данные
     * @param {string} key - Ключ
     */
    function remove(key) {
        if (!isAvailable()) return;
        localStorage.removeItem(PREFIX + key);
    }

    /**
     * Очистить все данные приложения
     */
    function clear() {
        if (!isAvailable()) return;
        
        Object.keys(localStorage)
            .filter(key => key.startsWith(PREFIX))
            .forEach(key => localStorage.removeItem(key));
    }

    /**
     * Сохранить настройки
     * @param {Object} options - Настройки
     */
    function saveOptions(options) {
        save('options', options);
    }

    /**
     * Загрузить настройки
     * @returns {Object} Настройки
     */
    function loadOptions() {
        return load('options', {
            removeComments: true,
            removeWhitespace: true,
            minifyInlineJS: true,
            minifyInlineCSS: true
        });
    }

    // Публичный API
    return {
        isAvailable,
        save,
        load,
        remove,
        clear,
        saveOptions,
        loadOptions
    };
})();

// Экспорт
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Storage;
}