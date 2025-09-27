#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

// 支持的平台类型
const PLATFORMS = {
  PC: 'PC',
  MOBILE: 'MOBILE', 
  TV: 'TV'
};

// 命令行参数解析
const args = process.argv.slice(2);
const platform = args[0]?.toUpperCase();
const isDev = args.includes('--dev');

// 验证平台参数
if (!platform || !PLATFORMS[platform]) {
  console.error('请指定平台: pc, mobile 或 tv');
  console.log('用法: npm run build <platform> [--dev]');
  process.exit(1);
}

console.log(`开始构建 ${platform} 平台${isDev ? '开发环境' : '生产环境'}...`);

// 获取项目根目录（脚本所在目录的上一级）
const rootDir = path.resolve(__dirname, '..');

// 文件路径（基于项目根目录）
const configJsPath = path.resolve(rootDir, 'src/utils/config.js');
const pagesJsonPath = path.resolve(rootDir, 'src/pages.json');
const templateDir = path.resolve(rootDir, 'config-pages-json');

console.log('项目根目录:', rootDir);
console.log('config.js 路径:', configJsPath);
console.log('pages.json 路径:', pagesJsonPath);

// 修改config.js文件
function modifyConfigJs() {
  try {
    let content = fs.readFileSync(configJsPath, 'utf8');
    
    // 使用正则表达式替换PLATFORM的值
    const pattern = /(export const PLATFORM = ')(.*)(')/;
    content = content.replace(pattern, `$1${platform}$3`);
    
    fs.writeFileSync(configJsPath, content, 'utf8');
    console.log('✓ 成功修改 config.js 中的 PLATFORM');
    return true;
  } catch (error) {
    console.error('✗ 修改 config.js 失败:', error.message);
    return false;
  }
}

// 使用模板替换pages.json
function replacePagesJson() {
  try {
    const templatePath = path.join(templateDir, `${platform.toLowerCase()}-pages.json`);
    
    if (!fs.existsSync(templatePath)) {
      console.error(`✗ 模板文件不存在: ${templatePath}`);
      return false;
    }
    
    const templateContent = fs.readFileSync(templatePath, 'utf8');
    fs.writeFileSync(pagesJsonPath, templateContent, 'utf8');
    console.log('✓ 成功应用 pages.json 模板');
    return true;
  } catch (error) {
    console.error('✗ 替换 pages.json 失败:', error.message);
    return false;
  }
}

// 主函数
async function main() {
  try {
    // 修改配置文件
    if (!modifyConfigJs() || !replacePagesJson()) {
      process.exit(1);
    }
    
    console.log(`✓ ${platform} 平台配置修改完成!`);
    console.log('配置文件已更新，请使用 uni 命令启动开发服务器或构建');
    
  } catch (error) {
    console.error('配置修改过程出错:', error.message);
    process.exit(1);
  }
}

// 执行主函数
main();