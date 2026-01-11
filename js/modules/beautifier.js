/**
 * Beautifier Module
 * Логика форматирования кода
 */

const Beautifier = (function() {
    'use strict';

    /**
     * Форматирование JavaScript
     * @param {string} code - Минифицированный JS код
     * @returns {string} Отформатированный код
     */
    function beautifyJS(code) {
        let result = '';
        let indent = 0;
        let inString = false;
        let stringChar = '';
        
        for (let i = 0; i < code.length; i++) {
            const char = code[i];
            
            // Обработка строк
            if ((char === '"' || char === "'" || char === '`') && !inString) {
                inString = true;
                stringChar = char;
                result += char;
                continue;
            }
            
            if (inString) {
                result += char;
                if (char === '\\' && i + 1 < code.length) {
                    result += code[++i];
                    continue;
                }
                if (char === stringChar) {
                    inString = false;
                }
                continue;
            }
            
            // Форматирование структуры
            if (char === '{') {
                result += ' {\n' + '  '.repeat(++indent);
            } else if (char === '}') {
                result += '\n' + '  '.repeat(--indent) + '}';
            } else if (char === ';') {
                result += ';\n' + '  '.repeat(indent);
            } else if (char === ',') {
                result += ',\n' + '  '.repeat(indent);
            } else {
                result += char;
            }
        }
        
        return result.trim();
    }

    /**
     * Форматирование HTML
     * @param {string} html - Минифицированный HTML код
     * @returns {string} Отформатированный код
     */
    function beautifyHTML(html) {
        let result = '';
        let indent = 0;
        const lines = html.replace(/></g, '>\n<').split('\n');
        const voidTags = [
            'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 
            'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'
        ];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            // Закрывающий тег
            if (/^<\/\w/.test(line)) {
                indent = Math.max(0, indent - 1);
            }
            
            result += '  '.repeat(indent) + line + '\n';
            
            // Открывающий тег
            const tagMatch = line.match(/^<(\w+)/);
            if (tagMatch) {
                const tagName = tagMatch[1].toLowerCase();
                const isSelfClosing = /\/>$/.test(line) || /<\/\w+>$/.test(line);
                const isVoid = voidTags.includes(tagName);
                
                if (!isSelfClosing && !isVoid && !/^<\//.test(line)) {
                    indent++;
                }
            }
        }
        
        return result.trim();
    }

    /**
     * Форматирование CSS
     * @param {string} css - Минифицированный CSS код
     * @returns {string} Отформатированный код
     */
    function beautifyCSS(css) {
        let result = '';
        let indent = 0;
        
        for (let i = 0; i < css.length; i++) {
            const char = css[i];
            
            if (char === '{') {
                result += ' {\n' + '  '.repeat(++indent);
            } else if (char === '}') {
                result += '\n' + '  '.repeat(--indent) + '}\n';
            } else if (char === ';') {
                result += ';\n' + '  '.repeat(indent);
            } else {
                result += char;
            }
        }
        
        return result.trim();
    }

    /**
     * Форматировать код
     * @param {string} code - Минифицированный код
     * @param {string} type - Тип кода ('html', 'js', 'css')
     * @returns {string} Отформатированный код
     */
    function beautify(code, type = 'html') {
        switch (type.toLowerCase()) {
            case 'js':
            case 'javascript':
                return beautifyJS(code);
            case 'css':
                return beautifyCSS(code);
            case 'html':
            default:
                return beautifyHTML(code);
        }
    }

    // Публичный API
    return {
        beautify,
        beautifyJS,
        beautifyHTML,
        beautifyCSS
    };
})();

// Экспорт
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Beautifier;
}