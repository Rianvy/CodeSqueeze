/**
 * CodeSqueeze App
 * Главный модуль приложения
 * @version 2.0.0
 */

(function() {
    'use strict';

    // DOM элементы
    const elements = {
        inputCode: document.getElementById('inputCode'),
        outputCode: document.getElementById('outputCode'),
        inputChars: document.getElementById('inputChars'),
        outputChars: document.getElementById('outputChars'),
        originalSize: document.getElementById('originalSize'),
        minifiedSize: document.getElementById('minifiedSize'),
        savings: document.getElementById('savings'),
        savedBytes: document.getElementById('savedBytes'),
        compressionPercent: document.getElementById('compressionPercent'),
        compressionBar: document.getElementById('compressionBar'),
        progressCircle: document.getElementById('progressCircle'),
        notification: document.getElementById('notification'),
        notificationText: document.getElementById('notificationText'),
        processingTime: document.getElementById('processingTime') // новый элемент
    };

    // Кнопки
    const buttons = {
        minify: document.getElementById('btnMinify'),
        beautify: document.getElementById('btnBeautify'),
        swap: document.getElementById('btnSwap'),
        clear: document.getElementById('btnClear'),
        paste: document.getElementById('btnPaste'),
        copy: document.getElementById('btnCopy'),
        sample: document.getElementById('btnSample')
    };

    /**
     * Инициализация приложения
     */
    function init() {
        if (!elements.inputCode || !elements.outputCode) {
            console.error('Required elements not found');
            return;
        }

        // Инициализация модулей
        UI.init(elements);
        Stats.init(elements);
        Notifications.init(
            elements.notification, 
            elements.notificationText, 
            CONFIG.ui.notificationDuration
        );

        // Загрузка сохранённых настроек
        loadSavedOptions();

        // Привязка событий
        bindEvents();

        // Инициализация первой вкладки
        initFirstTab();

        // Вывод информации о версии минификатора
        console.log(`CodeSqueeze v${CONFIG.version} initialized`);
        console.log(`Minifier version: ${Minifier.version || '2.0.0'}`);
        
        // Показ возможностей нового минификатора
        if (Minifier.version) {
            console.log('✅ Новые возможности активированы:');
            console.log('  - Улучшенная обработка regex и template literals');
            console.log('  - Оптимизация CSS (цвета, единицы)');
            console.log('  - Валидация кода');
            console.log('  - Статистика производительности');
        }
    }

    /**
     * Загрузка сохранённых настроек
     */
    function loadSavedOptions() {
        const savedOptions = Storage.loadOptions();
        
        Object.keys(savedOptions).forEach(key => {
            const checkbox = document.getElementById(key);
            if (checkbox) {
                checkbox.checked = savedOptions[key];
            }
        });

        Minifier.setOptions(savedOptions);
    }

    /**
     * Инициализация первой вкладки
     */
    function initFirstTab() {
        const firstTab = document.querySelector('.tab-btn.active');
        if (firstTab) {
            firstTab.classList.add('bg-brand-500', 'text-dark-500');
            firstTab.classList.remove('text-gray-400');
        }
    }

    /**
     * Привязка событий к кнопкам
     */
    function bindEvents() {
        if (buttons.minify) {
            buttons.minify.addEventListener('click', handleMinify);
        }

        if (buttons.beautify) {
            buttons.beautify.addEventListener('click', handleBeautify);
        }

        if (buttons.swap) {
            buttons.swap.addEventListener('click', handleSwap);
        }

        if (buttons.clear) {
            buttons.clear.addEventListener('click', handleClear);
        }

        if (buttons.paste) {
            buttons.paste.addEventListener('click', handlePaste);
        }

        if (buttons.copy) {
            buttons.copy.addEventListener('click', handleCopy);
        }

        if (buttons.sample) {
            buttons.sample.addEventListener('click', handleSample);
        }

        // Сохранение настроек при изменении
        document.querySelectorAll('#removeComments, #removeWhitespace, #minifyInlineJS, #minifyInlineCSS')
            .forEach(checkbox => {
                if (checkbox) {
                    checkbox.addEventListener('change', handleOptionsChange);
                }
            });

        // Клавиатурные сочетания
        document.addEventListener('keydown', handleKeyboardShortcuts);
    }

    /**
     * Обработчик клавиатурных сочетаний
     */
    function handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + Enter - минификация
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            handleMinify();
        }
        
        // Ctrl/Cmd + Shift + F - форматирование
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
            e.preventDefault();
            handleBeautify();
        }
        
        // Ctrl/Cmd + Shift + C - копирование результата
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
            e.preventDefault();
            handleCopy();
        }
        
        // Ctrl/Cmd + Shift + V - вставка
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'V') {
            e.preventDefault();
            handlePaste();
        }
    }

    /**
     * Обработчик минификации
     */
    function handleMinify() {
        const input = UI.getInputValue();
        
        // Базовая валидация UI
        const uiValidation = Validator.validateForMinify(input);
        if (!uiValidation.valid) {
            Notifications.warning(uiValidation.message);
            UI.shakeElement('inputCode');
            return;
        }

        const mode = UI.getCurrentMode();
        Minifier.setOptions(UI.getOptionsFromUI());
        
        try {
            // Валидация через минификатор
            if (typeof Minifier.validate === 'function') {
                const codeValidation = Minifier.validate(input, mode);
                
                if (!codeValidation.valid && codeValidation.errors.length > 0) {
                    console.warn('⚠️ Предупреждения валидации:', codeValidation.errors);
                    Notifications.info(`⚠️ ${codeValidation.errors[0]}`);
                }
            }
            
            // Минификация
            const output = Minifier.minify(input, mode);
            UI.setOutputValue(output);
            
            // Получение расширенной статистики
            let stats;
            if (typeof Minifier.getStats === 'function') {
                const minifierStats = Minifier.getStats();
                stats = {
                    originalSize: minifierStats.originalSize,
                    minifiedSize: minifierStats.minifiedSize,
                    savedBytes: minifierStats.savedBytes,
                    savingsPercent: minifierStats.savedPercent,
                    processingTime: minifierStats.processingTime
                };
            } else {
                // Fallback для старого минификатора
                stats = Stats.calculate(input, output);
            }
            
            // Обновление UI
            updateStatsUI(stats);
            
            // Уведомления
            if (output.length >= input.length) {
                Notifications.info('Код уже оптимизирован');
            } else {
                const timeInfo = stats.processingTime 
                    ? ` (${stats.processingTime}мс)` 
                    : '';
                Notifications.success(`Сжато на ${stats.savingsPercent}%!${timeInfo}`);
            }
            
            // Логирование статистики в консоль
            console.log('📊 Статистика минификации:', stats);
            
        } catch (err) {
            console.error('Minification error:', err);
            Notifications.error(`Ошибка минификации: ${err.message || 'Неизвестная ошибка'}`);
        }
    }

    /**
     * Обновление UI статистики
     */
    function updateStatsUI(stats) {
        // Обновление основных показателей
        if (elements.originalSize) {
            animateValue(elements.originalSize, 0, stats.originalSize, 600);
        }
        
        if (elements.minifiedSize) {
            animateValue(elements.minifiedSize, 0, stats.minifiedSize, 600);
        }
        
        if (elements.savedBytes) {
            animateValue(elements.savedBytes, 0, stats.savedBytes, 600);
        }
        
        if (elements.savings) {
            elements.savings.textContent = stats.savingsPercent + '%';
        }
        
        // Обновление compression bar
        if (elements.compressionBar && elements.compressionPercent) {
            const percent = parseFloat(stats.savingsPercent) || 0;
            elements.compressionBar.style.width = percent + '%';
            elements.compressionPercent.textContent = percent + '%';
        }
        
        // Обновление progress circle
        if (elements.progressCircle) {
            const percent = parseFloat(stats.savingsPercent) || 0;
            const circumference = 100;
            elements.progressCircle.style.strokeDasharray = `${percent}, ${circumference}`;
        }
        
        // Обновление времени обработки
        if (elements.processingTime && stats.processingTime !== undefined) {
            elements.processingTime.textContent = `${stats.processingTime} мс`;
            elements.processingTime.classList.add('text-brand-400');
        }
    }

    /**
     * Анимация чисел
     */
    function animateValue(element, start, end, duration) {
        if (!element) return;
        
        const range = end - start;
        const increment = range / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
                element.textContent = formatNumber(Math.round(end));
                clearInterval(timer);
            } else {
                element.textContent = formatNumber(Math.round(current));
            }
        }, 16);
    }

    /**
     * Форматирование чисел
     */
    function formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    /**
     * Обработчик форматирования
     */
    function handleBeautify() {
        // Получаем значения напрямую
        const outputEl = document.getElementById('outputCode');
        const inputEl = document.getElementById('inputCode');
        
        const outputValue = outputEl?.value?.trim() || '';
        const inputValue = inputEl?.value?.trim() || '';
        
        // Приоритет: результат минификации > исходный код
        const codeToBeautify = outputValue || inputValue;
        
        if (!codeToBeautify) {
            Notifications.warning('Введите код для форматирования');
            UI.shakeElement('inputCode');
            return;
        }

        const mode = UI.getCurrentMode();
        
        try {
            const output = Beautifier.beautify(codeToBeautify, mode);
            UI.setOutputValue(output);
            
            Notifications.success(outputValue ? 'Результат отформатирован!' : 'Код отформатирован!');
            
        } catch (err) {
            console.error('Beautify error:', err);
            Notifications.error('Ошибка форматирования');
        }
    }

    /**
     * Обработчик смены местами
     */
    function handleSwap() {
        if (!UI.hasInput() && !UI.hasOutput()) {
            Notifications.warning('Нет данных для обмена');
            return;
        }

        const success = UI.swapValues();
        if (success) {
            Notifications.success('Код поменян местами!');
            
            // НОВОЕ: Пересчёт статистики после swap
            const input = UI.getInputValue();
            const output = UI.getOutputValue();
            if (input && output) {
                const stats = Stats.calculate(input, output);
                updateStatsUI(stats);
            }
        }
    }

    /**
     * Обработчик очистки
     */
    function handleClear() {
        if (!UI.hasInput() && !UI.hasOutput()) {
            Notifications.info('Поля уже пусты');
            return;
        }

        UI.clearAll();
        Stats.reset();
        
        // НОВОЕ: Сброс статистики минификатора
        if (typeof Minifier.resetStats === 'function') {
            Minifier.resetStats();
        }
        
        // Очистка времени обработки
        if (elements.processingTime) {
            elements.processingTime.textContent = '0 мс';
        }
        
        Notifications.success('Очищено!');
    }

    /**
     * Обработчик вставки
     */
    async function handlePaste() {
        try {
            const result = await Utils.readFromClipboard();
            
            if (!result.success) {
                if (result.error === 'empty') {
                    Notifications.warning('Буфер обмена пуст');
                } else {
                    Notifications.error('Нет доступа к буферу обмена');
                }
                return;
            }
            
            UI.setInputValue(result.text);
            Notifications.success('Код вставлен!');
        } catch (err) {
            console.error('Paste error:', err);
            Notifications.error('Ошибка вставки');
        }
    }

    /**
     * Обработчик копирования
     */
    async function handleCopy() {
        const output = UI.getOutputValue();
        
        const validation = Validator.validateForCopy(output);
        if (!validation.valid) {
            Notifications.warning(validation.message);
            UI.shakeElement('outputCode');
            return;
        }

        try {
            const result = await Utils.copyToClipboard(output);
            
            if (result.success) {
                Notifications.success('Скопировано в буфер!');
            } else {
                Notifications.error('Не удалось скопировать');
            }
        } catch (err) {
            console.error('Copy error:', err);
            Notifications.error('Ошибка копирования');
        }
    }

    /**
     * Обработчик загрузки примера
     */
    function handleSample() {
        const mode = UI.getCurrentMode();
        const sample = CONFIG.samples[mode] || CONFIG.samples.html;
        
        if (!sample) {
            Notifications.error('Пример не найден');
            return;
        }
        
        UI.setInputValue(sample);
        Notifications.success('Пример загружен!');
    }

    /**
     * Обработчик изменения настроек
     */
    function handleOptionsChange() {
        const options = UI.getOptionsFromUI();
        Minifier.setOptions(options);
        Storage.saveOptions(options);
        
        // Показ информации о текущих настройках
        console.log('⚙️ Настройки обновлены:', Minifier.getOptions());
    }

    /**
     * Экспорт функций для глобального доступа (для тестирования)
     */
    window.CodeSqueeze = {
        version: CONFIG.version,
        minifier: Minifier,
        getStats: function() {
            return Minifier.getStats ? Minifier.getStats() : null;
        },
        resetStats: function() {
            if (Minifier.resetStats) {
                Minifier.resetStats();
                Stats.reset();
                if (elements.processingTime) {
                    elements.processingTime.textContent = '0 мс';
                }
            }
        },
        validate: function(code, type) {
            return Minifier.validate ? Minifier.validate(code, type) : { valid: true, errors: [] };
        },
        getCurrentOptions: function() {
            return Minifier.getOptions();
        }
    };

    // Запуск при загрузке DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();