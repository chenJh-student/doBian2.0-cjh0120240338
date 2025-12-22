const fs = require('fs');
const path = require('path');

// 复制目录的递归函数
function copyDir(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

// 复制构建结果到根目录
console.log('开始部署到根目录...');
copyDir('dist', '.');
console.log('部署完成！');

// 更新 package.json 添加部署脚本
const packagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    packageJson.scripts = packageJson.scripts || {};
    packageJson.scripts.deploy = 'npm run build && node deploy.js';
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    console.log('已添加 deploy 脚本到 package.json');
}