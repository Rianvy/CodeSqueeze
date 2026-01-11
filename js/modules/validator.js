/**
 * Validator Module
 * Валидация данных
 */

const Validator = (function() {
    'use strict';

    /**
     * Результат валидации
     * @typedef {Object} ValidationResult
     * @property {boolean} valid - Валидны ли данные
     * @property {string|null} error - Код ошибки
     * @property {string|null} message - Сообщение об ошибке
     */

    /**
     * Сообщения об ошибках
     */
    const errorMessages = {
        empty_input: 'Введите код для обработки',
        empty_output: 'Сначала выполните минификацию',
        whitespace_only: 'Код содержит только пробелы',
        clipboard_empty: 'Буфер обмена пуст',
        clipboard_error: 'Не удалось получить доступ к буферу обмена',
        copy_error: 'Не удалось скопировать',
        download_error: 'Не удалось скачать файл',
        invalid_code: 'Неверный формат кода',
        too_large: 'Файл слишком большой',
        unknown: 'Произошла ошибка'
    };

    /**
     * Получить сообщение об ошибке
     * @param {string} errorCode - Код ошибки
     * @returns {string} Сообщение
     */
    function getMessage(errorCode) {
        return errorMessages[errorCode] || errorMessages.unknown;
    }

    /**
     * Валидация поля ввода
     * @param {string} value - Значение
     * @returns {ValidationResult}
     */
    function validateInput(value) {
        if (!value || value.length === 0) {
            return {
                valid: false,
                error: 'empty_input',
                message: getMessage('empty_input')
            };
        }

        if (value.trim().length === 0) {
            return {
                valid: false,
                error: 'whitespace_only',
                message: getMessage('whitespace_only')
            };
        }

        return { valid: true, error: null, message: null };
    }

    /**
     * Валидация поля вывода
     * @param {string} value - Значение
     * @returns {ValidationResult}
     */
    function validateOutput(value) {
        if (!value || value.length === 0) {
            return {
                valid: false,
                error: 'empty_output',
                message: getMessage('empty_output')
            };
        }

        if (value.trim().length === 0) {
            return {
                valid: false,
                error: 'whitespace_only',
                message: getMessage('whitespace_only')
            };
        }

        return { valid: true, error: null, message: null };
    }

    /**
     * Валидация для копирования
     * @param {string} value - Значение
     * @returns {ValidationResult}
     */
    function validateForCopy(value) {
        return validateOutput(value);
    }

    /**
     * Валидация для минификации
     * @param {string} value - Значение
     * @returns {ValidationResult}
     */
    function validateForMinify(value) {
        return validateInput(value);
    }

    /**
     * Валидация для форматирования
     * @param {string} value - Значение
     * @returns {ValidationResult}
     */
    function validateForBeautify(value) {
        return validateInput(value);
    }

    /**
     * Валидация размера файла
     * @param {string} value - Значение
     * @param {number} maxSizeBytes - Максимальный размер в байтах
     * @returns {ValidationResult}
     */
    function validateSize(value, maxSizeBytes = 5 * 1024 * 1024) { // 5MB default
        if (!value) {
            return { valid: true, error: null, message: null };
        }

        const size = new Blob([value]).size;
        if (size > maxSizeBytes) {
            return {
                valid: false,
                error: 'too_large',
                message: `Файл слишком большой (${Utils.formatFileSize(size)}). Максимум: ${Utils.formatFileSize(maxSizeBytes)}`
            };
        }

        return { valid: true, error: null, message: null };
    }

    /**
     * Комбинированная валидация
     * @param {string} value - Значение
     * @param {Array<Function>} validators - Массив функций валидации
     * @returns {ValidationResult}
     */
    function validate(value, validators) {
        for (const validator of validators) {
            const result = validator(value);
            if (!result.valid) {
                return result;
            }
        }
        return { valid: true, error: null, message: null };
    }

    // Публичный API
    return {
        getMessage,
        validateInput,
        validateOutput,
        validateForCopy,
        validateForMinify,
        validateForBeautify,
        validateSize,
        validate
    };
})();

// Экспорт
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Validator;
}