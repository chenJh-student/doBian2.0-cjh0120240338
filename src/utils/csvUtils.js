// src/utils/csvUtils.js
import { BASE_PATH } from './basePath.js';

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

import Papa from 'papaparse';

// 修正CSV文件路径
export async function loadMovieData() {
  try {
    const response = await fetch(`${BASE_PATH}data/movie_info.csv`);
    const csvText = await response.text();
    
    return Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true
    }).data;
  } catch (error) {
    console.error('加载电影数据失败:', error);
    return [];
  }
}

export async function loadComments() {
  try {
    const response = await fetch(`${BASE_PATH}data/comment.csv`);
    const csvText = await response.text();
    
    return Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true
    }).data;
  } catch (error) {
    console.error('加载评论数据失败:', error);
    return [];
  }
}

export async function loadUsers() {
  try {
    const response = await fetch(`${BASE_PATH}data/user.csv`);
    const csvText = await response.text();
    
    return Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true
    }).data;
  } catch (error) {
    console.error('加载用户数据失败:', error);
    return [];
  }
}