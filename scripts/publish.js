#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 获取当前版本号
const packageJsonPath = path.join(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
const version = packageJson.version;

// 发布 npm 包
try {
    console.log('Publishing package...');
    execSync('npm publish', { stdio: 'inherit' });
    console.log('Package published successfully.');

    // 创建 Git 标签
    const tag = `v${version}`;
    execSync(`git tag -a ${tag} -m "Release version ${version}"`, { stdio: 'inherit' });
    console.log(`Tag created: ${tag}`);

    // 推送标签到远程
    execSync(`git push origin ${tag}`, { stdio: 'inherit' });
    console.log(`Tag pushed to remote: ${tag}`);
} catch (error) {
    console.error('Error during publish:', error.message);
    process.exit(1);
}