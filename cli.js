#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import inquirer from 'inquirer';
import readline from 'readline';
import { fileURLToPath } from 'node:url'
import { execa, ExecaError } from 'execa';

// 获取当前文件的路径
const __filename = fileURLToPath(import.meta.url);
// 获取当前文件的目录
const __dirname = path.dirname(__filename);

const packagesDir = path.join(__dirname, 'packages');

// 初始化 readline 接口
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// 读取 packages 目录下的所有一级目录中的 package.json
async function getPackages() {
    const packages = [];
    const dirs = await fs.readdir(packagesDir);

    for (const dir of dirs) {
        const packageJsonPath = path.join(packagesDir, dir, 'package.json');
        if (await fs.pathExists(packageJsonPath)) {
            const packageJson = await fs.readJson(packageJsonPath);
            packages.push({
                name: packageJson.name,
                version: packageJson.version,
                path: packageJsonPath,
                dir: path.join(packagesDir, dir),
            });
        }
    }

    return packages;
}

// 选择需要升级的 package
async function selectPackage(packages) {
    const choices = packages.map(pkg => ({
        name: `${pkg.name} (current version: ${pkg.version})`,
        value: pkg,
    }));

    const { selectedPackage } = await inquirer.prompt([
        {
            type: 'list',
            name: 'selectedPackage',
            message: 'Select a package to upgrade:',
            choices,
        },
    ]);

    return selectedPackage;
}

// 填写版本号
async function inputVersion(selectedPackage) {
    const { newVersion } = await inquirer.prompt([
        {
            type: 'input',
            name: 'newVersion',
            message: `Enter new version for ${selectedPackage.name}:`,
            default: selectedPackage.version,
            validate: input => !!input || 'Version cannot be empty!',
        },
    ]);

    return newVersion;
}

// 发布选择的 package
async function publishPackage(selectedPackage) {

    try {
        console.log(`npm publish with < ${selectedPackage.dir} > \n`)

        const { stdout } = await execa`npm run test --prefix ${selectedPackage.dir}`;

        console.log('execa stdout:', stdout);

        console.log(`Package ${selectedPackage.name} published successfully.\n`);
    } catch (error) {
        if (error instanceof ExecaError) {
            console.log('ExecaError:', error.shortMessage);
        } else {
            throw error;
        }
    }
}

// 打包tag
async function tagPackage(selectedPackage) {
    
    try {
        const { name, version } = selectedPackage
        console.log(`tagging package: ${name}@${version}`);

        // git add
        const { stdout } = await execa({stdio: 'pipe'})`git diff`;

        if (stdout) {
            await execa`git add -A`
            await execa`git commit -m "Release version ${version}"`
        } else {
            console.log('No changes to commit.');
        }

        // create tag
        await execa`git tag`
        // await execa`git tag -a ${name}@${version} -m "Release version ${version}"`;
        // await execa`git push origin ${name}@${version}`
    } catch (e) {
        // if it's a patch release, there may be no local deps to sync
        console.log('Error tagging package:', e);
    }
}

// 主函数
(async () => {
    try {
        const packages = await getPackages();
        if (packages.length === 0) {
            console.log('No packages found in the packages directory.');
            return;
        }

        const selectedPackage = await selectPackage(packages);
        const newVersion = await inputVersion(selectedPackage);

        // 更新 package.json 中的版本号
        const packageJson = await fs.readJson(selectedPackage.path);
        packageJson.version = newVersion;
        await fs.writeJson(selectedPackage.path, packageJson, { spaces: 2 });

        // 发布 package
        await publishPackage(selectedPackage);

        // 打包 git tag
        await tagPackage(packageJson);

        // 退出程序
        process.exit(0);
    } catch (error) {
        console.error(error);
    }
})();

// 监听 SIGINT
rl.on('SIGINT', () => {
    console.log('\nYou are exit the program on Ctrl+C');
    rl.close();
    process.exit(0);
});