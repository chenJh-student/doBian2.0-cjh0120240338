// src/utils/csvUtils.js
export const parseCSVLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            // 检查是否是转义的引号
            if (i + 1 < line.length && line[i + 1] === '"') {
                current += '"';
                i++; // 跳过下一个引号
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }

    result.push(current.trim());
    return result;
};

export const splitCSVLines = (text) => {
    const lines = [];
    let currentLine = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];

        if (char === '"') {
            // 检查是否是转义的引号
            if (i + 1 < text.length && text[i + 1] === '"') {
                currentLine += '""';
                i++; // 跳过下一个引号
                continue;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === '\n' && !inQuotes) {
            lines.push(currentLine);
            currentLine = '';
            continue;
        }

        currentLine += char;
    }

    // 添加最后一行（如果没有以换行符结尾）
    if (currentLine) {
        lines.push(currentLine);
    }

    return lines;
};

export const loadDataFromCSV = async(filePath) => {
    try {
        const response = await fetch(filePath);
        const text = await response.text();
        return text;
    } catch (error) {
        console.error(`加载数据失败: ${error.message}`);
        throw error;
    }
};