// 基础路径工具
export function getBasePath() {
  // 检查是否在生产环境且在GitHub Pages上
  if (window.location.hostname.includes('github.io')) {
    // 从URL中提取基础路径
    const pathParts = window.location.pathname.split('/').filter(part => part);
    // 找到仓库名部分
    if (pathParts.length > 0) {
      return `/${pathParts[0]}/`;
    }
  }
  // 本地开发环境
  return '/';
}

export const BASE_PATH = getBasePath();