/**
 * Notifications Module
 * Система уведомлений
 */

const Notifications = (function() {
    'use strict';

    let container = null;
    let textElement = null;
    let iconContainer = null;
    let timeout = null;
    let duration = 3000;

    /**
     * Инициализация модуля
     * @param {HTMLElement} notificationContainer - Контейнер уведомления
     * @param {HTMLElement} notificationText - Элемент текста
     * @param {number} displayDuration - Длительность показа (мс)
     */
    function init(notificationContainer, notificationText, displayDuration = 3000) {
        container = notificationContainer;
        textElement = notificationText;
        duration = displayDuration;
        
        if (container) {
            iconContainer = container.querySelector('[data-notification-icon]');
        }
    }

    /**
     * Показать уведомление
     * @param {string} message - Текст уведомления
     * @param {string} type - Тип ('success', 'error', 'warning', 'info')
     */
    function show(message, type = 'success') {
        if (!container || !textElement) {
            console.warn('Notifications not initialized');
            return;
        }

        // Проверка на пустое сообщение
        if (!message || message.trim().length === 0) {
            return;
        }

        // Очистить предыдущий таймаут
        if (timeout) {
            clearTimeout(timeout);
        }

        // Установить текст
        textElement.textContent = message;

        // Установить иконку и цвет бордера
        if (iconContainer) {
            iconContainer.innerHTML = getIcon(type);
            updateBorderColor(type);
        }

        // Показать уведомление
        container.classList.remove('translate-x-[150%]');
        container.classList.add('translate-x-0');

        // Скрыть через duration мс
        timeout = setTimeout(hide, duration);
    }

    /**
     * Скрыть уведомление
     */
    function hide() {
        if (!container) return;
        
        container.classList.remove('translate-x-0');
        container.classList.add('translate-x-[150%]');
    }

    /**
     * Обновить цвет бордера в зависимости от типа
     * @param {string} type - Тип уведомления
     */
    function updateBorderColor(type) {
        if (!container) return;
        
        // Удалить все цвета бордеров
        container.classList.remove(
            'border-brand-500/30',
            'border-red-500/30',
            'border-yellow-500/30',
            'border-blue-500/30'
        );

        // Добавить новый цвет
        const borderColors = {
            success: 'border-brand-500/30',
            error: 'border-red-500/30',
            warning: 'border-yellow-500/30',
            info: 'border-blue-500/30'
        };

        container.classList.add(borderColors[type] || borderColors.success);
    }

    /**
     * Получить SVG иконку по типу
     * @param {string} type - Тип уведомления
     * @returns {string} SVG иконка
     */
    function getIcon(type) {
        const icons = {
            success: `<svg class="w-5 h-5 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>`,
            error: `<svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>`,
            warning: `<svg class="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>`,
            info: `<svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>`
        };
        
        return icons[type] || icons.success;
    }

    /**
     * Быстрые методы
     */
    function success(message) { show(message, 'success'); }
    function error(message) { show(message, 'error'); }
    function warning(message) { show(message, 'warning'); }
    function info(message) { show(message, 'info'); }

    // Публичный API
    return {
        init,
        show,
        hide,
        success,
        error,
        warning,
        info
    };
})();

// Экспорт
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Notifications;
}