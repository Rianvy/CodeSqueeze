/**
 * Fullscreen Module
 * Полноэкранный режим для редакторов
 */

const Fullscreen = (function() {
    'use strict';

    let modal = null;
    let backdrop = null;
    let currentEditor = null;
    let originalValue = '';
    let isOpen = false;
    let onSaveCallback = null;

    /**
     * Создать модальное окно
     */
    function createModal() {
        // Backdrop
        backdrop = document.createElement('div');
        backdrop.id = 'fullscreen-backdrop';
        backdrop.className = 'fixed inset-0 bg-black/90 backdrop-blur-sm z-[9998] opacity-0 transition-opacity duration-300';
        backdrop.addEventListener('click', close);

        // Modal
        modal = document.createElement('div');
        modal.id = 'fullscreen-modal';
        modal.className = 'fixed inset-4 md:inset-8 bg-dark-400 rounded-3xl z-[9999] flex flex-col opacity-0 scale-95 transition-all duration-300 border border-white/10';
        modal.innerHTML = `
            <!-- Header -->
            <div class="flex items-center justify-between px-6 py-4 border-b border-white/10">
                <div class="flex items-center gap-3">
                    <div class="flex gap-1.5">
                        <div class="w-3 h-3 rounded-full bg-red-500/80 cursor-pointer hover:bg-red-500" id="fs-close-btn"></div>
                        <div class="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                        <div class="w-3 h-3 rounded-full bg-green-500/80"></div>
                    </div>
                    <div class="w-px h-4 bg-white/10"></div>
                    <span id="fs-title" class="text-sm font-medium text-gray-300">Редактор</span>
                    <span id="fs-mode" class="px-2 py-0.5 bg-brand-500/10 text-brand-400 text-xs rounded-full mono">HTML</span>
                </div>
                <div class="flex items-center gap-2">
                    <button id="fs-copy-btn" class="p-2 hover:bg-white/5 rounded-lg transition-all text-gray-400 hover:text-white" title="Копировать">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                        </svg>
                    </button>
                    <button id="fs-wrap-btn" class="p-2 hover:bg-white/5 rounded-lg transition-all text-gray-400 hover:text-white" title="Перенос строк">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"/>
                        </svg>
                    </button>
                    <div class="w-px h-6 bg-white/10 mx-2"></div>
                    <button id="fs-exit-btn" class="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all text-sm">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                        <span class="hidden sm:inline">Закрыть</span>
                        <kbd class="hidden sm:inline px-1.5 py-0.5 bg-white/10 rounded text-xs">ESC</kbd>
                    </button>
                </div>
            </div>

            <!-- Editor Area -->
            <div class="flex-1 flex overflow-hidden">
                <!-- Line Numbers -->
                <div id="fs-line-numbers" class="w-12 md:w-16 bg-dark-500 text-right py-4 pr-3 text-gray-600 text-sm mono overflow-hidden select-none border-r border-white/5">
                    1
                </div>
                
                <!-- Textarea -->
                <div class="flex-1 relative overflow-hidden">
                    <textarea id="fs-textarea" 
                              class="absolute inset-0 w-full h-full p-4 bg-dark-500 text-gray-300 text-sm mono resize-none focus:outline-none overflow-auto"
                              style="tab-size: 4; caret-color: #00ff88;"
                              spellcheck="false"></textarea>
                </div>
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-between px-6 py-3 border-t border-white/10 text-sm">
                <div class="flex items-center gap-4 text-gray-500">
                    <span>Строк: <span id="fs-lines" class="text-gray-300">0</span></span>
                    <span>Символов: <span id="fs-chars" class="text-gray-300">0</span></span>
                    <span>Размер: <span id="fs-size" class="text-gray-300">0 B</span></span>
                </div>
                <div class="flex items-center gap-2">
                    <button id="fs-cancel-btn" class="px-4 py-2 hover:bg-white/5 rounded-lg transition-all text-gray-400 hover:text-white">
                        Отмена
                    </button>
                    <button id="fs-save-btn" class="px-4 py-2 bg-brand-500 hover:bg-brand-400 text-dark-500 rounded-lg transition-all font-medium">
                        Применить
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(backdrop);
        document.body.appendChild(modal);

        // Event listeners
        setupEventListeners();
    }

    /**
     * Настройка обработчиков событий
     */
    function setupEventListeners() {
        const textarea = modal.querySelector('#fs-textarea');
        const lineNumbers = modal.querySelector('#fs-line-numbers');

        // Синхронизация скролла номеров строк
        textarea.addEventListener('scroll', () => {
            lineNumbers.scrollTop = textarea.scrollTop;
        });

        // Обновление при вводе
        textarea.addEventListener('input', () => {
            updateLineNumbers();
            updateStats();
        });

        // Tab в textarea
        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                textarea.value = textarea.value.substring(0, start) + '    ' + textarea.value.substring(end);
                textarea.selectionStart = textarea.selectionEnd = start + 4;
                updateLineNumbers();
                updateStats();
            }
            
            // ESC для закрытия
            if (e.key === 'Escape') {
                close();
            }

            // Ctrl+S для сохранения
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                save();
            }
        });

        // Кнопки
        modal.querySelector('#fs-close-btn').addEventListener('click', close);
        modal.querySelector('#fs-exit-btn').addEventListener('click', close);
        modal.querySelector('#fs-cancel-btn').addEventListener('click', close);
        modal.querySelector('#fs-save-btn').addEventListener('click', save);
        
        // Копирование
        modal.querySelector('#fs-copy-btn').addEventListener('click', () => {
            const text = textarea.value;
            
            if (!text || text.trim().length === 0) {
                if (typeof Notifications !== 'undefined') {
                    Notifications.warning('Нечего копировать');
                }
                return;
            }
            
            if (typeof Utils !== 'undefined' && Utils.copyToClipboard) {
                Utils.copyToClipboard(text).then(result => {
                    if (result.success && typeof Notifications !== 'undefined') {
                        Notifications.success('Скопировано!');
                    }
                });
            } else {
                // Fallback
                navigator.clipboard.writeText(text).then(() => {
                    if (typeof Notifications !== 'undefined') {
                        Notifications.success('Скопировано!');
                    }
                });
            }
        });

        // Перенос строк
        let wrapEnabled = false;
        modal.querySelector('#fs-wrap-btn').addEventListener('click', (e) => {
            wrapEnabled = !wrapEnabled;
            textarea.style.whiteSpace = wrapEnabled ? 'pre-wrap' : 'pre';
            textarea.style.wordWrap = wrapEnabled ? 'break-word' : 'normal';
            e.currentTarget.classList.toggle('text-brand-400', wrapEnabled);
            e.currentTarget.classList.toggle('bg-brand-500/10', wrapEnabled);
        });
    }

    /**
     * Обновить номера строк
     */
    function updateLineNumbers() {
        const textarea = modal.querySelector('#fs-textarea');
        const lineNumbers = modal.querySelector('#fs-line-numbers');
        const code = textarea.value;
        
        const lines = code.split('\n');
        const lineCount = lines.length;
        
        lineNumbers.innerHTML = Array.from({ length: lineCount }, (_, i) => 
            `<div class="leading-6">${i + 1}</div>`
        ).join('');
    }

    /**
     * Обновить статистику
     */
    function updateStats() {
        const textarea = modal.querySelector('#fs-textarea');
        const code = textarea.value || '';

        const linesEl = modal.querySelector('#fs-lines');
        const charsEl = modal.querySelector('#fs-chars');
        const sizeEl = modal.querySelector('#fs-size');

        if (linesEl) {
            linesEl.textContent = code.split('\n').length;
        }
        
        if (charsEl) {
            charsEl.textContent = code.length.toLocaleString();
        }
        
        if (sizeEl) {
            const bytes = new Blob([code]).size;
            sizeEl.textContent = formatFileSize(bytes);
        }
    }

    /**
     * Форматирование размера файла
     */
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    /**
     * Открыть полноэкранный редактор
     */
    function open(options = {}) {
        const {
            value = '',
            title = 'Редактор',
            mode = 'html',
            readonly = false,
            onSave = null
        } = options;

        if (!modal) {
            createModal();
        }

        originalValue = value;
        onSaveCallback = onSave;
        currentEditor = options.editor || null;

        // Заполнить данные
        const titleEl = modal.querySelector('#fs-title');
        const modeEl = modal.querySelector('#fs-mode');
        const textarea = modal.querySelector('#fs-textarea');

        if (titleEl) titleEl.textContent = title;
        if (modeEl) modeEl.textContent = mode.toUpperCase();
        
        if (textarea) {
            textarea.value = value;
            textarea.readOnly = readonly;
            
            // Установить цвет текста для readonly
            if (readonly) {
                textarea.style.color = '#4ade80'; // Зелёный для результата
            } else {
                textarea.style.color = '#d1d5db'; // Серый для ввода
            }
        }

        // Обновить номера строк и статистику
        updateLineNumbers();
        updateStats();

        // Показать модальное окно
        document.body.style.overflow = 'hidden';
        backdrop.classList.remove('opacity-0');
        backdrop.classList.add('opacity-100');
        modal.classList.remove('opacity-0', 'scale-95');
        modal.classList.add('opacity-100', 'scale-100');

        isOpen = true;

        // Фокус на textarea
        setTimeout(() => {
            if (textarea) textarea.focus();
        }, 100);
    }

    /**
     * Закрыть
     */
    function close() {
        if (!modal) return;

        document.body.style.overflow = '';
        backdrop.classList.remove('opacity-100');
        backdrop.classList.add('opacity-0');
        modal.classList.remove('opacity-100', 'scale-100');
        modal.classList.add('opacity-0', 'scale-95');

        isOpen = false;

        // Удалить после анимации
        setTimeout(() => {
            if (backdrop) {
                backdrop.remove();
                backdrop = null;
            }
            if (modal) {
                modal.remove();
                modal = null;
            }
        }, 300);
    }

    /**
     * Сохранить и закрыть
     */
    function save() {
        if (!modal) return;
        
        const textarea = modal.querySelector('#fs-textarea');
        const value = textarea ? textarea.value : '';

        if (onSaveCallback && typeof onSaveCallback === 'function') {
            onSaveCallback(value);
        }

        close();
        
        if (typeof Notifications !== 'undefined') {
            Notifications.success('Изменения применены!');
        }
    }

    /**
     * Проверить, открыт ли полноэкранный режим
     */
    function isFullscreenOpen() {
        return isOpen;
    }

    // Публичный API
    return {
        open,
        close,
        save,
        isOpen: isFullscreenOpen
    };
})();

// Экспорт
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Fullscreen;
}