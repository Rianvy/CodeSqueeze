/**
 * UI Module
 * Управление пользовательским интерфейсом
 */

const UI = (function() {
    'use strict';

    let currentMode = 'html';
    let elements = {};

    /**
     * Инициализация UI
     */
    function init(domElements) {
        elements = domElements;
        setupEventListeners();
        setupMobileMenu();
        setupFullscreenButtons();
        updateCharCount();
    }

    /**
     * Настройка обработчиков событий
     */
    function setupEventListeners() {
        // Переключение вкладок
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => switchTab(btn));
        });

        // Счётчик символов
        if (elements.inputCode) {
            elements.inputCode.addEventListener('input', updateCharCount);
        }
    }

    /**
     * Настройка мобильного меню
     */
    function setupMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileMenu = document.getElementById('mobileMenu');
        const menuIcon = document.getElementById('menuIcon');
        const closeIcon = document.getElementById('closeIcon');

        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('active');
                if (menuIcon) menuIcon.classList.toggle('hidden');
                if (closeIcon) closeIcon.classList.toggle('hidden');
            });

            mobileMenu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    mobileMenu.classList.remove('active');
                    if (menuIcon) menuIcon.classList.remove('hidden');
                    if (closeIcon) closeIcon.classList.add('hidden');
                });
            });
        }
    }

    /**
     * Настройка кнопок полноэкранного режима
     */
    function setupFullscreenButtons() {
        addFullscreenButton('inputCode', 'Исходный код', false);
        addFullscreenButton('outputCode', 'Результат', true);
    }

    /**
     * Добавить кнопку полноэкранного режима
     */
    function addFullscreenButton(textareaId, title, readonly) {
        const textarea = document.getElementById(textareaId);
        if (!textarea) return;

        const editorBox = textarea.closest('.gradient-border');
        if (!editorBox) return;

        const header = editorBox.querySelector('.bg-dark-400\\/80');
        if (!header) return;

        const actionsContainer = header.querySelector(':scope > div:last-child');
        if (!actionsContainer || actionsContainer.querySelector('.fullscreen-btn')) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'tooltip-wrapper';
        wrapper.innerHTML = `
            <button class="fullscreen-btn p-2 hover:bg-white/5 rounded-lg transition-all text-gray-400 hover:text-white" title="На весь экран">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
                </svg>
            </button>
            <span class="tooltip-text">На весь экран</span>
        `;

        wrapper.querySelector('button').addEventListener('click', () => {
            if (typeof Fullscreen !== 'undefined') {
                Fullscreen.open({
                    value: textarea.value,
                    title: title,
                    mode: currentMode,
                    readonly: readonly,
                    onSave: (value) => {
                        textarea.value = value;
                        if (textareaId === 'inputCode') {
                            updateCharCount();
                        }
                        if (textareaId === 'outputCode' && elements.outputChars) {
                            elements.outputChars.textContent = value.length.toLocaleString();
                        }
                    }
                });
            }
        });

        actionsContainer.insertBefore(wrapper, actionsContainer.firstChild);
    }

    /**
     * Переключение вкладки
     */
    function switchTab(btn) {
        const tabButtons = document.querySelectorAll('.tab-btn');
        
        tabButtons.forEach(b => {
            b.classList.remove('active', 'bg-brand-500', 'text-dark-500');
            b.classList.add('text-gray-400', 'hover:text-white', 'hover:bg-white/5');
        });
        
        btn.classList.add('active', 'bg-brand-500', 'text-dark-500');
        btn.classList.remove('text-gray-400', 'hover:text-white', 'hover:bg-white/5');
        
        currentMode = btn.dataset.input;
        
        const inputLang = document.getElementById('inputLang');
        if (inputLang) {
            inputLang.textContent = currentMode.toUpperCase();
        }
    }

    /**
     * Получить текущий режим
     */
    function getCurrentMode() {
        return currentMode;
    }

    /**
     * Обновить счётчик символов
     */
    function updateCharCount() {
        if (elements.inputCode && elements.inputChars) {
            const value = elements.inputCode.value || '';
            elements.inputChars.textContent = value.length.toLocaleString();
        }
    }

    /**
     * Установить значение поля ввода
     */
    function setInputValue(value) {
        if (elements.inputCode) {
            elements.inputCode.value = value || '';
            updateCharCount();
        }
    }

    /**
     * Получить значение поля ввода
     */
    function getInputValue() {
        return elements.inputCode ? (elements.inputCode.value || '') : '';
    }

    /**
     * Установить значение поля вывода
     */
    function setOutputValue(value) {
        if (elements.outputCode) {
            elements.outputCode.value = value || '';
        }
        if (elements.outputChars) {
            elements.outputChars.textContent = (value || '').length.toLocaleString();
        }
    }

    /**
     * Получить значение поля вывода
     */
    function getOutputValue() {
        return elements.outputCode ? (elements.outputCode.value || '') : '';
    }

    /**
     * Проверить наличие данных во вводе
     */
    function hasInput() {
        const value = getInputValue();
        return value && value.trim().length > 0;
    }

    /**
     * Проверить наличие данных в выводе
     */
    function hasOutput() {
        const value = getOutputValue();
        return value && value.trim().length > 0;
    }

    /**
     * Поменять местами
     */
    function swapValues() {
        const input = getInputValue();
        const output = getOutputValue();
        
        if (!input && !output) {
            return false;
        }
        
        setInputValue(output);
        setOutputValue(input);
        return true;
    }

    /**
     * Очистить поля
     */
    function clearAll() {
        setInputValue('');
        setOutputValue('');
    }

    /**
     * Получить опции из UI
     */
    function getOptionsFromUI() {
        return {
            removeComments: document.getElementById('removeComments')?.checked ?? true,
            removeWhitespace: document.getElementById('removeWhitespace')?.checked ?? true,
            minifyInlineJS: document.getElementById('minifyInlineJS')?.checked ?? true,
            minifyInlineCSS: document.getElementById('minifyInlineCSS')?.checked ?? true
        };
    }

    /**
     * Установить ошибку в поле
     */
    function setFieldError(fieldId, hasError) {
        const field = document.getElementById(fieldId);
        if (!field) return;
        
        if (hasError) {
            field.classList.add('border-red-500/50');
        } else {
            field.classList.remove('border-red-500/50');
        }
    }

    /**
     * Анимация shake
     */
    function shakeElement(elementId) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        element.classList.add('animate-shake');
        setTimeout(() => {
            element.classList.remove('animate-shake');
        }, 500);
    }

    // Публичный API
    return {
        init,
        getCurrentMode,
        getInputValue,
        setInputValue,
        getOutputValue,
        setOutputValue,
        hasInput,
        hasOutput,
        swapValues,
        clearAll,
        getOptionsFromUI,
        updateCharCount,
        setFieldError,
        shakeElement
    };
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = UI;
}