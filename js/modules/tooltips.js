/**
 * Tooltip Module
 * Глобальные tooltips
 */
const Tooltip = (function() {
    'use strict';

    let tooltipEl = null;
    let currentWrapper = null;
    let showTimeout = null;
    let hideTimeout = null;
    let isVisible = false;

    // Настройки
    const SHOW_DELAY = 50;  // Задержка перед показом (мс)
    const HIDE_DELAY = 50;  // Задержка перед скрытием (мс)

    /**
     * Инициализация
     */
    function init() {
        // Создаём глобальный tooltip элемент
        if (!tooltipEl) {
            tooltipEl = document.createElement('div');
            tooltipEl.className = 'global-tooltip';
            tooltipEl.setAttribute('role', 'tooltip');
            tooltipEl.setAttribute('aria-hidden', 'true');
            document.body.appendChild(tooltipEl);
        }

        // Делегирование событий
        document.addEventListener('mouseover', handleMouseOver, true);
        document.addEventListener('mouseout', handleMouseOut, true);
        document.addEventListener('scroll', hideImmediately, true);
        window.addEventListener('resize', hideImmediately);
        
        // Скрываем при клике
        document.addEventListener('mousedown', hideImmediately, true);
    }

    /**
     * Получить текст tooltip
     */
    function getTooltipText(wrapper) {
        // Проверяем .tooltip-text
        const textEl = wrapper.querySelector('.tooltip-text');
        if (textEl) {
            return textEl.textContent.trim();
        }

        // Проверяем data-tooltip
        if (wrapper.hasAttribute('data-tooltip')) {
            return wrapper.getAttribute('data-tooltip');
        }

        // Проверяем title на кнопке внутри
        const button = wrapper.querySelector('button[title], a[title]');
        if (button) {
            return button.getAttribute('title');
        }

        return null;
    }

    /**
     * Убрать нативный title (чтобы не было двойного tooltip)
     */
    function suppressNativeTitle(wrapper) {
        const elements = wrapper.querySelectorAll('[title]');
        elements.forEach(el => {
            if (el.getAttribute('title') && !el.hasAttribute('data-original-title')) {
                el.setAttribute('data-original-title', el.getAttribute('title'));
                el.removeAttribute('title');
            }
        });
    }

    /**
     * Восстановить нативный title
     */
    function restoreNativeTitle(wrapper) {
        const elements = wrapper.querySelectorAll('[data-original-title]');
        elements.forEach(el => {
            el.setAttribute('title', el.getAttribute('data-original-title'));
            el.removeAttribute('data-original-title');
        });
    }

    /**
     * Обработка mouseover (делегирование)
     */
    function handleMouseOver(e) {
        const wrapper = e.target.closest('.tooltip-wrapper');
        
        // Если мы уже на этом wrapper - ничего не делаем
        if (wrapper && wrapper === currentWrapper) {
            // Отменяем скрытие если было запланировано
            clearTimeout(hideTimeout);
            return;
        }

        // Если перешли на новый wrapper
        if (wrapper) {
            // Отменяем предыдущие таймеры
            clearTimeout(showTimeout);
            clearTimeout(hideTimeout);

            const text = getTooltipText(wrapper);
            if (!text) return;

            // Убираем нативный title
            suppressNativeTitle(wrapper);

            // Запоминаем текущий wrapper
            currentWrapper = wrapper;

            // Показываем с задержкой
            showTimeout = setTimeout(() => {
                show(wrapper, text);
            }, SHOW_DELAY);
        }
    }

    /**
     * Обработка mouseout (делегирование)
     */
    function handleMouseOut(e) {
        const wrapper = e.target.closest('.tooltip-wrapper');
        
        if (!wrapper) return;

        // Проверяем, куда уходит мышь
        const relatedTarget = e.relatedTarget;
        
        // Если мышь уходит на другой элемент внутри этого же wrapper - игнорируем
        if (relatedTarget && wrapper.contains(relatedTarget)) {
            return;
        }

        // Мышь ушла с wrapper
        clearTimeout(showTimeout);
        
        // Восстанавливаем title
        restoreNativeTitle(wrapper);
        
        // Скрываем с небольшой задержкой
        hideTimeout = setTimeout(() => {
            if (currentWrapper === wrapper) {
                hide();
            }
        }, HIDE_DELAY);
    }

    /**
     * Показать tooltip
     */
    function show(target, text) {
        if (!tooltipEl || !target || !text) return;

        tooltipEl.textContent = text;
        tooltipEl.classList.remove('top', 'bottom', 'left', 'right');

        // Получаем размеры
        const rect = target.getBoundingClientRect();
        
        // Показываем tooltip для измерения (невидимо)
        tooltipEl.style.visibility = 'hidden';
        tooltipEl.style.display = 'block';
        
        const tooltipWidth = tooltipEl.offsetWidth;
        const tooltipHeight = tooltipEl.offsetHeight;
        
        // Вычисляем позицию
        const gap = 8;
        let top, left;
        let position = 'top';

        // Пробуем разместить сверху
        top = rect.top - tooltipHeight - gap;
        left = rect.left + (rect.width / 2) - (tooltipWidth / 2);

        // Если не помещается сверху - показываем снизу
        if (top < 10) {
            top = rect.bottom + gap;
            position = 'bottom';
        }

        // Проверяем горизонтальные границы
        const minLeft = 10;
        const maxLeft = window.innerWidth - tooltipWidth - 10;
        left = Math.max(minLeft, Math.min(left, maxLeft));

        // Применяем позицию
        tooltipEl.style.top = `${top}px`;
        tooltipEl.style.left = `${left}px`;
        tooltipEl.style.visibility = '';
        tooltipEl.classList.add(position);
        tooltipEl.classList.add('visible');
        tooltipEl.setAttribute('aria-hidden', 'false');
        
        isVisible = true;
    }

    /**
     * Скрыть tooltip
     */
    function hide() {
        if (!tooltipEl) return;

        tooltipEl.classList.remove('visible');
        tooltipEl.setAttribute('aria-hidden', 'true');
        currentWrapper = null;
        isVisible = false;
    }

    /**
     * Скрыть немедленно (без задержки)
     */
    function hideImmediately() {
        clearTimeout(showTimeout);
        clearTimeout(hideTimeout);
        
        if (currentWrapper) {
            restoreNativeTitle(currentWrapper);
        }
        
        hide();
    }

    /**
     * Уничтожить модуль
     */
    function destroy() {
        hideImmediately();
        
        if (tooltipEl) {
            tooltipEl.remove();
            tooltipEl = null;
        }
        
        document.removeEventListener('mouseover', handleMouseOver, true);
        document.removeEventListener('mouseout', handleMouseOut, true);
        document.removeEventListener('scroll', hideImmediately, true);
        document.removeEventListener('mousedown', hideImmediately, true);
        window.removeEventListener('resize', hideImmediately);
    }

    /**
     * Проверить, виден ли tooltip
     */
    function isTooltipVisible() {
        return isVisible;
    }

    // Публичный API
    return {
        init,
        show,
        hide,
        hideImmediately,
        destroy,
        isVisible: isTooltipVisible
    };
})();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Tooltip.init());
} else {
    Tooltip.init();
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Tooltip;
}