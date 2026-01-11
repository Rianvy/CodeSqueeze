/**
 * Advanced Minifier Module
 * Логика минификации HTML, CSS и JavaScript
 * @version 2.0.0
 */

const Minifier = (function() {
    'use strict';

    // Приватные переменные
    let options = {
        removeComments: true,
        removeWhitespace: true,
        minifyInlineJS: true,
        minifyInlineCSS: true,
        preserveLineBreaks: false,
        collapseWhitespace: true,
        removeEmptyAttributes: true,
        sortAttributes: false,
        minifyURLs: false,
        removeAttributeQuotes: false,
        sortClassName: false
    };

    // Статистика минификации
    let stats = {
        originalSize: 0,
        minifiedSize: 0,
        savedBytes: 0,
        savedPercent: 0,
        processingTime: 0
    };

    /**
     * Установить опции минификации
     */
    function setOptions(newOptions) {
        options = { ...options, ...newOptions };
    }

    /**
     * Получить текущие опции
     */
    function getOptions() {
        return { ...options };
    }

    /**
     * Получить статистику последней минификации
     */
    function getStats() {
        return { ...stats };
    }

    /**
     * Сброс статистики
     */
    function resetStats() {
        stats = {
            originalSize: 0,
            minifiedSize: 0,
            savedBytes: 0,
            savedPercent: 0,
            processingTime: 0
        };
    }

    /**
     * Обновить статистику
     */
    function updateStats(original, minified, time) {
        stats.originalSize = original.length;
        stats.minifiedSize = minified.length;
        stats.savedBytes = original.length - minified.length;
        stats.savedPercent = ((stats.savedBytes / original.length) * 100).toFixed(2);
        stats.processingTime = time;
    }

    /**
     * минификация JavaScript
     */
    function minifyJS(code) {
        const result = [];
        let i = 0;
        const len = code.length;
        
        // Зарезервированные слова для лучшего распознавания контекста
        const keywords = new Set([
            'return', 'typeof', 'void', 'delete', 'throw', 'new', 
            'in', 'instanceof', 'case', 'yield', 'await'
        ]);
        
        while (i < len) {
            const char = code[i];
            const next = code[i + 1] || '';
            
            // Обработка строк в двойных кавычках
            if (char === '"') {
                let str = '"';
                i++;
                while (i < len) {
                    if (code[i] === '\\' && i + 1 < len) {
                        str += code[i] + code[i + 1];
                        i += 2;
                    } else if (code[i] === '"') {
                        str += '"';
                        i++;
                        break;
                    } else {
                        str += code[i];
                        i++;
                    }
                }
                result.push(str);
                continue;
            }
            
            // Обработка строк в одинарных кавычках
            if (char === "'") {
                let str = "'";
                i++;
                while (i < len) {
                    if (code[i] === '\\' && i + 1 < len) {
                        str += code[i] + code[i + 1];
                        i += 2;
                    } else if (code[i] === "'") {
                        str += "'";
                        i++;
                        break;
                    } else {
                        str += code[i];
                        i++;
                    }
                }
                result.push(str);
                continue;
            }
            
            // Обработка template literals с вложенными выражениями
            if (char === '`') {
                let str = '`';
                i++;
                let depth = 0;
                while (i < len) {
                    if (code[i] === '\\' && i + 1 < len) {
                        str += code[i] + code[i + 1];
                        i += 2;
                    } else if (code[i] === '$' && code[i + 1] === '{') {
                        str += '${';
                        i += 2;
                        depth++;
                        while (i < len && depth > 0) {
                            if (code[i] === '{') depth++;
                            if (code[i] === '}') depth--;
                            str += code[i];
                            i++;
                        }
                    } else if (code[i] === '`') {
                        str += '`';
                        i++;
                        break;
                    } else {
                        str += code[i];
                        i++;
                    }
                }
                result.push(str);
                continue;
            }
            
            // обработка регулярных выражений
            if (char === '/' && next !== '/' && next !== '*') {
                let isRegex = false;
                
                if (result.length === 0) {
                    isRegex = true;
                } else {
                    const lastToken = result[result.length - 1].trim();
                    const lastChar = lastToken[lastToken.length - 1];
                    
                    // Операторы и ключевые слова перед regex
                    if ('=([,!&|:;{}?+-%*/<>^~'.includes(lastChar) || 
                        keywords.has(lastToken)) {
                        isRegex = true;
                    }
                }
                
                if (isRegex) {
                    let regex = '/';
                    i++;
                    let inCharClass = false;
                    while (i < len) {
                        if (code[i] === '\\' && i + 1 < len) {
                            regex += code[i] + code[i + 1];
                            i += 2;
                        } else if (code[i] === '[' && !inCharClass) {
                            inCharClass = true;
                            regex += code[i];
                            i++;
                        } else if (code[i] === ']' && inCharClass) {
                            inCharClass = false;
                            regex += code[i];
                            i++;
                        } else if (code[i] === '/' && !inCharClass) {
                            regex += '/';
                            i++;
                            // Флаги regex
                            while (i < len && /[gimsuy]/.test(code[i])) {
                                regex += code[i];
                                i++;
                            }
                            break;
                        } else if (code[i] === '\n' && !inCharClass) {
                            break;
                        } else {
                            regex += code[i];
                            i++;
                        }
                    }
                    result.push(regex);
                    continue;
                }
            }
            
            // Однострочные комментарии
            if (char === '/' && next === '/') {
                if (options.removeComments) {
                    while (i < len && code[i] !== '\n') i++;
                    i++;
                    continue;
                } else {
                    let comment = '';
                    while (i < len && code[i] !== '\n') {
                        comment += code[i];
                        i++;
                    }
                    result.push(comment + '\n');
                    i++;
                    continue;
                }
            }
            
            // Многострочные комментарии
            if (char === '/' && next === '*') {
                if (options.removeComments) {
                    i += 2;
                    while (i < len - 1) {
                        if (code[i] === '*' && code[i + 1] === '/') {
                            i += 2;
                            break;
                        }
                        i++;
                    }
                    continue;
                } else {
                    let comment = '/*';
                    i += 2;
                    while (i < len - 1) {
                        comment += code[i];
                        if (code[i] === '*' && code[i + 1] === '/') {
                            comment += '/';
                            i += 2;
                            break;
                        }
                        i++;
                    }
                    result.push(comment);
                    continue;
                }
            }
            
            // обработка пробелов
            if (/\s/.test(char)) {
                if (options.removeWhitespace) {
                    const startI = i;
                    while (i < len && /\s/.test(code[i])) i++;
                    
                    if (result.length > 0 && i < len) {
                        const last = result[result.length - 1];
                        const nextChar = code[i] || '';
                        const lastC = last[last.length - 1];
                        
                        // Необходимость пробела между идентификаторами и ключевыми словами
                        const needSpace = /[a-zA-Z0-9_$]/.test(lastC) && 
                                         /[a-zA-Z0-9_$]/.test(nextChar);
                        
                        if (needSpace) {
                            result.push(' ');
                        } else if (options.preserveLineBreaks && 
                                   code.substring(startI, i).includes('\n')) {
                            result.push('\n');
                        }
                    }
                    continue;
                } else {
                    result.push(char);
                    i++;
                    continue;
                }
            }
            
            // Удаление точки с запятой перед }
            if (options.removeWhitespace && char === ';') {
                let j = i + 1;
                while (j < len && /\s/.test(code[j])) j++;
                if (code[j] === '}') {
                    i++;
                    continue;
                }
            }
            
            result.push(char);
            i++;
        }
        
        return result.join('');
    }

    /**
     * минификация CSS
     */
    function minifyCSS(code) {
        const result = [];
        let i = 0;
        const len = code.length;
        
        while (i < len) {
            const char = code[i];
            const next = code[i + 1] || '';
            
            // Строки в кавычках
            if (char === '"' || char === "'") {
                const quote = char;
                let str = quote;
                i++;
                while (i < len) {
                    if (code[i] === '\\' && i + 1 < len) {
                        str += code[i] + code[i + 1];
                        i += 2;
                    } else if (code[i] === quote) {
                        str += quote;
                        i++;
                        break;
                    } else {
                        str += code[i];
                        i++;
                    }
                }
                result.push(str);
                continue;
            }
            
            // url() с улучшенной обработкой
            if (code.substr(i, 4).toLowerCase() === 'url(') {
                let url = 'url(';
                i += 4;
                
                // Пропуск пробелов
                while (i < len && /\s/.test(code[i])) i++;
                
                if (code[i] === '"' || code[i] === "'") {
                    const q = code[i];
                    url += q;
                    i++;
                    while (i < len && code[i] !== q) {
                        if (code[i] === '\\') {
                            url += code[i] + code[i + 1];
                            i += 2;
                        } else {
                            url += code[i];
                            i++;
                        }
                    }
                    if (i < len) { url += q; i++; }
                } else {
                    while (i < len && code[i] !== ')' && !/\s/.test(code[i])) { 
                        url += code[i]; 
                        i++; 
                    }
                }
                
                while (i < len && /\s/.test(code[i])) i++;
                if (i < len && code[i] === ')') { url += ')'; i++; }
                result.push(url);
                continue;
            }
            
            // Комментарии
            if (char === '/' && next === '*') {
                // Сохранение важных комментариев (/*! ... */)
                if (code[i + 2] === '!') {
                    let comment = '/*';
                    i += 2;
                    while (i < len - 1) {
                        comment += code[i];
                        if (code[i] === '*' && code[i + 1] === '/') {
                            comment += '/';
                            i += 2;
                            break;
                        }
                        i++;
                    }
                    if (!options.removeComments) result.push(comment);
                    continue;
                }
                
                if (options.removeComments) {
                    i += 2;
                    while (i < len - 1) {
                        if (code[i] === '*' && code[i + 1] === '/') { 
                            i += 2; 
                            break; 
                        }
                        i++;
                    }
                    continue;
                }
            }
            
            // Пробелы с улучшенной логикой
            if (/\s/.test(char)) {
                if (options.collapseWhitespace) {
                    while (i < len && /\s/.test(code[i])) i++;
                    
                    if (result.length > 0 && i < len) {
                        const last = result[result.length - 1];
                        const nextChar = code[i] || '';
                        const lastC = last[last.length - 1];
                        
                        // Пробел необходим между определенными символами
                        const needSpace = (
                            (/[a-zA-Z0-9_\-\)]/.test(lastC) && 
                             /[a-zA-Z0-9_\.\#\-\[]/.test(nextChar)) ||
                            (lastC === ')' && nextChar === '{')
                        );
                        
                        if (needSpace) result.push(' ');
                    }
                    continue;
                } else {
                    result.push(char);
                    i++;
                    continue;
                }
            }
            
            // Удаление ; перед }
            if (options.removeWhitespace && char === ';') {
                let j = i + 1;
                while (j < len && /\s/.test(code[j])) j++;
                if (code[j] === '}') { 
                    i++; 
                    continue; 
                }
            }
            
            // Удаление 0 перед единицами измерения (0px -> 0)
            if (char === '0') {
                const units = ['px', 'em', 'rem', 'vh', 'vw', '%', 'pt', 'cm', 'mm'];
                const substr = code.substr(i + 1, 3).toLowerCase();
                for (const unit of units) {
                    if (substr.startsWith(unit)) {
                        const before = result[result.length - 1];
                        const beforeChar = before ? before[before.length - 1] : '';
                        if (',:;{}'.includes(beforeChar) || /\s/.test(beforeChar)) {
                            result.push('0');
                            i += 1 + unit.length;
                            // Пропуск пробелов после единицы
                            while (i < len && /\s/.test(code[i])) i++;
                            continue;
                        }
                        break;
                    }
                }
            }
            
            // Сокращение цветов (#ffffff -> #fff)
            if (char === '#' && /[0-9a-fA-F]{6}/.test(code.substr(i + 1, 6))) {
                const color = code.substr(i + 1, 6);
                if (color[0] === color[1] && 
                    color[2] === color[3] && 
                    color[4] === color[5]) {
                    result.push('#' + color[0] + color[2] + color[4]);
                    i += 7;
                    continue;
                }
            }
            
            result.push(char);
            i++;
        }
        
        return result.join('');
    }

    /**
     * минификация HTML
     */
    function minifyHTML(code) {
        const result = [];
        let i = 0;
        const len = code.length;
        let inScript = false;
        let inStyle = false;
        let inPre = false;
        let scriptContent = '';
        let styleContent = '';
        
        // Теги, которые нельзя сжимать
        const preserveTags = new Set(['pre', 'textarea', 'script', 'style', 'code']);
        
        while (i < len) {
            // Открывающий тег script
            if (!inScript && code.substr(i, 7).toLowerCase() === '<script') {
                let tagEnd = code.indexOf('>', i);
                if (tagEnd !== -1) {
                    let tag = code.substring(i, tagEnd + 1);
                    
                    // Проверка на внешний скрипт
                    const hasSrc = /\ssrc\s*=/i.test(tag);
                    
                    // Удаление type="text/javascript"
                    if (options.removeEmptyAttributes) {
                        tag = tag.replace(/\s+type\s*=\s*["']?text\/javascript["']?/gi, '');
                    }
                    
                    result.push(tag);
                    i = tagEnd + 1;
                    
                    if (!hasSrc) {
                        inScript = true;
                        scriptContent = '';
                    }
                    continue;
                }
            }
            
            // Закрывающий тег script
            if (inScript && code.substr(i, 9).toLowerCase() === '</script>') {
                if (options.minifyInlineJS && scriptContent.trim()) {
                    result.push(minifyJS(scriptContent));
                } else {
                    result.push(scriptContent);
                }
                result.push('</script>');
                i += 9;
                inScript = false;
                scriptContent = '';
                continue;
            }
            
            if (inScript) { 
                scriptContent += code[i]; 
                i++; 
                continue; 
            }
            
            // Открывающий тег style
            if (!inStyle && code.substr(i, 6).toLowerCase() === '<style') {
                let tagEnd = code.indexOf('>', i);
                if (tagEnd !== -1) {
                    let tag = code.substring(i, tagEnd + 1);
                    
                    if (options.removeEmptyAttributes) {
                        tag = tag.replace(/\s+type\s*=\s*["']?text\/css["']?/gi, '');
                    }
                    
                    result.push(tag);
                    i = tagEnd + 1;
                    inStyle = true;
                    styleContent = '';
                    continue;
                }
            }
            
            // Закрывающий тег style
            if (inStyle && code.substr(i, 8).toLowerCase() === '</style>') {
                if (options.minifyInlineCSS && styleContent.trim()) {
                    result.push(minifyCSS(styleContent));
                } else {
                    result.push(styleContent);
                }
                result.push('</style>');
                i += 8;
                inStyle = false;
                styleContent = '';
                continue;
            }
            
            if (inStyle) { 
                styleContent += code[i]; 
                i++; 
                continue; 
            }
            
            // Определение pre, textarea и других preserve-тегов
            if (code[i] === '<') {
                const tagMatch = code.substr(i).match(/^<(\/?)(\w+)/);
                if (tagMatch) {
                    const isClosing = tagMatch[1] === '/';
                    const tagName = tagMatch[2].toLowerCase();
                    
                    if (preserveTags.has(tagName)) {
                        if (!isClosing && tagName !== 'script' && tagName !== 'style') {
                            inPre = true;
                        } else if (isClosing) {
                            const tagEnd = code.indexOf('>', i);
                            if (tagEnd !== -1) {
                                result.push(code.substring(i, tagEnd + 1));
                                i = tagEnd + 1;
                                inPre = false;
                                continue;
                            }
                        }
                    }
                }
            }
            
            // HTML комментарии
            if (code.substr(i, 4) === '<!--') {
                // Сохранение conditional comments для IE
                if (code.substr(i, 5) === '<!--[' || code.substr(i, 9) === '<!--<![') {
                    const endC = code.indexOf('-->', i);
                    if (endC !== -1) { 
                        result.push(code.substring(i, endC + 3)); 
                        i = endC + 3; 
                        continue; 
                    }
                }
                
                if (options.removeComments) {
                    const endC = code.indexOf('-->', i);
                    if (endC !== -1) { 
                        i = endC + 3; 
                        continue; 
                    }
                } else {
                    const endC = code.indexOf('-->', i);
                    if (endC !== -1) {
                        result.push(code.substring(i, endC + 3));
                        i = endC + 3;
                        continue;
                    }
                }
            }
            
            // обработка пробелов
            if (options.collapseWhitespace && !inPre && /\s/.test(code[i])) {
                const startI = i;
                while (i < len && /\s/.test(code[i])) i++;
                
                const lastR = result.join('');
                const nextC = code[i] || '';
                
                // Удаление пробелов между тегами
                if (lastR.endsWith('>') && nextC === '<') {
                    continue;
                }
                
                // Сохранение одного пробела в тексте
                if (lastR.length > 0 && !lastR.endsWith('>') && nextC && nextC !== '<') {
                    if (options.preserveLineBreaks && 
                        code.substring(startI, i).includes('\n')) {
                        result.push('\n');
                    } else {
                        result.push(' ');
                    }
                }
                continue;
            }
            
            // Обработка атрибутов тега
            if (code[i] === '<' && code[i + 1] !== '/' && code[i + 1] !== '!') {
                const tagEnd = code.indexOf('>', i);
                if (tagEnd !== -1) {
                    let tag = code.substring(i, tagEnd + 1);
                    
                    // Удаление пустых атрибутов
                    if (options.removeEmptyAttributes) {
                        tag = tag.replace(/\s+(\w+)\s*=\s*["']["']/g, '');
                    }
                    
                    result.push(tag);
                    i = tagEnd + 1;
                    continue;
                }
            }
            
            result.push(code[i]);
            i++;
        }
        
        return result.join('').trim();
    }

    /**
     * Минифицировать код с замером производительности
     */
    function minify(code, type = 'html') {
        const startTime = performance.now();
        let result = '';
        
        switch (type.toLowerCase()) {
            case 'js':
            case 'javascript':
                result = minifyJS(code);
                break;
            case 'css':
                result = minifyCSS(code);
                break;
            case 'html':
            default:
                result = minifyHTML(code);
                break;
        }
        
        const endTime = performance.now();
        updateStats(code, result, (endTime - startTime).toFixed(2));
        
        return result;
    }

    /**
     * Пакетная минификация множества файлов
     */
    function minifyBatch(files) {
        const results = [];
        const totalStart = performance.now();
        
        for (const file of files) {
            const result = {
                name: file.name,
                type: file.type,
                original: file.content,
                minified: minify(file.content, file.type),
                stats: { ...stats }
            };
            results.push(result);
        }
        
        const totalTime = performance.now() - totalStart;
        
        return {
            results,
            totalTime: totalTime.toFixed(2),
            totalSaved: results.reduce((sum, r) => sum + r.stats.savedBytes, 0)
        };
    }

    /**
     * Валидация кода перед минификацией
     */
    function validate(code, type) {
        const errors = [];
        
        if (!code || typeof code !== 'string') {
            errors.push('Код должен быть непустой строкой');
        }
        
        if (type === 'html') {
            // Базовая проверка парности тегов
            const openTags = (code.match(/<[^\/][^>]*>/g) || []).length;
            const closeTags = (code.match(/<\/[^>]+>/g) || []).length;
            if (Math.abs(openTags - closeTags) > 5) {
                errors.push('Возможно несбалансированные теги');
            }
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    }

    // Публичный API
    return {
        minify,
        minifyJS,
        minifyCSS,
        minifyHTML,
        minifyBatch,
        setOptions,
        getOptions,
        getStats,
        resetStats,
        validate,
        version: '2.0.0'
    };
})();

// Экспорт
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Minifier;
}
if (typeof window !== 'undefined') {
    window.Minifier = Minifier;
}