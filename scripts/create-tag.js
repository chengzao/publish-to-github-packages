import { execa, ExecaError } from 'execa';
import fs from 'fs-extra';
import path from 'node:path';
import process from 'node:process';

const packageJsonPath = path.join(process.cwd(), './package.json');

try {
  const packageJson = await fs.readJson(packageJsonPath);
  const version = packageJson.version;
  // await execa`git tag v${version}`;
  // await execa`git push origin v${version}`;
  console.log(`Tag v${version} was created and pushed successfully.`);
} catch (error) {
  console.error('Error during tag creation:', error);
}