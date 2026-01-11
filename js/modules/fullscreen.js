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
    let isReadonly = false;
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
        modal.className = 'fixed inset-0 sm:inset-2 md:inset-4 lg:inset-8 bg-dark-400 sm:rounded-2xl md:rounded-3xl z-[9999] flex flex-col opacity-0 scale-95 transition-all duration-300 border-0 sm:border border-white/10';
        modal.innerHTML = `
            <!-- Header -->
            <div class="flex items-center justify-between px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 border-b border-white/10">
                <!-- Left side -->
                <div class="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <!-- Window dots - hidden on mobile -->
                    <div class="hidden sm:flex gap-1.5">
                        <div class="w-3 h-3 rounded-full bg-red-500/80 cursor-pointer hover:bg-red-500 transition-colors" id="fs-close-btn" title="Закрыть"></div>
                        <div class="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                        <div class="w-3 h-3 rounded-full bg-green-500/80"></div>
                    </div>
                    <div class="hidden sm:block w-px h-4 bg-white/10"></div>
                    <span id="fs-title" class="text-xs sm:text-sm font-medium text-gray-300 truncate">Редактор</span>
                    <span id="fs-mode" class="px-1.5 sm:px-2 py-0.5 bg-brand-500/10 text-brand-400 text-[10px] sm:text-xs rounded-full mono flex-shrink-0">HTML</span>
                </div>
                
                <!-- Right side -->
                <div class="flex items-center gap-1 sm:gap-2">
                    <!-- Copy button -->
                    <button id="fs-copy-btn" class="p-1.5 sm:p-2 hover:bg-white/5 rounded-lg transition-all text-gray-400 hover:text-white" title="Копировать">
                        <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                        </svg>
                    </button>
                    
                    <!-- Wrap button - hidden on small mobile -->
                    <button id="fs-wrap-btn" class="hidden xs:flex p-1.5 sm:p-2 hover:bg-white/5 rounded-lg transition-all text-gray-400 hover:text-white" title="Перенос строк">
                        <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"/>
                        </svg>
                    </button>
                    
                    <!-- Divider - hidden on mobile -->
                    <div class="hidden md:block w-px h-6 bg-white/10 mx-1 sm:mx-2"></div>
                    
                    <!-- Exit button -->
                    <button id="fs-exit-btn" class="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all text-xs sm:text-sm">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                        <span class="hidden sm:inline">Закрыть</span>
                        <kbd class="hidden lg:inline px-1.5 py-0.5 bg-white/10 rounded text-[10px]">ESC</kbd>
                    </button>
                </div>
            </div>

            <!-- Editor Area -->
            <div class="flex-1 flex overflow-hidden min-h-0">
                <!-- Line Numbers - narrower on mobile -->
                <div id="fs-line-numbers" class="w-8 sm:w-10 md:w-12 lg:w-16 bg-dark-500 text-right py-2 sm:py-3 md:py-4 pr-1.5 sm:pr-2 md:pr-3 text-gray-600 text-[10px] sm:text-xs md:text-sm mono overflow-hidden select-none border-r border-white/5 flex-shrink-0">
                    1
                </div>
                
                <!-- Textarea -->
                <div class="flex-1 relative overflow-hidden min-w-0">
                    <textarea id="fs-textarea" 
                              class="absolute inset-0 w-full h-full p-2 sm:p-3 md:p-4 bg-dark-500 text-gray-300 text-xs sm:text-sm mono resize-none focus:outline-none overflow-auto"
                              style="tab-size: 4; -moz-tab-size: 4; caret-color: #00ff88;"
                              spellcheck="false"
                              autocomplete="off"
                              autocorrect="off"
                              autocapitalize="off"></textarea>
                </div>
            </div>

            <!-- Footer -->
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-0 px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 border-t border-white/10 text-xs sm:text-sm">
                <!-- Stats -->
                <div class="flex items-center justify-center sm:justify-start gap-3 sm:gap-4 text-gray-500 order-2 sm:order-1">
                    <span class="flex items-center gap-1">
                        <span class="hidden xs:inline">Строк:</span>
                        <span class="xs:hidden">📝</span>
                        <span id="fs-lines" class="text-gray-300">0</span>
                    </span>
                    <span class="flex items-center gap-1">
                        <span class="hidden xs:inline">Символов:</span>
                        <span class="xs:hidden">✏️</span>
                        <span id="fs-chars" class="text-gray-300">0</span>
                    </span>
                    <span class="flex items-center gap-1">
                        <span class="hidden sm:inline">Размер:</span>
                        <span class="sm:hidden">📦</span>
                        <span id="fs-size" class="text-gray-300">0 B</span>
                    </span>
                </div>
                
                <!-- Action Buttons -->
                <div id="fs-actions" class="flex items-center gap-2 order-1 sm:order-2">
                    <button id="fs-cancel-btn" class="flex-1 sm:flex-none px-3 sm:px-4 py-2 hover:bg-white/5 rounded-lg transition-all text-gray-400 hover:text-white text-center">
                        Отмена
                    </button>
                    <button id="fs-save-btn" class="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-brand-500 hover:bg-brand-400 text-dark-500 rounded-lg transition-all font-medium text-center">
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
            // Tab только для редактируемого режима
            if (e.key === 'Tab' && !isReadonly) {
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

            // Ctrl+S для сохранения (только в режиме редактирования)
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleSaveOrClose();
            }
        });

        // Кнопки
        const closeBtn = modal.querySelector('#fs-close-btn');
        if (closeBtn) closeBtn.addEventListener('click', close);
        
        modal.querySelector('#fs-exit-btn').addEventListener('click', close);
        modal.querySelector('#fs-cancel-btn').addEventListener('click', close);
        modal.querySelector('#fs-save-btn').addEventListener('click', handleSaveOrClose);
        
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
                navigator.clipboard.writeText(text).then(() => {
                    if (typeof Notifications !== 'undefined') {
                        Notifications.success('Скопировано!');
                    }
                }).catch(() => {
                    const textArea = document.createElement('textarea');
                    textArea.value = text;
                    textArea.style.position = 'fixed';
                    textArea.style.opacity = '0';
                    document.body.appendChild(textArea);
                    textArea.select();
                    try {
                        document.execCommand('copy');
                        if (typeof Notifications !== 'undefined') {
                            Notifications.success('Скопировано!');
                        }
                    } catch (err) {
                        if (typeof Notifications !== 'undefined') {
                            Notifications.error('Ошибка копирования');
                        }
                    }
                    document.body.removeChild(textArea);
                });
            }
        });

        // Перенос строк
        let wrapEnabled = false;
        const wrapBtn = modal.querySelector('#fs-wrap-btn');
        if (wrapBtn) {
            wrapBtn.addEventListener('click', (e) => {
                wrapEnabled = !wrapEnabled;
                textarea.style.whiteSpace = wrapEnabled ? 'pre-wrap' : 'pre';
                textarea.style.wordWrap = wrapEnabled ? 'break-word' : 'normal';
                textarea.style.overflowWrap = wrapEnabled ? 'break-word' : 'normal';
                e.currentTarget.classList.toggle('text-brand-400', wrapEnabled);
                e.currentTarget.classList.toggle('bg-brand-500/10', wrapEnabled);
            });
        }

        // Touch: предотвращаем pull-to-refresh при свайпе в textarea
        textarea.addEventListener('touchmove', (e) => {
            if (textarea.scrollHeight > textarea.clientHeight) {
                e.stopPropagation();
            }
        }, { passive: true });
    }

    /**
     * Обработчик кнопки "Применить" / "Готово"
     * В readonly режиме просто закрывает окно
     */
    function handleSaveOrClose() {
        if (isReadonly) {
            // В readonly режиме просто закрываем без сохранения и уведомлений
            close();
        } else {
            // В режиме редактирования сохраняем и показываем уведомление
            save();
        }
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
        
        const isMobile = window.innerWidth < 640;
        const lineHeightClass = isMobile ? 'leading-5' : 'leading-6';
        
        lineNumbers.innerHTML = Array.from({ length: lineCount }, (_, i) => 
            `<div class="${lineHeightClass}">${i + 1}</div>`
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
            linesEl.textContent = code.split('\n').length.toLocaleString();
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
        isReadonly = readonly;  // Сохраняем состояние readonly
        currentEditor = options.editor || null;

        // Заполнить данные
        const titleEl = modal.querySelector('#fs-title');
        const modeEl = modal.querySelector('#fs-mode');
        const textarea = modal.querySelector('#fs-textarea');
        const saveBtn = modal.querySelector('#fs-save-btn');
        const cancelBtn = modal.querySelector('#fs-cancel-btn');

        if (titleEl) titleEl.textContent = title;
        if (modeEl) modeEl.textContent = mode.toUpperCase();
        
        if (textarea) {
            textarea.value = value;
            textarea.readOnly = readonly;
            
            if (readonly) {
                textarea.style.color = '#4ade80';
                textarea.style.cursor = 'default';
            } else {
                textarea.style.color = '#d1d5db';
                textarea.style.cursor = 'text';
            }
        }

        // Настройка кнопок для readonly режима
        if (saveBtn) {
            if (readonly) {
                saveBtn.textContent = 'Готово';
                // Можно изменить стиль кнопки для readonly
                saveBtn.className = 'flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all font-medium text-center';
            } else {
                saveBtn.textContent = 'Применить';
                saveBtn.className = 'flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-brand-500 hover:bg-brand-400 text-dark-500 rounded-lg transition-all font-medium text-center';
            }
        }

        // Скрываем кнопку "Отмена" в readonly режиме (опционально)
        if (cancelBtn) {
            if (readonly) {
                cancelBtn.style.display = 'none';
            } else {
                cancelBtn.style.display = '';
            }
        }

        // Обновить номера строк и статистику
        updateLineNumbers();
        updateStats();

        // Показать модальное окно
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.top = `-${window.scrollY}px`;
        
        backdrop.classList.remove('opacity-0');
        backdrop.classList.add('opacity-100');
        modal.classList.remove('opacity-0', 'scale-95');
        modal.classList.add('opacity-100', 'scale-100');

        isOpen = true;

        setTimeout(() => {
            if (textarea && !readonly) {
                textarea.focus();
            }
        }, 150);
    }

    /**
     * Закрыть
     */
    function close() {
        if (!modal) return;

        const scrollY = document.body.style.top;
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.top = '';
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
        
        backdrop.classList.remove('opacity-100');
        backdrop.classList.add('opacity-0');
        modal.classList.remove('opacity-100', 'scale-100');
        modal.classList.add('opacity-0', 'scale-95');

        isOpen = false;
        isReadonly = false;  // Сбрасываем флаг

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
     * Сохранить и закрыть (только для режима редактирования)
     */
    function save() {
        if (!modal || isReadonly) return;
        
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