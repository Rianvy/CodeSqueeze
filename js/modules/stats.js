/**
 * Stats Module
 * Расчёт и отображение статистики
 */

const Stats = (function() {
    'use strict';

    // DOM элементы
    let elements = {};

    /**
     * Инициализация модуля
     * @param {Object} domElements - DOM элементы для обновления
     */
    function init(domElements) {
        elements = domElements;
    }

    /**
     * Рассчитать статистику
     * @param {string} original - Исходный код
     * @param {string} minified - Минифицированный код
     * @returns {Object} Объект со статистикой
     */
    function calculate(original, minified) {
        const originalSize = new Blob([original]).size;
        const minifiedSize = new Blob([minified]).size;
        const savedBytes = originalSize - minifiedSize;
        const savingsPercent = originalSize > 0 
            ? ((savedBytes / originalSize) * 100) 
            : 0;

        return {
            originalSize,
            minifiedSize,
            savedBytes,
            savingsPercent: savingsPercent.toFixed(1),
            originalChars: original.length,
            minifiedChars: minified.length
        };
    }

    /**
     * Обновить отображение статистики
     * @param {Object} stats - Объект со статистикой
     */
    function update(stats) {
        if (elements.originalSize) {
            elements.originalSize.textContent = stats.originalSize.toLocaleString();
        }
        if (elements.minifiedSize) {
            elements.minifiedSize.textContent = stats.minifiedSize.toLocaleString();
        }
        if (elements.savings) {
            elements.savings.textContent = stats.savingsPercent + '%';
        }
        if (elements.savedBytes) {
            elements.savedBytes.textContent = stats.savedBytes.toLocaleString();
        }
        if (elements.outputChars) {
            elements.outputChars.textContent = stats.minifiedChars.toLocaleString();
        }
        if (elements.compressionPercent) {
            elements.compressionPercent.textContent = stats.savingsPercent + '%';
        }
        if (elements.compressionBar) {
            elements.compressionBar.style.width = Math.min(parseFloat(stats.savingsPercent), 100) + '%';
        }
        if (elements.progressCircle) {
            elements.progressCircle.setAttribute('stroke-dasharray', stats.savingsPercent + ', 100');
        }
    }

    /**
     * Сбросить статистику
     */
    function reset() {
        update({
            originalSize: 0,
            minifiedSize: 0,
            savedBytes: 0,
            savingsPercent: '0',
            originalChars: 0,
            minifiedChars: 0
        });
    }

    // Публичный API
    return {
        init,
        calculate,
        update,
        reset
    };
})();

// Экспорт
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Stats;
}